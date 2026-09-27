# ELECARM, résumé de l'exercice (document enseignant)

Document réservé à l'animateur : il contient la solution. Il n'est pas publié sur le site des élèves (exclu par `.vercelignore`).

## Le cadre

- **Public** : étudiants de 2e année, peu à l'aise en informatique, en groupes (TD1 à TD4, 4 groupes de 6 places par TD).
- **Durée** : environ 2h20 en séance 2, sans limite de temps imposée (seul l'animateur ferme l'exercice).
- **Rôle des élèves** : un cabinet d'audit externe appelé par la Direction d'ELECARM (fabricant de coffrets électriques à Blois, sous-traitant de Thales Defence), après une directive du Ministère de l'Intérieur qui impose un rapport de sécurité aux sous-traitants défense.
- **Point de départ** : le 19 mai à 8h, la DSI repère un flux sortant suspect vers une adresse IP externe.
- **Suite** : séance 3, rapport au Ministère (diagnostic des vulnérabilités, préconisations priorisées, rappel de sensibilisation VICE).

## Déroulé pour les élèves

1. `/salle` : le groupe choisit son TD et son groupe, chaque élève tape son nom.
2. Intro (briefing, message « Travaillez en équipe »), puis l'exercice.
3. Enquête dans les onglets : SITUATION, MAILS (boîte générale + 8 boîtes employés), ENQUÊTE (8 fiches avec pièces du dossier), JOURNAUX / LOGS (interface Wazuh), PROGRAMMATION, DOCUMENTS, BOÎTIER BX, OSINT.
4. Onglet **SUPPOSITIONS** : 5 questions à choix, corrigées par le serveur, **8 tentatives par groupe** partagées entre tous ses membres. Retour global (loin, se rapprochent, presque, bonne voie), jamais le détail par question.
5. Aides : le guide de l'enquête (aide automatique, sans solution) et le bouton « Écrire à l'animateur ».

## Ce qui s'est vraiment passé

