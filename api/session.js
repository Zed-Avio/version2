// API d'animation de l'exercice ELECARM Crisis2.
// Etat partage (salle d'attente / lancement) stocke dans Vercel Blob.
// GET  /api/session            -> lit l'etat courant (public, pour les eleves)
// POST /api/session {password, action, durationMin} -> modifie l'etat (anime, protege par mot de passe)
const { put, list } = require('@vercel/blob');

const PATH = 'session.json';
const DEFAULT = { status: 'idle', endAt: null, durationMin: 90, updatedAt: 0 };

function clampMin(v, fallback) {
  v = parseInt(v, 10);
  if (!Number.isFinite(v) || v < 1) return fallback || 90;
  return Math.min(600, v);
}

async function readState() {
  try {
    const { blobs } = await list({ prefix: PATH, limit: 1 });
    if (!blobs || !blobs.length) return { ...DEFAULT };
    const r = await fetch(blobs[0].url + '?ts=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return { ...DEFAULT };
    const s = await r.json();
    return { ...DEFAULT, ...s };
  } catch (e) {
    return { ...DEFAULT };
  }
}

async function writeState(state) {
  await put(PATH, JSON.stringify(state), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 0,
  });
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const st = await readState();
    res.status(200).json(st);
    return;
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    if (!body || typeof body !== 'object') body = {};

    const pass = body.password || req.headers['x-anim-pass'];
    if (!process.env.ANIM_PASSWORD || pass !== process.env.ANIM_PASSWORD) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }

    const cur = await readState();
    const action = body.action;
    let next;
    if (action === 'waiting') {
      next = { status: 'waiting', endAt: null, durationMin: clampMin(body.durationMin, cur.durationMin), updatedAt: Date.now() };
    } else if (action === 'start') {
      const d = clampMin(body.durationMin, cur.durationMin);
      next = { status: 'running', durationMin: d, endAt: Date.now() + d * 60000, updatedAt: Date.now() };
    } else if (action === 'reset' || action === 'idle') {
      next = { status: 'idle', endAt: null, durationMin: clampMin(body.durationMin, cur.durationMin), updatedAt: Date.now() };
    } else {
      res.status(400).json({ error: 'bad action' });
      return;
    }

    try {
      await writeState(next);
    } catch (e) {
      res.status(500).json({ error: 'storage', detail: String(e && e.message || e) });
      return;
    }
    res.status(200).json(next);
    return;
  }

  res.status(405).json({ error: 'method not allowed' });
};
