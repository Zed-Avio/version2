// Version de secours : fait tourner tout le site (pages + API) sur un seul ordinateur, sans Vercel ni quota.
// Les eleves ouvrent l'adresse affichee au demarrage (meme reseau Wi-Fi ou filaire que cet ordinateur).
//
// Lancement (Node 18 ou plus) :
//   ANIM_PASSWORD='votre-mot-de-passe' node serveur-local.js
// Option : PORT=3000 (defaut), STATE_FILE=./etat-local.json (defaut).
//
// L'etat (groupes, tentatives, messages) est dans un simple fichier JSON, un seul processus l'ecrit :
// pas de conflits d'ecriture.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = __dirname;
const PORT = parseInt(process.env.PORT, 10) || 3000;

if (!process.env.ANIM_PASSWORD) {
  console.error('Mot de passe animateur manquant. Lancez par exemple :\n  ANIM_PASSWORD=\'mon-mot-de-passe\' node serveur-local.js');
  process.exit(1);
}
process.env.LOCAL_STATE_FILE = path.resolve(ROOT, process.env.STATE_FILE || 'etat-local.json');

// Memes redirections que vercel.json
const REWRITES = { '/': '/index.html', '/exercice': '/index.html', '/exercice/': '/index.html', '/salle': '/salle.html', '/animateur': '/animateur.html' };
// Ce que Vercel ne publie pas (voir .vercelignore) ou qui n'a rien a faire sur le reseau : jamais servi.
const BLOCKED_TOP = new Set(['api', 'node_modules', '.git', '.vercel', '.playwright-mcp', 'tex', 'ffuf', 'qcm-insa']);
const ALLOWED_EXT = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.avif': 'image/avif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.css': 'text/css; charset=utf-8', '.ico': 'image/x-icon' };
const API = { session: require('./api/session.js'), team: require('./api/team.js') };

function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', c => { b += c; if (b.length > 1e6) { reject(new Error('trop gros')); req.destroy(); } });
    req.on('end', () => resolve(b));
    req.on('error', reject);
  });
}

async function handleApi(req, res, url) {
  const name = url.pathname.replace(/^\/api\//, '').replace(/\/$/, '');
  const handler = Object.prototype.hasOwnProperty.call(API, name) ? API[name] : null;
  if (!handler) { res.statusCode = 404; res.end('not found'); return; }
  const raw = req.method === 'POST' ? await readBody(req) : '';
  req.query = Object.fromEntries(url.searchParams);
  try { req.body = raw ? JSON.parse(raw) : undefined; } catch (e) { req.body = undefined; }
  res.status = c => { res.statusCode = c; return res; };
  res.json = o => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); };
  await handler(req, res);
}

function serveStatic(req, res, url) {
  let p;
  try { p = decodeURIComponent(url.pathname); } catch (e) { res.statusCode = 400; res.end('bad request'); return; }
  p = REWRITES[p] || p;
  const full = path.normalize(path.join(ROOT, p));
  const rel = path.relative(ROOT, full);
  const top = rel.split(path.sep)[0];
  const ext = path.extname(full).toLowerCase();
  if (rel.startsWith('..') || path.isAbsolute(rel) || BLOCKED_TOP.has(top) || top.startsWith('.') || !ALLOWED_EXT[ext]) { res.statusCode = 404; res.end('not found'); return; }
  fs.readFile(full, (err, data) => {
    if (err) { res.statusCode = 404; res.end('not found'); return; }
    res.setHeader('Content-Type', ALLOWED_EXT[ext]);
    res.setHeader('Cache-Control', ext === '.html' ? 'no-store' : 'public, max-age=3600');
    res.end(data);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://local');
  try {
    if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
    else serveStatic(req, res, url);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); }
    res.end(JSON.stringify({ error: 'storage', message: 'Erreur du serveur local.' }));
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log('Serveur de secours ELECARM demarre. Etat : ' + process.env.LOCAL_STATE_FILE);
  console.log('\nAdresses a donner aux eleves (meme reseau que cet ordinateur) :');
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === 'IPv4' && !i.internal) console.log('  http://' + i.address + ':' + PORT + '/salle');
  }
  console.log('\nConsole animateur : http://localhost:' + PORT + '/animateur');
  console.log('Arret : Ctrl+C. Ne fermez pas cet ordinateur ni le terminal pendant la seance.');
});
