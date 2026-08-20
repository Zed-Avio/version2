const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'pdfs');
fs.mkdirSync(OUT_DIR, { recursive: true });

const LETTERHEADS = {
  gouv: `<div class="lh lh-gouv">
    <div class="tricolore"></div>
    <div class="lh-row">
      <div>
        <div class="lh-rf">RÉPUBLIQUE FRANÇAISE</div>
        <div class="lh-devise">Liberté - Égalité - Fraternité</div>
        <div class="lh-org">MINISTÈRE DE L'INTÉRIEUR</div>
        <div class="lh-sub">Direction Générale de la Sécurité Intérieure</div>
      </div>
    </div>
  </div>`,
  elecarm: `<div class="lh lh-elecarm">
    <div class="lh-row">
      <div class="lh-mark"></div>
      <div>
        <div class="lh-org">ELECARM SAS</div>
        <div class="lh-sub">ZI Les Charmes - 41000 Blois - contact@elecarm.fr</div>
      </div>
    </div>
  </div>`,
  thales: `<div class="lh lh-thales">
    <div class="lh-row">
      <div>
        <div class="lh-org">THALES DEFENCE SYSTEMS</div>
        <div class="lh-sub">Division Systèmes de guidage - Diffusion Restreinte</div>
      </div>
    </div>
  </div>`,
};

