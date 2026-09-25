// API equipes (eleves).
// POST /api/team {action:'join', memberName, teamName | teamId}  -> rejoindre ou creer une equipe (8 places max)
// POST /api/team {action:'leave', teamId, memberId}
// POST /api/team {action:'submit', teamId, memberId, answers}     -> une supposition (5 tentatives par equipe)
// POST /api/team {action:'message', teamId, memberId, text}       -> message a l'animateur
const store = require('./_store');
const { grade, tier, parseAnswers, FIELDS, MAX_ATTEMPTS, norm } = require('./_grade');
const { parseBody, clean, cleanText, newId, isOpen, publicView, pushMessage, MAX_MEMBERS, MAX_TEAMS } = require('./_util');

const ERR = {
  name: 'Indiquez votre prénom.',
  teamName: 'Indiquez un nom d\'équipe (2 caractères minimum).',
  closed: 'Les inscriptions ne sont pas ouvertes. Attendez que l\'enseignant ouvre la salle.',
  notOpen: 'L\'exercice est fermé pour le moment.',
  full: 'Cette équipe est complète (8 personnes maximum).',
  tooMany: 'Nombre maximum d\'équipes atteint.',
  notMember: 'Vous ne faites plus partie de cette équipe. Rejoignez une équipe depuis la salle d\'attente.',
  locked: 'Votre équipe a utilisé toutes ses tentatives.',
  incomplete: 'Répondez aux 5 questions avant d\'envoyer (au moins un levier pour la question 5).',
  noTeam: 'Équipe introuvable.',
  emptyMsg: 'Message vide.',
  tooFast: 'Doucement : attendez quelques secondes entre deux messages.',
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }
  const b = parseBody(req);

  try {
    const result = await store.mutate(st => {
      const s = st.session;
      if (b.action === 'join') {
        if (!['waiting', 'running'].includes(s.status)) return { error: 'closed' };
        const memberName = clean(b.memberName, 30);
        if (!memberName) return { error: 'name' };
        let t = b.teamId ? st.teams[clean(b.teamId, 40)] : null;
        if (b.teamId && !t) return { error: 'noTeam' };
        if (!t) {
          const teamName = clean(b.teamName, 40);
          if (teamName.length < 2) return { error: 'teamName' };
          t = Object.values(st.teams).find(x => norm(x.name) === norm(teamName));
          if (!t) {
            if (Object.keys(st.teams).length >= MAX_TEAMS) return { error: 'tooMany' };
            t = { id: newId(), name: teamName, createdAt: Date.now(), members: [], attempts: [], success: false };
            st.teams[t.id] = t;
          }
        }
        if (t.members.length >= MAX_MEMBERS) return { error: 'full' };
        const m = { id: newId(), name: memberName, at: Date.now() };
        t.members.push(m);
        return { ok: true, teamId: t.id, teamName: t.name, memberId: m.id, memberName };
      }

      const t = st.teams[clean(b.teamId, 40)];
      const m = t && t.members.find(x => x.id === clean(b.memberId, 40));
      if (!t || !m) return { error: 'notMember' };

      if (b.action === 'leave') {
        t.members = t.members.filter(x => x.id !== m.id);
        if (!t.members.length && !t.attempts.length) delete st.teams[t.id];
        return { ok: true };
      }

      if (b.action === 'message') {
        const text = cleanText(b.text);
        if (!text) return { error: 'emptyMsg' };
        t.messages = t.messages || [];
        const last = t.messages.filter(x => x.from === 'team').slice(-1)[0];
        if (last && Date.now() - last.at < 1500) return { error: 'tooFast' };
        pushMessage(t.messages, { id: newId(), from: 'team', by: m.name, text, at: Date.now() });
        return { ok: true };
      }

      if (b.action === 'submit') {
        if (!isOpen(s)) return { error: 'notOpen' };
        if (t.success || t.attempts.length >= MAX_ATTEMPTS) return { error: 'locked' };
        const parsed = parseAnswers(b.answers);
        if (!parsed) return { error: 'incomplete' };
        const score = grade(parsed.ids);
        const n = t.attempts.length + 1;
        const tr = tier(score, n);
        // answers = libelles lisibles (console, historique), choices = identifiants choisis
        t.attempts.push({ n, at: Date.now(), by: m.name, answers: parsed.labels, choices: parsed.ids, score, tier: tr });
        if (score === FIELDS.length) t.success = true;
        return { ok: true, n, tier: tr, left: MAX_ATTEMPTS - n, success: !!t.success, locked: !!t.success || n >= MAX_ATTEMPTS };
      }
      return { error: 'bad action' };
    });

    if (result.error) {
      res.status(result.error === 'notMember' ? 403 : 400).json({ error: result.error, message: ERR[result.error] || result.error });
      return;
    }
    if (b.action === 'submit' || b.action === 'join' || b.action === 'message') {
      const st = await store.read();
      result.view = publicView(st, result.teamId || b.teamId, result.memberId || b.memberId);
    }
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: 'storage', message: 'Serveur indisponible, réessayez dans un instant.', detail: String(e && e.message || e) });
  }
};
