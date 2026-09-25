# ELECARM Crisis2 : guide rapide de l'animateur

## Les trois liens

| Lien | Pour qui | À quoi il sert |
|---|---|---|
| `https://elecarm-crisis2.vercel.app/salle` | Élèves | **Le seul lien à leur donner.** Inscription dans une équipe, attente, compte à rebours, puis entrée dans l'exercice. |
| `https://elecarm-crisis2.vercel.app/animateur` | Vous | Console : ouverture, minuteur, équipes, suppositions envoyées. Protégée par le mot de passe animateur. |
| `https://elecarm-crisis2.vercel.app/` | Personne directement | Intro de l'exercice. Tant que l'exercice n'est pas ouvert, elle renvoie vers `/salle`. |

## Déroulé d'une séance

1. **Avant l'arrivée des élèves** : ouvrez `/animateur`, entrez le mot de passe. Si des équipes d'une séance précédente apparaissent, cliquez sur **Effacer toutes les équipes**.
2. **Ouvrir la salle d'attente.** Donnez le lien `/salle` aux élèves.
3. **Inscriptions** : chaque élève saisit son prénom, puis crée son équipe ou rejoint une équipe existante (8 personnes maximum par équipe). Les équipes s'affichent en direct dans votre console.
4. **Réglez la durée de l'exercice** (champ « Durée de l'exercice, minuteur », par exemple 160 minutes).
5. **Lancez** :
   - **Commencer maintenant** : l'exercice s'ouvre tout de suite et le minuteur démarre ;
   - ou **Lancer avec compte à rebours** : un décompte synchronisé s'affiche chez tous les élèves, l'exercice s'ouvre à zéro.
6. **Pendant l'exercice**, vous pouvez :
   - ajuster le minuteur (**- 5 min**, **+ 5 min**, **+ 15 min**, **Repartir de la durée choisie**) ;
   - **Fermer (pause)** : l'exercice se bloque sur tous les postes et le minuteur s'arrête. **Rouvrir** : tout reprend là où c'était ;
   - suivre les suppositions de chaque équipe (auteur, heure, note sur 5, réponses choisies).
7. **Quand le minuteur arrive à zéro**, les élèves voient « Temps écoulé », mais **l'exercice continue** : c'est vous qui décidez quand fermer.
8. **Fin de séance** : **Fermer (pause)** ou **Mettre en veille**.

Un réglage (fermeture, ajout de temps) met jusqu'à 20 secondes à arriver sur les postes des élèves.

## Les suppositions (onglet SUPPOSITIONS)

- 5 questions à choix (employé, vecteur d'entrée, adresse IP, faille organisationnelle, leviers VICE). Toutes les propositions viennent du dossier, dont plusieurs fausses pistes.
- **5 tentatives par équipe**, partagées entre tous les postes de l'équipe. Recharger la page ou changer d'ordinateur ne remet rien à zéro.
- Retour donné aux élèves : « loin du compte », « vous vous rapprochez », « presque », « bonne voie ». Jamais le détail question par question.
- La correction se fait sur le serveur : la bonne réponse n'est pas lisible dans le navigateur.
- Dans la console : **Remettre les tentatives à zéro** pour une équipe, **Supprimer** une équipe, **×** pour retirer un élève d'une équipe.

## Réponses attendues

| Question | Réponse |
|---|---|
| Employé | Julien MOREAU, responsable DSI |
| Vecteur d'entrée | Mail de faux recruteur Thales avec pièce jointe Word piégée (.docm) |
| Adresse IP | 185.220.101.47 (10.42.6.11 = supervision interne, 20.42.73.18 = Azure NTP, légitimes) |
| Faille organisationnelle | Modification du code du programme de supervision sans revue ni contrôle des changements |
| Leviers VICE | Vanité + Espèces |

La même solution, avec les fausses pistes à écarter, est aussi visible dans l'exercice via le bouton **ANIM** en haut à droite.

## En cas de problème

| Situation | Que faire |
|---|---|
| Un élève est renvoyé vers `/salle` | Normal si l'exercice n'est pas ouvert ou s'il n'a pas d'équipe : il s'inscrit, puis entre automatiquement. |
| Un élève s'est trompé d'équipe | Avant l'ouverture : bouton « Changer d'équipe » sur `/salle`. Après : retirez-le avec **×** dans la console, il se réinscrit sur `/salle`. |
| Une équipe a épuisé ses tentatives par erreur | **Remettre les tentatives à zéro**. |
| Le serveur ne répond pas | L'exercice reste jouable, mais les suppositions ne peuvent pas être envoyées. |

## Limites à connaître

- Le stockage (Vercel Blob, offre gratuite) autorise environ 10 000 lectures et 2 000 écritures par mois ; en cas de dépassement, il est bloqué 30 jours. Une séance en consomme quelques milliers en lecture et environ 200 en écriture.
- La progression de lecture (mails lus, notes) reste enregistrée sur chaque ordinateur ; les équipes et les suppositions sont enregistrées sur le serveur.
