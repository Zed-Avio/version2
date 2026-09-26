// Petites fonctions partagees par les routes de l'API.
const crypto = require('crypto');
const { MAX_ATTEMPTS } = require('./_grade');

const MAX_MEMBERS = 6;       // places par groupe par defaut (reglable groupe par groupe dans la console)
const MAX_CAPACITY = 12;     // plafond du reglage de places
const MAX_TEAMS = 40;
const MAX_MESSAGES = 200;   // par equipe (les plus anciens sont retires au-dela)
const MAX_MSG_LEN = 500;

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

function capacity(t) { return t.capacity || MAX_MEMBERS; }
// Ordre d'affichage : TD1, TD2... puis numero de groupe ; les anciennes equipes sans TD a la fin.
function sortTeams(list) {
  const tdn = t => t.td ? parseInt(String(t.td).replace(/\D/g, ''), 10) || 0 : 999;
  return list.slice().sort((a, b) => tdn(a) - tdn(b) || (a.num || 0) - (b.num || 0) || a.createdAt - b.createdAt);
}
// Membre retrouve par son identifiant, quel que soit son groupe : l'animateur peut l'avoir deplace.
function findMember(st, teamId, memberId) {
  if (!memberId) return {};
  const first = teamId && st.teams[teamId];
  const list = first ? [first].concat(Object.values(st.teams)) : Object.values(st.teams);
  for (const t of list) { const m = t.members.find(x => x.id === memberId); if (m) return { t, m }; }
  return {};
}

// Vue publique : jamais les identifiants secrets des membres, ni les reponses des autres equipes.
function publicView(st, teamId, memberId) {
  const s = st.session;
  const out = {
    status: s.status, endAt: s.endAt, durationMin: s.durationMin, updatedAt: s.updatedAt,
    missionMin: s.missionMin || 240, missionEndAt: s.missionEndAt || null, missionLeftMs: s.missionLeftMs == null ? null : s.missionLeftMs,
    serverNow: Date.now(), open: isOpen(s), rev: st.rev || 0,
    alerts: (st.alerts || []).slice(-5),
    teams: sortTeams(Object.values(st.teams))
      .map(t => ({ id: t.id, name: t.name, td: t.td || null, num: t.num || null, capacity: capacity(t), count: t.members.length, members: t.members.map(m => m.name) })),
  };
  if (teamId || memberId) {
    const { t } = findMember(st, teamId, memberId);
    if (t) {
      out.me = {
        team: { id: t.id, name: t.name, td: t.td || null, capacity: capacity(t), members: t.members.map(m => m.name) },
        attempts: t.attempts.map(a => ({ n: a.n, at: a.at, by: a.by, tier: a.tier, answers: a.answers, choices: a.choices })),
        left: Math.max(0, MAX_ATTEMPTS - t.attempts.length),
        locked: !!t.success || t.attempts.length >= MAX_ATTEMPTS,
        success: !!t.success,
        // Discussion avec l'animateur : messages de l'equipe + messages envoyes a toutes les equipes
        messages: (t.messages || []).concat((st.broadcasts || []).map(b => ({ ...b, from: 'anim', all: true })))
          .sort((a, b) => a.at - b.at),
      };
    } else out.me = null;
  }
  return out;
}

function pushMessage(list, msg) {
  list.push(msg);
  if (list.length > MAX_MESSAGES) list.splice(0, list.length - MAX_MESSAGES);
}
function cleanText(v) { return String(v == null ? '' : v).replace(/[<>]/g, '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, MAX_MSG_LEN); }

module.exports = { parseBody, clean, cleanText, newId, isOpen, publicView, pushMessage, capacity, sortTeams, findMember, MAX_MEMBERS, MAX_CAPACITY, MAX_TEAMS };
