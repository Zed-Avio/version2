# ELECARM Crisis2, Contexte complet du projet

Document de passation, pense pour etre lu par quelqu'un qui n'a aucun contexte prealable sur le projet. Ecrit le 2026-08-20.

## Qui est l'utilisateur

Enseignant qui anime un cours d'introduction au management/gestion, construit des exercices de simulation de crise deployes sur Vercel. Collegue impliquee : Lucie.

## Cadre pedagogique (3 seances)

- **Seance 1 (1h20)**, cadrage : presentation objectifs, constitution des equipes, QCM (`qcm-insa.vercel.app`, voir plus bas), presentation du contexte (diaporama construit separement par l'utilisateur, hors perimetre)
- **Seance 2 (2h40)**, jeu : equipes en ilots, c'est `elecarm-crisis2` qui est joue ici, enseignants animent/aident
- **Seance 3 (1h20)**, restitution : rapport au Ministere de l'Interieur (diagnostic + preconisations). Verifier si le ministere fournit un template de rapport (question ouverte, jamais tranchee)

## Setup technique (elecarm-crisis2)

- Deploiement : Vercel CLI direct, compte `hachemimowgli-2820`, team `hachemimowgli-2820s-projects`
- Local : `~/projects/elecarm-crisis2/` (fichiers a la racine), lie via `.vercel/project.json`, project ID `prj_RQ1HfUuMiYCjTgZV8hOqdx4YzrZr`
- Deploy : `vercel deploy --prod --yes` depuis ce dossier (ne JAMAIS passer un chemin en argument positionnel, ca cree un projet parasite, deja arrive une fois, nettoye avec `vercel project remove`)
- **v1 `elecarm-crisis`** (`elecarm-crisis.vercel.app`, local `~/projects/elecarm-crisis/src/`) : gelee, ne jamais toucher pour son contenu original, sert juste de reference historique
- **v2 `elecarm-crisis2`** (`elecarm-crisis2.vercel.app`) : cible active de tout le travail
- Playwright installe en devDependency (`node_modules` exclu du deploiement via `.vercelignore`) pour tests headless et recuperation de photos Wikimedia Commons (toujours verifier les metadonnees `Credit`/`Artist` avant d'utiliser une image Commons)
- Convention de contenu : francais avec accents corrects (corrige en profondeur, tout le fichier etait ecrit sans accents avant, ne pas reintroduire un style sans accents), pas de tirets cadratins (virgules/points a la place)

### Depots GitHub (prives, compte Zed-Avio)

- **`version1`** (https://github.com/Zed-Avio/version1) : contenu de `~/projects/elecarm-crisis/src/` (la premiere version gelee), plus un sous-dossier `qcm-insa/`
- **`version2`** (https://github.com/Zed-Avio/version2) : contenu de `~/projects/elecarm-crisis2/` (la version active), plus un sous-dossier `qcm-insa/`. Renomme depuis `elecarm-crisis2` sur demande de l'utilisateur.
- Un depot autonome `qcm-insa` (https://github.com/Zed-Avio/qcm-insa) a aussi ete cree, puis son contenu duplique en sous-dossier dans `version1` et `version2` sur demande explicite de l'utilisateur ("pas tout seul"). Verifier avec l'utilisateur si ce depot autonome doit etre supprime ou garde en plus (question posee, pas encore tranchee au moment de l'ecriture de cette note).
- `gh` CLI installe sans sudo dans `~/.local/bin/gh` (deja dans le PATH), authentifie via device-code flow sur le compte GitHub `Zed-Avio`
- Fichiers exclus des commits Git (`.gitignore`) en plus des exclusions Vercel habituelles : `package.json`/`package-lock.json` (tooling interne), `JOURNAL_MODIFICATIONS.md` (notes internes), ces fichiers restent presents localement, seulement retires du depot distant
- Convention appliquee sur demande explicite de l'utilisateur : aucune trace d'assistance externe dans les commits (pas de trailer de co-authorship) ni dans le contenu des fichiers pousses

## Fichiers du site elecarm-crisis2 (racine du projet)

- `index.html` (~168 Ko), le jeu principal, 8 onglets : SITUATION, MAILS, ENQUETE (8 suspects), DSI/LOGS, DOCUMENTS (8 docs + PDF telechargeables), ENIGMES, OSINT, VERDICT
- `portal.html`, fausse page de login interne (decor phishing)
- `starterGame.html`, page de salle d'attente/compte a rebours envoyee aux eleves (voir section dediee)
- `lobbyControl.html`, page de controle du chrono, reservee a l'enseignant, jamais liee nulle part dans le site
- `gen_pdfs.js`, genere les 8 PDF des Documents via Playwright, pas deploye (exclu par `.vercelignore`)
- `JOURNAL_MODIFICATIONS.md`, journal detaille de toutes les modifications round par round, pas deploye, **a lire en premier pour l'historique complet et les details techniques exacts**
- `CONTEXT_SUMMARY.md` (ce fichier), egalement exclu du deploiement
- Photos : `face1-5` (portraits suspects), `photo3/4/5/6/11/12` (preuves, vraies photos CC Wikimedia Commons, remplacent d'anciennes photos de stock cambriolage)

## Le scenario actuel (histoire complete)

**Cadre narratif** : les joueurs sont un cabinet d'audit externe mandate par la DSI d'ELECARM (fabricant de composants electroniques, sous-traitant Thales Defence, Blois), suite a une directive du Ministere de l'Interieur (tensions geopolitiques/elections, rapport de securite sous 15 jours pour les sous-traitants defense). Codename operation : "Silent Gateway".

**La chaine reelle des faits** :
1. Julien MOREAU (Responsable DSI, pression financiere) recoit un faux mail de recruteur Thales (spearphishing, piece jointe `.docm` piegee) -> poste WS-MOREAU-01 compromis
2. Recrutement via deux leviers VICE : **Vanite** (mission flatteuse et exclusive) + **Especes** (remuneration attractive face a ses difficultes financieres reelles), aucune trace d'Ideologie ou de Contrainte/chantage
3. Faille organisationnelle racine : changement de fournisseur des cartes Raspberry Pi de la passerelle de telemaintenance BX-GATEWAY-07 (vers SinoBoard) **sans validation securite DSI**, c'est le diagnostic central attendu dans le rapport
4. Detection : pas de vol physique ni de ransomware (retires du scenario des le round 2, sur instruction explicite et emphatique de l'utilisateur, ne jamais les reintroduire), la DSI repere elle-meme un flux sortant suspect vers IP externe (**185.220.101.47**) le 19 mai a 8h, lors d'une revue de vigilance declenchee par la directive ministerielle

**Fausses pistes integrees** (pour forcer une vraie investigation plutot qu'un reflexe) :
- Camille ROUSSEAU (activiste anti-armement)
- Thomas VASSEUR (trou de CV)
- Farid HADDAD (voyages Chine/Irak lies au fournisseur Raspberry Pi)
- Karim BENYOUCEF (pression financiere parallele a MOREAU, mais sans acces/opportunite technique)
- Antoine ROBERT (ex-salarie licencie en mars 2026, piste soulevee par un collegue puis fermee formellement par les RH avec fiche de sortie)
- TechIndus Solutions (concurrent, hypothese d'espionnage industriel evoquee dans un mail, mais deliberement laissee sans aucune preuve technique corroborante ailleurs, la lecon est justement l'absence de preuve, pas un dementi explicite)
- Une IP externe mais legitime, Azure NTP (20.42.73.18), melee a la vraie IP malveillante dans les logs
- Marc DURAND (repurpose en profil "propre" de comparaison, sans fonction suspecte)
- Pierre THIERRY (temoin ayant laisse un faux "technicien de maintenance" intervenir sur la passerelle sans ticket)
- Nathalie BRUNET (acces nocturne inexplique a la base qualite, fil narratif recousu avec un mail expliquant une connexion VPN de soiree)

**Reponses attendues a l'onglet VERDICT** (5 questions, note sur 5, cle de reponse encodee en base64 dans le JS) :
- Coupable : Julien MOREAU
- Vecteur : mail de faux recruteur Thales avec piece jointe piegee
- IP malveillante : 185.220.101.47 (10.42.6.11 = serveur interne legitime, 20.42.73.18 = service Azure legitime)
- Cause organisationnelle : changement de fournisseur des passerelles Raspberry Pi sans validation securite DSI
- Leviers VICE utilises : Vanite + Especes

## Principes de design etablis

- **Pas de fuite dans l'UI ambiante/passive** : aucun nom du coupable dans les elements toujours visibles (sidebar/timeline, vue d'ensemble Situation), seul le contenu investigue activement (mails ouverts, dossiers suspects consultes) peut etre specifique. Avant d'ajouter un element d'UI, se demander s'il est passif (doit rester generique) ou actif/investigatif (peut etre precis).
- **Pas de design "IA generique" / AI-slop** : palette sombre sobre deja etablie (rouge en petites touches uniquement, jamais en grande banniere d'alerte), pas de cliches visuels d'alerte criards. Ce principe s'applique a tout nouvel element visuel ajoute au projet, y compris si on touche un jour a `qcm-insa` (voir section dediee), eviter tout ce qui a un look generique/template IA plutot que quelque chose de concu specifiquement pour ce contexte.
- **L'ecran d'intro (splash -> briefing) ne doit JAMAIS etre saute**, meme avec la sauvegarde locale (localStorage), une regression sur ce point a deja ete corrigee une fois apres une reaction vive de l'utilisateur, ne pas la reintroduire sous quelque forme que ce soit (y compris via une nouvelle fonctionnalite de reprise de session).
- Reponses Verdict + solution animateur encodees en base64 (dissuasion basique contre le Ctrl+F/vue source, explicitement PAS une vraie securite, le code source reste lisible par n'importe qui via devtools en executant `atob()`, limite assumee et expliquee a l'utilisateur).
- Workflow de verification systematique avant tout deploiement : `node --check` sur le JS extrait des balises `<script>` (node ne sait pas parser du `.html` directement, il faut extraire les blocs `<script>` d'abord), test Playwright headless (rendu de tous les onglets avec verification de bounding box non nulle, zero erreur console/page), puis `vercel deploy --prod --yes`, puis verification `curl`/Playwright sur l'URL live en production. Ce pattern approfondi (grep pour references residuelles + verification licensing + test headless complet) a ete explicitement valide et appreme par l'utilisateur, a reproduire systematiquement.

## La fonctionnalite "salle d'attente" (starterGame.html / lobbyControl.html)

- **`starterGame.html`** : page envoyee aux eleves (chaque equipe ouvre le lien sur son propre poste, ce n'est PAS un videoprojecteur unique partage). Aucun controle visible ou accessible dessus, pas de champ, pas de bouton, rien qu'un eleve pourrait toucher. Lit un parametre `?end=<horodatage_ms>` dans l'URL et decompte localement (`end, Date.now()`, recalcule toutes les 250ms, pas de derive). Sans parametre -> ecran neutre "en attente du lancement par l'enseignant". A zero : flash "OUVERTURE DU DOSSIER..." puis redirection vers `https://elecarm-crisis2.vercel.app` (le jeu). Tout le contenu visuel s'affiche immediatement (`opacity:1` par defaut), une regression ou les elements demarraient a `opacity:0` en attente d'une animation d'entree trop lente a ete corrigee (l'ecran pouvait rester visuellement vide plusieurs secondes sur du materiel de classe plus lent).
- **`lobbyControl.html`** : page reservee a l'enseignant, jamais liee nulle part ailleurs dans le site (a garder/bookmarker soi-meme). Reglage de duree en minutes, apercu live en `<iframe>` pointant vers `starterGame.html` (donc rigoureusement identique a ce que verront les eleves), et bouton "Generer et copier le lien de depart" qui encode l'heure de fin dans l'URL et la copie dans le presse-papiers.
- **Piege connu, deja rencontre et explique a l'utilisateur** : le decompte demarre au clic sur "Generer", pas a l'ouverture par l'eleve, avec une duree tres courte (ex. 1 min), le temps reel de partage du lien (changement de fenetre, collage, messagerie) peut suffire a epuiser toute la duree avant meme l'ouverture, donnant l'impression que "rien ne s'affiche". Prevoir toujours une vraie marge (2-3 min minimum) pour le partage reel. L'apercu en iframe de `lobbyControl.html` reste sans risque pour tester des durees ultra-courtes puisqu'il n'y a pas de delai de partage.
- **Idee en pause, explicitement mise de cote par l'utilisateur (2026-08-19)** : avoir un lien fixe et permanent (`starterGame.html` sans parametre du tout, toujours la meme URL) necessiterait un petit stockage partage cote serveur, puisque l'information ne peut plus vivre dans l'URL. Options evaluees : Vercel Blob (necessite creation via dashboard, pas de commande CLI trouvee), Vercel Edge Config / `vercel global-config` (creable en CLI, mais ses tokens sont en lecture seule, ecrire necessiterait un token de compte Vercel a portee large, souci de moindre privilege), integration marketplace officielle "Redis by Redis" (identifiants correctement cibles, plan gratuit disponible), retenue comme la bonne option. L'utilisateur a accepte les conditions d'utilisation Redis (etape 1/2), mais l'installation necessite une deuxieme etape manuelle (page de checkout : choisir Storage Type, mettre High Availability sur "None", confirmer le plan **Free**) jamais finalisee. L'utilisateur a ensuite explicitement demande de mettre cette idee en pause pour se concentrer sur le contenu de l'exercice. **Ne pas relancer ce chantier sans qu'il le redemande explicitement.** Le systeme actuel avec `?end=` dans l'URL reste le systeme live et fonctionnel.

## Le QCM de la seance 1 : qcm-insa.vercel.app

Outil separe, deploye a `https://qcm-insa.vercel.app/`, **pas de dossier local connu sur cette machine** (a cloner ou recuperer depuis Vercel si des modifications sont demandees). Pas encore touche par ce projet de travail.

- QCM de 6 questions sur la cybersecurite
- Branding actuel : logo reel "INSA CVL" (Institut National des Sciences Appliquees Centre-Val de Loire, ecole d'ingenieurs francaise) affiche sur la page (fichier `insa-cvl.webp`), a la difference d'ELECARM (entreprise fictive), ce logo est une vraie institution
- Fonctionnalites visibles : suivi de progression ("sur 6"), bouton "Recommencer"
- **Demande en attente, jamais commencee** : l'utilisateur veut ajouter des notions de "logs" et de "backdoor" a ce QCM, une fois qu'`elecarm-crisis2` serait stabilise. Pas de detail supplementaire donne sur le contenu exact de ces nouvelles questions, a clarifier avec l'utilisateur avant de commencer.
- Appliquer les memes principes de design que ci-dessus si ce chantier demarre (pas de look generique/IA, coherence avec le reste des outils de l'utilisateur).

## Points ouverts / non traites (mentionnes mais jamais demandes explicitement)

- Tableau d'enquete visuel (mind-map reliant indices/suspects) dans elecarm-crisis2, propose mais pas construit
- PDF telechargeables pour les pieces jointes secondaires des mails (CV, attestation ISO, fiche de sortie), actuellement de simples interactions "toast", contrairement aux 8 documents principaux qui ont de vrais PDF
- Template de rapport seance 3 fourni par le ministere, jamais verifie si ca existe
- Diaporama de la seance 1, construit separement par l'utilisateur, hors perimetre de ce travail
