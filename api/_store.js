// Etat partage de l'exercice (session + equipes + tentatives), un seul fichier JSON prive dans Vercel Blob.
// - Lectures servies depuis un cache memoire de quelques secondes : le quota Blob du plan Hobby est faible
//   (10 000 lectures et 2 000 ecritures par mois, blocage 30 jours en cas de depassement).
// - Ecritures en concurrence optimiste (ETag / ifMatch) : deux eleves qui rejoignent la meme equipe
//   au meme instant ne s'ecrasent pas, la seconde ecriture est rejouee sur l'etat a jour.
// - Mode local (tests) : si LOCAL_STATE_FILE est defini, l'etat est un simple fichier JSON.
const fs = require('fs');

const PATH = 'state.json';
const READ_TTL_MS = 5000;
let cache = null; // { state, etag, at }

function defaultState() {
  return { v: 1, session: { status: 'idle', endAt: null, durationMin: 10, missionMin: 160, missionEndAt: null, missionLeftMs: null, updatedAt: 0 }, teams: {} };
}

function blob() { return require('@vercel/blob'); }

async function readFresh() {
  if (process.env.LOCAL_STATE_FILE) {
    try {
      const txt = fs.readFileSync(process.env.LOCAL_STATE_FILE, 'utf8');
      return { state: { ...defaultState(), ...JSON.parse(txt) }, etag: String(fs.statSync(process.env.LOCAL_STATE_FILE).mtimeMs) };
    } catch (e) { return { state: defaultState(), etag: null }; }
  }
  const res = await blob().get(PATH, { access: 'private', useCache: false });
  if (!res || res.statusCode !== 200) return { state: defaultState(), etag: null };
  const txt = await new Response(res.stream).text();
  return { state: { ...defaultState(), ...JSON.parse(txt) }, etag: res.blob.etag };
}

async function writeState(state, etag) {
  const body = JSON.stringify(state);
  if (process.env.LOCAL_STATE_FILE) {
    fs.writeFileSync(process.env.LOCAL_STATE_FILE, body);
    return String(fs.statSync(process.env.LOCAL_STATE_FILE).mtimeMs);
  }
  const opts = { access: 'private', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60 };
  if (etag) opts.ifMatch = etag; // sinon : creation, echoue si le fichier existe deja (allowOverwrite false)
  const r = await blob().put(PATH, body, opts);
  return r.etag || null;
}

// Lecture (eventuellement depuis le cache memoire de l'instance).
async function read() {
  if (cache && Date.now() - cache.at < READ_TTL_MS) return cache.state;
  const { state, etag } = await readFresh();
  cache = { state, etag, at: Date.now() };
  return state;
}

// Modification atomique : fn(state) modifie l'etat en place et renvoie un resultat.
// Si fn renvoie { error }, rien n'est ecrit.
async function mutate(fn) {
  let lastErr;
  for (let i = 0; i < 6; i++) {
    const { state, etag } = await readFresh();
    const result = fn(state) || {};
    if (result.error) { cache = { state, etag, at: Date.now() }; return result; }
    try {
      const newEtag = await writeState(state, etag);
      cache = { state, etag: newEtag, at: Date.now() };
      return result;
    } catch (e) {
      lastErr = e;
      const conflict = /precondition|already exists|412|409/i.test(String((e && (e.name + ' ' + e.message)) || e));
      if (!conflict) throw e;
      await new Promise(r => setTimeout(r, 80 + Math.random() * 220));
    }
  }
  throw lastErr || new Error('conflict');
}

module.exports = { read, mutate, defaultState };
