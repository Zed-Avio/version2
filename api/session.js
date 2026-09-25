// API d'animation de l'exercice ELECARM Crisis2.
// GET  /api/session[?team=&member=]  -> etat public (salle d'attente, equipes, et tentatives de SON equipe)
// POST /api/session {password, action, ...} -> console animateur (protege par ANIM_PASSWORD)
//   actions : waiting | start | open | close | reset | setTimer | addTime | state
//             deleteTeam | removeMember | resetAttempts | wipeTeams | reply | broadcast | alert | solution
const store = require('./_store');
const { parseBody, clean, cleanText, newId, publicView, pushMessage } = require('./_util');
const { publicQuestions } = require('./_grade');
const SOLUTION = require('./_solution');

function clampMin(v, fallback) {
  v = parseInt(v, 10);
  if (!Number.isFinite(v) || v < 1) return fallback || 10;
  return Math.min(600, v);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      const q = req.query || {};
      let st = await store.read(false, parseInt(q.minRev, 10) || 0);
      const team = q.team ? String(q.team) : null, member = q.member ? String(q.member) : null;
      let view = publicView(st, team, member);
      // Plusieurs instances Vercel : le cache de celle-ci peut dater d'avant une inscription faite
      // sur une autre. Avant de répondre « membre inconnu », on relit l'état réel.
      if (team && view.me === null) { st = await store.read(true); view = publicView(st, team, member); }
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
    if (action === 'solution') { res.status(200).json({ html: SOLUTION }); return; }
    if (action === 'state' || action === 'noop') {
      const st = await store.read(false, parseInt(body.minRev, 10) || 0);
      res.status(200).json({ ...st, serverNow: Date.now() });
      return;
    }
    const known = ['waiting', 'start', 'open', 'close', 'reset', 'setTimer', 'addTime', 'deleteTeam', 'removeMember', 'resetAttempts', 'wipeTeams', 'reply', 'broadcast', 'alert'];
    if (!known.includes(action)) { res.status(400).json({ error: 'bad action' }); return; }

    const result = await store.mutate(st => {
      const s = st.session, now = Date.now();
      const d = clampMin(body.durationMin, s.durationMin);             // compte a rebours avant ouverture
      const M = clampMin(body.missionMin, s.missionMin || 240);         // minuteur de l'exercice
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
      else if (action === 'wipeTeams') { st.teams = {}; st.broadcasts = []; st.alerts = []; }
      else if (action === 'alert') {
        // Relance : notification affichée sur tous les postes (et non un message de discussion)
        const text = cleanText(body.text); if (!text) return { error: 'Message vide.' };
        st.alerts = st.alerts || []; pushMessage(st.alerts, { id: newId(), title: cleanText(body.title).slice(0, 80) || 'Nouvelle alerte DSI', text, at: now });
      }
      else if (action === 'broadcast') {
        const text = cleanText(body.text); if (!text) return { error: 'Message vide.' };
        st.broadcasts = st.broadcasts || []; pushMessage(st.broadcasts, { id: newId(), text, at: now });
      }
      else {
        const t = st.teams[clean(body.teamId, 40)];
        if (!t) return { error: 'team not found' };
        if (action === 'deleteTeam') delete st.teams[t.id];
        else if (action === 'resetAttempts') { t.attempts = []; t.success = false; }
        else if (action === 'reply') {
          const text = cleanText(body.text); if (!text) return { error: 'Message vide.' };
          t.messages = t.messages || []; pushMessage(t.messages, { id: newId(), from: 'anim', text, at: now });
        }
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
