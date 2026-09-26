// API equipes (eleves).
// POST /api/team {action:'join', memberName, teamId}  -> rejoindre un groupe cree par l'animateur (places reglees par groupe)
// POST /api/team {action:'leave', teamId, memberId}
// POST /api/team {action:'submit', teamId, memberId, answers}     -> une supposition (5 tentatives par equipe)
// POST /api/team {action:'message', teamId, memberId, text}       -> message a l'animateur
const store = require('./_store');
const { grade, tier, parseAnswers, FIELDS, MAX_ATTEMPTS, norm } = require('./_grade');
const { parseBody, clean, cleanText, newId, isOpen, publicView, pushMessage, capacity, findMember } = require('./_util');

const ERR = {
  name: 'Indiquez votre nom et prénom.',
  closed: 'Les inscriptions ne sont pas ouvertes. Attendez que l\'enseignant ouvre la salle.',
  notOpen: 'L\'exercice est fermé pour le moment.',
  full: 'Ce groupe est complet. Choisissez-en un autre ou demandez à l\'enseignant.',
  notMember: 'Vous ne faites plus partie d\'un groupe. Rejoignez votre groupe depuis la salle d\'attente.',
  locked: 'Votre équipe a utilisé toutes ses tentatives.',
  incomplete: 'Répondez aux 5 questions avant d\'envoyer (au moins un levier pour la question 5).',
  noTeam: 'Groupe introuvable. Choisissez votre groupe dans la liste.',
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
        const memberName = clean(b.memberName, 40);
        if (!memberName) return { error: 'name' };
        // Les groupes sont crees uniquement par l'animateur : ici on ne fait que rejoindre.
        const t = st.teams[clean(b.teamId, 40)];
        if (!t) return { error: 'noTeam' };
        if (t.members.length >= capacity(t)) return { error: 'full' };
        const m = { id: newId(), name: memberName, at: Date.now() };
        t.members.push(m);
        return { ok: true, teamId: t.id, teamName: t.name, memberId: m.id, memberName };
      }

      const { t, m } = findMember(st, clean(b.teamId, 40), clean(b.memberId, 40));
      if (!t || !m) return { error: 'notMember' };

      if (b.action === 'leave') {
        t.members = t.members.filter(x => x.id !== m.id);
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
      const st = await store.read();   // juste après l'écriture : le cache de cette instance est à jour
      result.view = publicView(st, result.teamId || b.teamId, result.memberId || b.memberId);
    }
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: 'storage', message: 'Serveur indisponible, réessayez dans un instant.', detail: String(e && e.message || e) });
  }
};
