// Petites fonctions partagees par les routes de l'API.
const crypto = require('crypto');
const { MAX_ATTEMPTS } = require('./_grade');

const MAX_MEMBERS = 8;
const MAX_TEAMS = 30;

function parseBody(req) {
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  return b && typeof b === 'object' ? b : {};
}
function clean(v, max) { return String(v == null ? '' : v).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max); }
function newId() { return crypto.randomBytes(8).toString('hex'); }
// Exercice ouvert = lance et compte a rebours termine. Le minuteur de l'exercice est indicatif :
// arrive a zero, il ne ferme rien (seul l'animateur ferme l'exercice).
function isOpen(s) { return s.status === 'running' && !!s.endAt && Date.now() >= s.endAt; }

// Vue publique : jamais les identifiants secrets des membres, ni les reponses des autres equipes.
function publicView(st, teamId, memberId) {
  const s = st.session;
  const out = {
    status: s.status, endAt: s.endAt, durationMin: s.durationMin, updatedAt: s.updatedAt,
    missionMin: s.missionMin || 160, missionEndAt: s.missionEndAt || null, missionLeftMs: s.missionLeftMs == null ? null : s.missionLeftMs,
    serverNow: Date.now(), open: isOpen(s),
    teams: Object.values(st.teams).sort((a, b) => a.createdAt - b.createdAt)
      .map(t => ({ id: t.id, name: t.name, count: t.members.length, members: t.members.map(m => m.name) })),
  };
  if (teamId) {
    const t = st.teams[teamId];
    if (t && t.members.some(m => m.id === memberId)) {
      out.me = {
        team: { id: t.id, name: t.name, members: t.members.map(m => m.name) },
        attempts: t.attempts.map(a => ({ n: a.n, at: a.at, by: a.by, tier: a.tier, answers: a.answers, choices: a.choices })),
        left: Math.max(0, MAX_ATTEMPTS - t.attempts.length),
        locked: !!t.success || t.attempts.length >= MAX_ATTEMPTS,
        success: !!t.success,
      };
    } else out.me = null;
  }
  return out;
}

module.exports = { parseBody, clean, newId, isOpen, publicView, MAX_MEMBERS, MAX_TEAMS };