const DOCS = [
  {
    id: 'ministere', letterhead: 'gouv',
    title: 'Directive nationale de vigilance - Secteurs sensibles',
    meta: 'Circulaire MININT-DGSI-2026-0517 - 18 mai 2026 - Diffusion : sous-traitants industrie de la défense',
    body: `
      <p>Dans le contexte géopolitique actuel et à l'approche des élections présidentielles, le niveau de vigilance des entreprises opérant dans des secteurs sensibles (défense, énergie, santé, infrastructures critiques) est relevé. Plusieurs incidents récents témoignent d'un intérêt accru d'acteurs hostiles pour ces organisations, avec un mode opératoire récurrent : l'exploitation de vulnérabilités humaines plutôt que de failles purement techniques.</p>
      <h2>Obligations pour les sous-traitants de l'industrie de la défense</h2>
      <p>Tout sous-traitant intervenant sur un programme classé Diffusion Restreinte doit transmettre, sous <strong>15 jours</strong> à compter de la réception de la présente circulaire, un rapport d'analyse de sécurité comportant :</p>
      <ol>
        <li>Un diagnostic des vulnérabilités organisationnelles et techniques identifiées</li>
        <li>Un plan de préconisations correctives priorisées</li>
        <li>Un rappel de sensibilisation du personnel aux techniques de manipulation</li>
      </ol>
      <h2>Rappel - les 4 leviers de manipulation humaine (VICE)</h2>
      <table>
        <thead><tr><th>Levier</th><th>Principe</th></tr></thead>
        <tbody>
          <tr><td>Vanité</td><td>Flatter l'ego de la cible, lui proposer un statut ou une reconnaissance qu'elle n'a pas en interne.</td></tr>
          <tr><td>Idéologie</td><td>Faire appel à des convictions personnelles pour justifier une trahison.</td></tr>
          <tr><td>Contrainte</td><td>Faire pression par la menace, le chantage ou l'exploitation d'une faute passée.</td></tr>
          <tr><td>Espèces</td><td>Offrir un avantage financier direct pour compenser une difficulté matérielle ressentie par la cible.</td></tr>
        </tbody>
      </table>
      <p class="note">Rappel : une cible n'est presque jamais recrutée par un seul levier isolé. C'est généralement la combinaison de plusieurs signaux qui crée une fenêtre d'opportunité pour un acteur malveillant.</p>
    `
  },
  {
    id: 'qualite', letterhead: 'elecarm',
    title: 'Rapport de Contrôle Qualité - Lot BX-4400-A',
    meta: 'N. BRUNET - Responsable Qualité - 18 mai 2026',
    body: `
      <table>
        <thead><tr><th>Paramètre</th><th>Valeur nominale</th></tr></thead>
        <tbody>
          <tr><td>Tension entrée</td><td>24 V DC</td></tr>
          <tr><td>Intensité nominale</td><td>0,8 A</td></tr>
          <tr><td>Puissance moyenne</td><td>19 W</td></tr>
          <tr><td>Tolérance intensité</td><td>+/- 5%</td></tr>
          <tr><td>Tolérance test interne</td><td>+/- 10%</td></tr>
          <tr><td>Température fonctionnement</td><td>10 - 45 °C</td></tr>
        </tbody>
      </table>
      <h2>Mesures lot S42 - Série BX-4400-A</h2>
      <table>
        <thead><tr><th>N° boîtier</th><th>Intensité (A)</th><th>Puissance (W)</th><th>Temp (°C)</th></tr></thead>
        <tbody>
          <tr><td>BX-4211</td><td>0,79</td><td>18,9</td><td>32</td></tr>
          <tr><td>BX-4212</td><td>0,83</td><td>19,9</td><td>34</td></tr>
          <tr><td>BX-4213</td><td>0,88</td><td>21,1</td><td>36</td></tr>
          <tr><td>BX-4214</td><td>0,76</td><td>18,2</td><td>30</td></tr>
          <tr><td>BX-4215</td><td>0,91</td><td>21,8</td><td>41</td></tr>
          <tr class="anomaly"><td>BX-4216</td><td>1,12</td><td>26,9</td><td>33</td></tr>
          <tr><td>BX-4217</td><td>0,87</td><td>20,8</td><td>37</td></tr>
          <tr><td>BX-4218</td><td>0,81</td><td>19,4</td><td>35</td></tr>
          <tr><td>BX-4219</td><td>0,93</td><td>22,3</td><td>44</td></tr>
        </tbody>
      </table>
      <p>Valeur nominale : 0,8 A - Tolérance interne : +/- 10% (0,72 à 0,88 A). Le lot présente une dispersion globalement cohérente avec les conditions thermiques de l'atelier cette semaine.</p>
    `
  },
  {
    id: 'note', letterhead: 'elecarm',
    title: 'Note technique interne - BX-4400',
    meta: 'Service Montage (Y. FERREIRA) - 17 mai 2026 - Objet : Variations de mesures lot S42',
    body: `
      <blockquote>"On a eu pas mal de variations cette semaine avec la chaleur dans l'atelier. Rien d'alarmant selon moi, ça reste dans les clous."</blockquote>
      <blockquote>"Les boîtiers BX-4400-A peuvent présenter une augmentation de consommation jusqu'à +15% en environnement chaud (&gt;40°C), sans impact fonctionnel."</blockquote>
    `
  },
  {
    id: 'contrat', letterhead: 'thales',
    title: 'Bon de commande - Confidentiel',
    meta: 'Thales Defence Systems vers ELECARM SAS - mars 2026',
    body: `
      <table>
        <thead><tr><th>Champ</th><th>Valeur</th></tr></thead>
        <tbody>
          <tr><td>Référence commande</td><td>THA-REF-28471</td></tr>
          <tr><td>Produits</td><td>Coffrets BX-4400-A (24 unités)</td></tr>
          <tr><td>Valeur totale</td><td>187 200 EUR HT</td></tr>
          <tr><td>Livraison prévue</td><td>23 mai 2026 - URGENT</td></tr>
          <tr><td>Usage final</td><td>Programme classé DR - Systèmes guidage</td></tr>
        </tbody>
      </table>
      <p class="note">Clause pénale : retard &gt; 5 jours ouvrés = pénalité 0,5%/jour plafonnée à 10% de la valeur du marché.</p>
    `
  },
  {
    id: 'chatlog', letterhead: 'elecarm',
    title: 'Extraction messagerie interne - Poste WS-MOREAU-01',
    meta: 'Messages Teams de J. MOREAU - 19 mai 2026 - Audit messagerie interne, extraction du 20 mai 2026',
    body: `
      <pre>08h09 - C'est le chaos ce matin. Réunion de crise à 10h, la DSI a repéré un truc grave sur la passerelle BX.
08h17 - J'aurais besoin d'en parler à quelqu'un. En privé.
09h15 - Y a un truc que j'ai pas dit à l'équipe d'audit. C'est probablement rien... mais ça me ronge.
10h47 - En fait j'ai validé un accès distant sur la passerelle BX-GATEWAY-07 courant mai. Pour un soi-disant test technique demandé en urgence. Si ça sort sans contexte, ça va très mal se passer pour moi.
11h55 - Je suis pas à l'origine de tout ça. Mais j'ai peut-être facilité les choses sans le réaliser. J'avais pas compris à quoi ça allait servir.
12h28 - L'IP externe vient d'être confirmée malveillante par la DSI. Je crois que j'ai vraiment un problème.</pre>
      <p class="note">Destinataire des messages non identifié dans l'extraction : conversation privée, compte externe au domaine elecarm.fr.</p>
    `
  },
  {
    id: 'raspberry', letterhead: 'elecarm',
    title: 'Note interne - Changement fournisseur passerelles de télémaintenance',
    meta: 'Service Achats - 28 avril 2026',
    body: `
      <p>Les boîtiers BX-4400-A livrés aux clients sont équipés d'une passerelle de télémaintenance (carte Raspberry Pi) permettant à ELECARM de superviser à distance leur fonctionnement et de déployer des mises à jour.</p>
      <table>
        <thead><tr><th>Champ</th><th>Valeur</th></tr></thead>
        <tbody>
          <tr><td>Ancien fournisseur</td><td>RS Components (référence homologuée)</td></tr>
          <tr><td>Nouveau fournisseur</td><td>SinoBoard Electronics Ltd (Shenzhen)</td></tr>
          <tr><td>Motif</td><td>Délai de livraison réduit de 6 à 2 semaines, coût unitaire -30%</td></tr>
          <tr class="anomaly"><td>Validation sécurité DSI</td><td>Non réalisée - urgence commande Thales</td></tr>
          <tr><td>Date de première livraison</td><td>2 mai 2026</td></tr>
        </tbody>
      </table>
      <p class="note">À noter : le changement de fournisseur a été validé par Y. FERREIRA (Service Montage) sans passage par la procédure habituelle de revue sécurité DSI, pour tenir les délais de la commande THA-REF-28471.</p>
    `
  },
  {
    id: 'gateway', letterhead: 'elecarm',
    title: 'Journal de supervision - Passerelle télémaintenance boîtiers BX-4400',
    meta: 'Export système - Passerelle BX-GATEWAY-07 - période du 1er au 19 mai 2026',
    body: `
      <table>
        <thead><tr><th>Date</th><th>Adresse IP destination</th><th>Type</th><th>Volume</th></tr></thead>
        <tbody>
          <tr><td>02/05</td><td>10.42.6.11</td><td>Supervision interne (serveur ELECARM)</td><td>4 Mo</td></tr>
          <tr><td>06/05</td><td>10.42.6.11</td><td>Supervision interne (serveur ELECARM)</td><td>3 Mo</td></tr>
          <tr><td>07/05</td><td>20.42.73.18</td><td>Externe - synchronisation horaire (Microsoft Azure NTP)</td><td>40 Ko</td></tr>
          <tr class="anomaly"><td>09/05</td><td>185.220.101.47</td><td>Adresse externe - non répertoriée</td><td>412 Mo</td></tr>
          <tr><td>11/05</td><td>10.42.6.11</td><td>Supervision interne (serveur ELECARM)</td><td>3 Mo</td></tr>
          <tr class="anomaly"><td>14/05</td><td>185.220.101.47</td><td>Adresse externe - non répertoriée</td><td>528 Mo</td></tr>
          <tr><td>16/05</td><td>20.42.73.18</td><td>Externe - synchronisation horaire (Microsoft Azure NTP)</td><td>38 Ko</td></tr>
          <tr class="anomaly"><td>18/05</td><td>185.220.101.47</td><td>Adresse externe - non répertoriée</td><td>601 Mo</td></tr>
        </tbody>
      </table>
      <p>L'adresse 10.42.6.11 correspond au serveur de supervision interne officiel d'ELECARM. L'adresse 20.42.73.18 est externe mais légitime (synchronisation horaire Microsoft Azure, volume constant et négligeable). L'adresse 185.220.101.47 n'appartient à aucun équipement ELECARM répertorié, n'apparaît dans aucune documentation fournisseur, et transporte un volume incompatible avec de la simple télémétrie.</p>
    `
  },
  {
    id: 'techindus', letterhead: 'elecarm',
    title: 'Note de vigilance - Concurrence TechIndus Solutions',
    meta: 'Direction Générale ELECARM SAS - 2 avril 2026 - Diffusion : encadrement et commercial',
    body: `
      <p>Plusieurs entreprises du secteur nous ont rapporté des approches insistantes de la société TechIndus Solutions (Orléans), concurrente directe sur le segment des coffrets et armoires électriques industrielles. Le mode opératoire rapporté : prises de contact sous couvert d'offres d'emploi ou de partenariats commerciaux, avec des questions détaillées sur les clients, les procédés et les certifications des salariés approchés.</p>
      <p>Aucun incident de ce type n'a été rapporté à ce jour au sein d'ELECARM SAS. Cette note est diffusée à titre préventif.</p>
      <p class="note">Consigne : toute sollicitation professionnelle inhabituelle, en particulier orientée vers des informations client ou technique, doit être signalée à la Direction.</p>
    `
  },
];

