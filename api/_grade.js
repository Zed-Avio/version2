// Suppositions : questions a choix, corrigees cote serveur (la cle n'est jamais envoyee au navigateur).
// Chaque question vaut 1 point. Les distracteurs viennent tous du scenario (fausses pistes reelles).
// Avec 5 tentatives par equipe et un retour global (jamais question par question), essayer
// toutes les combinaisons est impossible.

function norm(s) {
  return ' ' + String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.]+/g, ' ').replace(/\.+( |$)/g, ' ').replace(/(^| )\.+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
}

const QUESTIONS = [
  { id: 'coupable', title: 'Qui est l\'employé dont le compte a facilité l\'intrusion ?', options: [
    ['marc', 'Marc DURAND, technicien de production'],
    ['karim', 'Karim BENYOUCEF, magasinier'],
    ['nathalie', 'Nathalie BRUNET, responsable qualité'],
    ['julien', 'Julien MOREAU, responsable DSI'],
    ['pierre', 'Pierre THIERRY, gardien de nuit'],
    ['camille', 'Camille ROUSSEAU, assistante commerciale'],
    ['thomas', 'Thomas VASSEUR, technicien de maintenance'],
    ['farid', 'Farid HADDAD, responsable achats'],
    ['antoine', 'Antoine ROBERT, ancien salarié licencié en mars'],
  ] },
  { id: 'vecteur', title: 'Par quel moyen l\'attaquant est-il entré en premier dans le système ?', options: [
    ['it', 'Un faux mail de mise à jour informatique menant à une fausse page de connexion'],
    ['usb', 'Une clé USB piégée laissée dans les locaux'],
    ['recruteur', 'Un mail de faux recruteur Thales avec une pièce jointe Word piégée'],
    ['technicien', 'Un faux technicien de maintenance intervenu sans ticket sur la passerelle'],
    ['vpn', 'Un mot de passe VPN deviné par force brute depuis l\'extérieur'],
    ['ancien', 'Les accès d\'un ancien salarié jamais désactivés'],
  ] },
  { id: 'ip', title: 'Quelle adresse IP correspond au canal de communication réellement malveillant ?', options: [
    ['10.42.6.11', '10.42.6.11'],
    ['10.42.2.31', '10.42.2.31'],
    ['20.42.73.18', '20.42.73.18'],
    ['185.220.101.47', '185.220.101.47'],
    ['10.42.6.27', '10.42.6.27'],
  ] },
  { id: 'cause', title: 'Quelle faille organisationnelle a rendu possible la compromission de la passerelle ?', options: [
    ['fournisseur', 'Le changement de fournisseur des cartes Raspberry Pi (SinoBoard) sans validation de la DSI'],
    ['techindus', 'Un sabotage organisé par le concurrent TechIndus Solutions'],
    ['code', 'Une modification du code du programme de supervision, sans revue ni contrôle des changements'],
    ['vengeance', 'La vengeance d\'un ancien salarié licencié'],
    ['qualite', 'Une anomalie qualité non traitée sur le lot S42'],
    ['antivirus', 'Une licence antivirus expirée sur les postes de travail'],
  ] },
  { id: 'vice', multi: true, title: 'Quels leviers de manipulation (modèle VICE) ont été utilisés pour recruter cet employé ? (plusieurs réponses possibles)', options: [
    ['vanite', 'Vanité'],
    ['ideologie', 'Idéologie'],
    ['contrainte', 'Contrainte (chantage)'],
    ['especes', 'Espèces (argent)'],
  ] },
];

const KEY = { coupable: 'julien', vecteur: 'recruteur', ip: '185.220.101.47', cause: 'code', vice: ['especes', 'vanite'] };

const FIELDS = QUESTIONS.map(q => q.id);
const MAX_ATTEMPTS = 5;

// Questions envoyees au navigateur (sans la cle).
function publicQuestions() {
  return QUESTIONS.map(q => ({ id: q.id, title: q.title, multi: !!q.multi, options: q.options.map(([id, label]) => ({ id, label })) }));
}

// Valide les choix recus. Renvoie { ids, labels } ou null si incomplet / invalide.
function parseAnswers(raw) {
  const ids = {}, labels = {};
  for (const q of QUESTIONS) {
    const valid = new Map(q.options);
    let v = raw && raw[q.id];
    if (q.multi) {
      v = Array.isArray(v) ? [...new Set(v.map(String))].filter(x => valid.has(x)).sort() : [];
      if (!v.length) return null;
      ids[q.id] = v; labels[q.id] = v.map(x => valid.get(x)).join(', ');
    } else {
      v = String(v == null ? '' : v);
      if (!valid.has(v)) return null;
      ids[q.id] = v; labels[q.id] = valid.get(v);
    }
  }
  return { ids, labels };
}

function grade(ids) {
  let score = 0;
  for (const k of FIELDS) {
    const want = KEY[k], got = ids[k];
    if (Array.isArray(want) ? (Array.isArray(got) && got.join('|') === [...want].sort().join('|')) : got === want) score++;
  }
  return score;
}

function tier(score, attemptsUsed) {
  if (score === FIELDS.length) return 'Vous êtes sur la bonne voie : vos suppositions tiennent la route.';
  if (attemptsUsed >= MAX_ATTEMPTS) return 'Tentatives épuisées. Voyez ça avec votre enseignant avant la séance 3.';
  if (score === 4) return 'Vous y êtes presque.';
  if (score >= 2) return 'Vous vous rapprochez, mais il reste des zones d\'ombre.';
  return 'Vous êtes encore loin du compte, retournez enquêter.';
}

module.exports = { grade, tier, parseAnswers, publicQuestions, FIELDS, MAX_ATTEMPTS, norm };
