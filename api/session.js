// API d'animation de l'exercice ELECARM Crisis2.
// GET  /api/session[?team=&member=]  -> etat public (salle d'attente, equipes, et tentatives de SON equipe)
// POST /api/session {password, action, ...} -> console animateur (protege par ANIM_PASSWORD)
//   actions : waiting | start | open | close | reset | setTimer | addTime | state
//             deleteTeam | removeMember | resetAttempts | wipeTeams
const store = require('./_store');
const { parseBody, clean, publicView } = require('./_util');
const { publicQuestions } = require('./_grade');

function clampMin(v, fallback) {
  v = parseInt(v, 10);
  if (!Number.isFinite(v) || v < 1) return fallback || 10;
  return Math.min(600, v);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      const st = await store.read();
      const q = req.query || {};
      const view = publicView(st, q.team ? String(q.team) : null, q.member ? String(q.member) : null);
      if (q.withQuestions) view.questions = publicQuestions();   // une fois, a l'ouverture de l'exercice
      res.status(200).json(view);
    } catch (e) {
      res.status(503).json({ error: 'storage', detail: String(e && e.message || e) });
    }
    return;
  }

  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }

  const body = parseBody(req);
  const pass = body.password || req.headers['x-anim-pass'];
  if (!process.env.ANIM_PASSWORD || pass !== process.env.ANIM_PASSWORD) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const action = body.action;
  try {
    if (action === 'state' || action === 'noop') {
      const st = await store.read();
      res.status(200).json({ ...st, serverNow: Date.now() });
      return;
    }
    const known = ['waiting', 'start', 'open', 'close', 'reset', 'setTimer', 'addTime', 'deleteTeam', 'removeMember', 'resetAttempts', 'wipeTeams'];
    if (!known.includes(action)) { res.status(400).json({ error: 'bad action' }); return; }

    const result = await store.mutate(st => {
      const s = st.session, now = Date.now();
      const d = clampMin(body.durationMin, s.durationMin);             // compte a rebours avant ouverture
      const M = clampMin(body.missionMin, s.missionMin || 160);         // minuteur de l'exercice
      const base = { durationMin: d, missionMin: M, updatedAt: now };
      // Minuteur : missionEndAt quand l'exercice tourne, missionLeftMs quand il est en pause (ferme).
      if (action === 'waiting') st.session = { ...base, status: 'waiting', endAt: null, missionEndAt: null, missionLeftMs: null };
      else if (action === 'start') { const e = now + d * 60000; st.session = { ...base, status: 'running', endAt: e, missionEndAt: e + M * 60000, missionLeftMs: null }; }
      else if (action === 'open') {
        const resume = s.status === 'closed' && s.missionLeftMs != null;   // reouverture : le minuteur reprend
        st.session = { ...base, status: 'running', endAt: now, missionEndAt: now + (resume ? s.missionLeftMs : M * 60000), missionLeftMs: null };
      }
      else if (action === 'close') {
        let left = s.missionLeftMs != null ? s.missionLeftMs : null;
        if (s.status === 'running' && s.missionEndAt) left = Math.max(0, s.missionEndAt - Math.max(now, s.endAt || now));
        st.session = { ...base, status: 'closed', endAt: null, missionEndAt: null, missionLeftMs: left };
      }
      else if (action === 'reset') st.session = { ...base, status: 'idle', endAt: null, missionEndAt: null, missionLeftMs: null };
      else if (action === 'setTimer' || action === 'addTime') {
        const delta = Math.max(-600, Math.min(600, parseInt(body.deltaMin, 10) || 0)) * 60000;
        if (s.status === 'running' && s.missionEndAt) {
          const start = Math.max(now, s.endAt || now);
          s.missionEndAt = action === 'setTimer' ? start + M * 60000 : Math.max(start, Math.max(start, s.missionEndAt) + delta);
        } else if (s.status === 'closed') {
          s.missionLeftMs = action === 'setTimer' ? M * 60000 : Math.max(0, (s.missionLeftMs || 0) + delta);
        } else return { error: 'Le minuteur ne se règle que pendant l\'exercice.' };
        s.missionMin = M; s.updatedAt = now;
      }
      else if (action === 'wipeTeams') st.teams = {};
      else {
        const t = st.teams[clean(body.teamId, 40)];
        if (!t) return { error: 'team not found' };
        if (action === 'deleteTeam') delete st.teams[t.id];
        else if (action === 'resetAttempts') { t.attempts = []; t.success = false; }
        else if (action === 'removeMember') t.members = t.members.filter(m => m.id !== clean(body.memberId, 40));
      }
      return {};
    });
    if (result.error) { res.status(400).json(result); return; }
    const st = await store.read();
    res.status(200).json({ ...st, serverNow: Date.now() });
  } catch (e) {
    res.status(500).json({ error: 'storage', detail: String(e && e.message || e) });
  }
};
