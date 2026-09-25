// Génère les PDF des Documents et des pièces jointes de mails d'ELECARM Crisis2 à partir des sources LaTeX (tex/*.tex).
// Moteur : tectonic (binaire autonome, aucune dépendance système). Sortie : pdfs/<id>.pdf
// Usage : node gen_pdfs.js
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEX_DIR = path.join(__dirname, 'tex');
const OUT_DIR = path.join(__dirname, 'pdfs');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Résout le binaire tectonic (PATH ou ~/.local/bin)
function tectonicBin() {
  const cands = ['tectonic', path.join(process.env.HOME || '', '.local/bin/tectonic')];
  for (const c of cands) {
    try { execFileSync(c, ['--version'], { stdio: 'ignore' }); return c; } catch (_) {}
  }
  throw new Error("tectonic introuvable. Installez-le : curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh");
}

const DOCS = ['ministere', 'qualite', 'note', 'contrat', 'chatlog', 'raspberry', 'gateway', 'techindus', 'conformite',
  // Pièces jointes des mails (boîte générale)
  'pj_cv_dupont', 'pj_iso9001', 'pj_fiche_sortie_robert'];

(function main() {
  const bin = tectonicBin();
  let ok = 0;
  for (const id of DOCS) {
    const src = path.join(TEX_DIR, id + '.tex');
    if (!fs.existsSync(src)) { console.error('MANQUE', src); continue; }
    execFileSync(bin, ['--outdir', OUT_DIR, '--chatter', 'minimal', src], {
      cwd: TEX_DIR, stdio: ['ignore', 'ignore', 'inherit'],
    });
    console.log('OK', id + '.pdf');
    ok++;
  }
  console.log(`\n${ok}/${DOCS.length} PDF générés dans ${OUT_DIR}`);
})();