function page(doc) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Georgia',serif;color:#111;font-size:12.5px;line-height:1.6;padding:44px 52px}
    .lh{margin-bottom:26px;padding-bottom:14px;border-bottom:2px solid #111}
    .tricolore{height:5px;background:linear-gradient(to right,#002654 33%,#fff 33%,#fff 66%,#ED2939 66%);margin-bottom:10px}
    .lh-row{display:flex;align-items:center;gap:12px}
    .lh-mark{width:26px;height:26px;background:#7f1d1d;flex-shrink:0}
    .lh-rf{font-size:10px;letter-spacing:.15em;font-weight:700}
    .lh-devise{font-size:9px;font-style:italic;color:#444;margin-bottom:4px}
    .lh-org{font-size:14px;font-weight:700;letter-spacing:.03em}
    .lh-sub{font-size:10px;color:#555;margin-top:2px}
    h1{font-family:Arial,sans-serif;font-size:18px;margin-bottom:4px}
    .meta{font-family:Arial,sans-serif;font-size:10.5px;color:#555;margin-bottom:22px;padding-bottom:14px;border-bottom:1px solid #ccc}
    h2{font-family:Arial,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:18px 0 8px;color:#7f1d1d}
    p{margin-bottom:10px}
    ol{margin:8px 0 10px 20px}
    li{margin-bottom:4px}
    table{width:100%;border-collapse:collapse;margin:10px 0 14px;font-size:11.5px}
    th{text-align:left;font-family:Arial,sans-serif;font-size:9.5px;text-transform:uppercase;letter-spacing:.04em;color:#555;border-bottom:1.5px solid #111;padding:5px 8px}
    td{padding:5px 8px;border-bottom:1px solid #ddd}
    tr.anomaly td{background:#fbeaea;font-weight:700}
    blockquote{background:#f4f4f4;border-left:3px solid #999;padding:10px 14px;margin-bottom:10px;font-style:italic}
    pre{background:#f4f4f4;border:1px solid #ddd;padding:12px 14px;font-family:'Courier New',monospace;font-size:11px;line-height:2;white-space:pre-wrap;margin-bottom:10px}
    .note{background:#f8f4e8;border-left:3px solid #b8860b;padding:10px 14px;font-size:11.5px}
    .footer{margin-top:30px;padding-top:10px;border-top:1px solid #ccc;font-size:9px;color:#888;font-family:Arial,sans-serif}
  </style></head><body>
    ${LETTERHEADS[doc.letterhead]}
    <h1>${doc.title}</h1>
    <div class="meta">${doc.meta}</div>
    ${doc.body}
    <div class="footer">Document produit dans le cadre de l'exercice pédagogique ELECARM SAS - Operation Silent Gateway - usage interne exclusivement.</div>
  </body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  for (const doc of DOCS) {
    const p = await browser.newPage();
    await p.setContent(page(doc));
    await p.pdf({ path: path.join(OUT_DIR, doc.id + '.pdf'), format: 'A4', margin: { top: '0', bottom: '0', left: '0', right: '0' }, printBackground: true });
    await p.close();
    console.log('OK', doc.id + '.pdf');
  }
  await browser.close();
})();