1. **2 mai** : Julien MOREAU (responsable DSI, en difficulté financière) ouvre le mail d'un faux recruteur Thales avec une pièce jointe Word piégée (`.docm`). Son poste WS-MOREAU-01 est compromis.
2. **Recrutement** : leviers VICE **Vanité** (mission flatteuse et exclusive) et **Espèces** (argent face à ses dettes). Ni Idéologie, ni Contrainte.
3. **4 et 5 mai** : reconnaissance depuis son poste. **À partir du 6 mai** : exfiltration.
4. **9 mai** : une ligne du programme de supervision de la passerelle BX-GATEWAY-07 est modifiée et ouvre une porte dérobée (onglet Programmation, détectée par le contrôle d'intégrité Wazuh).
5. **Canal de sortie** : la passerelle vers **185.220.101.47**.
6. **16 mai à 02h31, conséquence la plus grave** : par la télémaintenance, l'attaquant envoie un firmware modifié au boîtier **BX-4216** (lot S42, destiné au programme classé Thales). Le 17 mai, N. BRUNET mesure +40 % de consommation à 33 °C. Le 19 mai, le rapport de conformité attribue l'écart à la chaleur et valide l'expédition : un composant piégé allait partir chez un client défense.

## Réponses attendues (onglet SUPPOSITIONS)

| Question | Réponse |
|---|---|
| Employé dont le compte a facilité l'intrusion | Julien MOREAU, responsable DSI |
| Premier moyen d'entrée | Mail de faux recruteur Thales avec pièce jointe Word piégée |
| IP du canal malveillant | 185.220.101.47 |
| Faille organisationnelle | Modification du code du programme de supervision sans revue ni contrôle des changements |
| Leviers VICE | Vanité et Espèces |

Préconisations attendues au débriefing : bloquer l'expédition, reflasher et auditer tout le lot S42, séparer la télémaintenance du banc de contrôle, instaurer une revue de code et un second administrateur, ne jamais valider une conformité sur une hypothèse non vérifiée.

## Les fausses pistes

Règle de construction : chaque fausse piste est un « miroir » de MOREAU. Elle a un mobile, un accès ou des traces, jamais les trois. L'accroche est dans la fiche ENQUÊTE, la preuve qui l'écarte est ailleurs (mails, journaux, pièces du dossier).

### Les personnes

| Personne | Ce qui attire l'attention | Ce qui l'écarte |
|---|---|---|
| Karim BENYOUCEF | Dettes, comme MOREAU | Aucun accès informatique, aucune trace dans les journaux ; note RH (avance sur salaire) ; le virement de 1 500 € est une prime d'intéressement |
| Farid HADDAD | À Shenzhen du 27 avril au 4 mai, contacts avec SinoBoard | Le 2 mai tout se passe sur le poste de MOREAU ; ordinateur de voyage vide, aucun VPN ; dossier SinoBoard jamais signé ; il renvoie le cadeau de SinoBoard en citant la charte éthique |
| Camille ROUSSEAU | Idéologie (collectif anti-armement, site militant dans Wazuh) | Aucun accès technique, absente depuis le 15 mai ; elle refuse de donner des infos au collectif ; l'article de presse parle d'une manifestation pacifique |
| Thomas VASSEUR | Trou dans le CV (juin 2023 à octobre 2024), accès au local technique | Le trou s'explique par une formation AFPA ; aucune trace informatique ; le code a été modifié à distance depuis le poste de MOREAU |
| Nathalie BRUNET | Connexion à 22h01 le 17 mai | Expliquée dans son mail (rapport qualité), VPN depuis chez elle à Blois |
| Marc DURAND | Demande de VPN, annonce leboncoin | VPN pour le 21 et 22 mai (après les faits, motif personnel, non traitée) ; l'annonce concerne les restes de sa rénovation |
| Pierre THIERRY | A laissé un « technicien » intervenir sur la passerelle le 6 mai à 20h15 sans référence | Prestataire TéléMaint Centre, ticket TICK-4147 (mail des Services généraux) ; le 6 mai, seule une coupure d'alimentation apparaît, aucune modification du code |
| Antoine ROBERT | Ex-salarié licencié en mars 2026 | Accès révoqués à son départ (mail RH et fiche de sortie) |
| TechIndus Solutions | Concurrent, note de vigilance sur de l'espionnage industriel | Aucune preuve technique nulle part : la leçon est justement l'absence de preuve |

### Les fausses alertes techniques

| Élément | Ce qui attire l'attention | Ce qui l'écarte |
|---|---|---|
| Balayage de ports du 12 mai (critique dans Wazuh) | Ressemble à une attaque | Scan trimestriel Sigma-Tech (10.42.1.30) annoncé par la DSI le 11 mai. Le rapport du 13 mai (boîte de MOREAU) signale le port 443 ouvert sur la passerelle, c'est-à-dire la porte dérobée ; MOREAU n'a rien fait |
| Antivirus de la comptabilité (13 mai) | Alerte virus | Campagne Emotet de fausses factures, bloquée, sans lien avec l'attaque |
| IP 20.42.73.18 | IP externe dans les journaux | Service Azure NTP, ajouté officiellement le 22 avril (onglet Programmation) |
| IP 10.42.6.11 | Proposée au QCM | Serveur interne légitime |
| Clé USB « DIAG » (boîte de THIERRY) | Clé trouvée le 19 mai | Outils de diagnostic de TéléMaint oubliés le 6 mai ; permet d'écarter le choix « clé USB » du QCM |

## Les exercices de sensibilisation

Chaque piège affiche une courte leçon. Les actions des élèves apparaissent en direct dans Wazuh (sur POSTE-AUDIT ou WS-COMPTA) : le SIEM voit tout, ce qui est aussi une leçon.

| Piège | Où | Bonne réaction | Leçon |
|---|---|---|---|
| Portail de phishing | Mail « IT-ELECARM » (`elecarm-sys.net`) qui renvoie vers `elecarm-secure-portal.net` | Ne pas cliquer, vérifier le domaine | Le vrai domaine est `elecarm.fr` ; survoler un lien avant de cliquer. La leçon s'affiche d'elle-même après 2 s, sans rien saisir |
| Quiz Facebook | Profil OSINT de Marc DURAND (« Rex Tours ») | Ne pas répondre à ce type de quiz | Premier animal et ville de naissance sont des réponses aux questions de sécurité des comptes |
| Antivirus | Mail de S. LEBRUN (comptabilité) qui demande si elle peut désactiver l'antivirus | Non, transmettre à la DSI | Ne jamais désactiver une protection pour « faire passer » un fichier |
| Clé USB | Boîte de P. THIERRY | Ne pas la brancher, la remettre à la DSI | Une clé trouvée est un vecteur d'attaque classique |
| Rondes de nuit sur Facebook | Profil OSINT de P. THIERRY | (observation) | Publier ses horaires de travail aide un intrus |
| Faux recruteur Thales | Le vrai vecteur de l'attaque | (à comprendre au débriefing) | Ingénierie sociale ciblée : flatterie + argent (modèle VICE) |

## Pour le débriefing

- Insister sur le BX-4216 : l'attaque ne s'arrête pas au vol de données, un composant piégé a failli partir chez un client défense.
- Rappeler que MOREAU était seul administrateur, sans revue de code : la faille est organisationnelle autant que technique.
- Revenir sur les fausses pistes : un mobile ou une occasion ne suffit pas, il faut mobile, accès et traces.
- Faire le lien avec la séance 3 (diagnostic, préconisations priorisées, sensibilisation VICE).
