// Corrigé de l'exercice : servi uniquement à l'animateur (mot de passe vérifié), jamais présent dans les pages élèves.
module.exports = `<strong>Coupable :</strong> Julien MOREAU (DSI), recruté par ingénierie sociale (pression financière + flatterie - leviers Espèces et Vanité).<br> <strong>Vecteur initial :</strong> mail spearphishing (faux recruteur Thales), pièce jointe .docm piégée.<br> <strong>Canal de sortie :</strong> passerelle BX-GATEWAY-07 vers l'IP 185.220.101.47 (à distinguer de 10.42.6.11 = interne légitime et 20.42.73.18 = Azure NTP légitime).<br> <strong>Cause racine organisationnelle :</strong> absence de revue de code et de contrôle des changements sur le programme de supervision de la passerelle BX-GATEWAY-07, ayant permis l'introduction d'une porte dérobée par modification d'une ligne de code le 9 mai (voir onglet Programmation), détectée par le contrôle d'intégrité Wazuh FIM.<br> <strong>Fausses pistes à écarter</strong> (chacune a un mobile ou une occasion, aucune n'a les trois : mobile, accès et traces) :<br>
- Karim BENYOUCEF : dettes, comme MOREAU, mais aucun accès informatique et aucune trace dans les journaux. L'attaquant cible une personne fragile qui a les clés.<br>
- Farid HADDAD : en Chine le 2 mai et contacts SinoBoard, mais le 2 mai tout se passe sur le poste de MOREAU ; dossier SinoBoard jamais signé ni déployé (mail Achats, note Achats).<br>
- Camille ROUSSEAU : idéologie (collectif, site militant dans Wazuh), mais aucun accès technique ; absente depuis le 15 mai.<br>
- Thomas VASSEUR : trou de CV et accès au local technique, mais aucune trace informatique ; le code a été modifié à distance, depuis le poste de MOREAU.<br>
- Nathalie BRUNET : connexion à 22h01 le 17 mai, expliquée dans son mail (rapport qualité).<br>
- Marc DURAND : demande de VPN pour le 21 et 22 mai (après les faits, motif personnel) ; son quiz Facebook est le piège pédagogique sur les données personnelles.<br>
- Faux technicien (P. THIERRY) : prestataire TéléMaint Centre, ticket TICK-4147 (mail des Services généraux) ; le 6 mai, seule une coupure d'alimentation apparaît, aucune modification du code.<br>
- Balayage de ports du 12 mai (Critique dans Wazuh) : scan trimestriel annoncé par la DSI le 11 mai (Sigma-Tech, 10.42.1.30).<br>
- 20.42.73.18 : Azure NTP, ajouté officiellement le 22 avril (onglet Programmation).<br>
- Anomalie qualité BX-4216 : problème thermique indépendant, confirmé conforme.<br>
- Antoine ROBERT : accès révoqués à son départ (mail RH et fiche de sortie).<br>
- TechIndus Solutions : simple note de vigilance, aucune preuve technique.`;
