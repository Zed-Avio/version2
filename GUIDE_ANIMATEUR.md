# ELECARM Crisis2 : guide rapide de l'animateur

## Les trois liens

| Lien | Pour qui | À quoi il sert |
|---|---|---|
| `https://elecarm-crisis2.vercel.app/salle` | Élèves | **Le seul lien à leur donner.** Choix du TD, du groupe, saisie du nom, attente, puis entrée dans l'exercice. |
| `https://elecarm-crisis2.vercel.app/animateur` | Vous | Console : groupes, ouverture, messages, suppositions envoyées. Protégée par le mot de passe animateur. |
| `https://elecarm-crisis2.vercel.app/` | Personne directement | Intro de l'exercice. Tant que l'exercice n'est pas ouvert ou que l'élève n'a pas de groupe, elle renvoie vers `/salle`. |

## Déroulé d'une séance

1. **Avant l'arrivée des élèves** : ouvrez `/animateur`, entrez le mot de passe.
   - Première fois : carte **Groupes**, laissez 4 TD, 4 groupes par TD, 6 places, puis **Créer les groupes** (TD1 à TD4, Groupe 1 à 4).
   - Séances suivantes : **Vider les groupes (nouvelle séance)** garde les groupes et efface élèves, suppositions et messages.
2. **Ouvrir la salle d'attente.** Donnez le lien `/salle` aux élèves.
3. **Chaque élève** appuie sur son TD, puis sur son groupe, tape son nom et prénom et valide. Il ne peut rien créer. Un groupe complet est grisé. Vous voyez les noms arriver en direct dans la console.
4. **Vous gérez les groupes** à tout moment (avant ou pendant l'exercice) :
   - **+ place** / **- place** sur un groupe (de 1 à 12 places) ;
   - **⇄** à côté d'un élève : le déplacer dans un autre groupe (son poste suit tout seul, sans rien perdre) ;
   - **×** : le retirer (il rejoint à nouveau depuis `/salle`) ;
   - **+ Ajouter un groupe** dans un TD, **+ Ajouter un TD**, **Supprimer** un groupe.
5. **Lancez** : **Ouvrir l'exercice** (le jeu se lance tout de suite pour tous les élèves sur `/salle`) ou **Lancer avec compte à rebours**. Un élève doit avoir rejoint un groupe pour entrer dans le jeu.
6. **Pendant l'exercice** : messages avec les groupes, **Relance**, suivi des suppositions. **Fermer (pause)** bloque l'exercice sur tous les postes, **Rouvrir** le relance là où il en était.
7. **Il n'y a pas de limite de temps** : l'exercice reste ouvert jusqu'à ce que vous le fermiez.
8. **Fin de séance** : **Fermer (pause)** ou **Mettre en veille**.

Un réglage (fermeture, déplacement d'un élève) met jusqu'à 20 secondes à arriver sur les postes des élèves.

## Messages avec les groupes

- Côté élèves : bouton **Écrire à l'animateur** en bas à droite de l'exercice. Toute l'équipe voit la même discussion, sur tous ses postes.
- Côté console, carte **Messages des équipes** : une discussion par équipe, avec un compteur de messages non lus. Le titre de l'onglet du navigateur affiche aussi ce nombre, et un petit son signale chaque nouveau message.
- Cliquez sur une équipe pour lire et répondre (Entrée pour envoyer).
- **Envoyer à toutes les équipes** : pour une annonce générale (« plus que 30 minutes », « pensez à l'onglet Documents »...). Elle apparaît dans la discussion de chaque équipe.
- Délais : une réponse arrive en quelques secondes si l'équipe a la discussion ouverte, en 20 secondes au plus sinon (avec une notification).

## Les suppositions (onglet SUPPOSITIONS)

- 5 questions à choix (employé, vecteur d'entrée, adresse IP, faille organisationnelle, leviers VICE). Toutes les propositions viennent du dossier, dont plusieurs fausses pistes.
- **5 tentatives par équipe**, partagées entre tous les postes de l'équipe. Recharger la page ou changer d'ordinateur ne remet rien à zéro.
- Retour donné aux élèves : « loin du compte », « vous vous rapprochez », « presque », « bonne voie ». Jamais le détail question par question.
- La correction se fait sur le serveur : la bonne réponse n'est pas lisible dans le navigateur.
- Dans la console, carte **Suppositions des groupes** : **Remettre les tentatives à zéro** pour un groupe.

## Réponses attendues

| Question | Réponse |
|---|---|
| Employé | Julien MOREAU, responsable DSI |
| Vecteur d'entrée | Mail de faux recruteur Thales avec pièce jointe Word piégée (.docm) |
| Adresse IP | 185.220.101.47 (10.42.6.11 = supervision interne, 20.42.73.18 = Azure NTP, légitimes) |
| Faille organisationnelle | Modification du code du programme de supervision sans revue ni contrôle des changements |
| Leviers VICE | Vanité + Espèces |

Le corrigé complet (avec les fausses pistes à écarter) est dans la console, carte **Corrigé**. Il est aussi accessible dans l'exercice via le bouton **ANIM** en haut à droite, **uniquement avec le mot de passe animateur** : le corrigé n'est jamais présent dans les pages des élèves.

## En cas de problème

| Situation | Que faire |
|---|---|
| Un élève est renvoyé vers `/salle` | Normal si l'exercice n'est pas ouvert ou s'il n'a pas de groupe : il rejoint son groupe, puis entre automatiquement. |
| Un élève s'est trompé de groupe | Avant l'ouverture : bouton « Changer de groupe » sur `/salle`. À tout moment : **⇄** dans la console pour le déplacer. |
| Un groupe est complet mais il manque une place | **+ place** sur ce groupe. |
| Une équipe a épuisé ses tentatives par erreur | **Remettre les tentatives à zéro**. |
| Le serveur ne répond pas | L'exercice reste jouable, mais les suppositions ne peuvent pas être envoyées. |

## Limites à connaître

- Le stockage (Vercel Blob, offre gratuite) autorise environ 10 000 lectures et 2 000 écritures par mois ; en cas de dépassement, il est bloqué 30 jours. Une séance en consomme quelques milliers en lecture et environ 200 en écriture.
- La progression de lecture (mails lus, notes) reste enregistrée sur chaque ordinateur ; les équipes et les suppositions sont enregistrées sur le serveur.
