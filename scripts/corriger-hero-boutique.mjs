// Correctif du bandeau « À la une » (lot 1) : quand la photo est haute, la ligne de la grille grandissait avec elle
// et poussait le titre, le prix et le bouton « Commander » hors de la carte (coupés par overflow-hidden).
// On force la ligne à rester de la hauteur de la carte et on borne la photo.
// À lancer à la racine du projet :
//   node scripts/corriger-hero-boutique.mjs "src/app/(storefront)/[tenant]/page.jsx"
// Copie de sécurité .bak-hero, arrêt sans rien écrire si un repère manque, relançable sans risque.
import fs from "node:fs"

const cible = process.argv[2]
if (!cible || !fs.existsSync(cible)) {
  console.error('Donne le chemin de ton page.jsx, par exemple :\n  node scripts/corriger-hero-boutique.mjs "src/app/(storefront)/[tenant]/page.jsx"')
  process.exit(1)
}

const brut = fs.readFileSync(cible, "utf8")
const avaitCRLF = brut.includes("\r\n")
let src = brut.replace(/\r\n/g, "\n")

if (src.includes("[LOT1B-BOUTIQUE]")) {
  console.log("Le correctif est déjà appliqué sur ce fichier. Rien à faire.")
  process.exit(0)
}

const erreurs = []
function remplacer(nom, ancien, nouveau) {
  const n = src.split(ancien).length - 1
  if (n !== 1) { erreurs.push(`${nom} : ${n} occurrence(s) trouvée(s), 1 attendue`); return }
  src = src.replace(ancien, nouveau)
}

// 1. La grille : une seule ligne, de la hauteur de la carte (et pas plus)
remplacer("grille", "absolute inset-0 grid md:grid-cols-2 transition-opacity",
  "absolute inset-0 grid grid-rows-1 md:grid-cols-2 transition-opacity")
// 2. La photo : jamais plus haute que la carte
remplacer("photo", `<div className="absolute inset-0 md:static md:order-2 bg-white">`,
  `<div className="absolute inset-0 md:static md:order-2 md:h-full md:min-h-0 overflow-hidden bg-white">`)
// 3. Le texte : peut se réduire au lieu de déborder
remplacer("texte", `<div className="relative z-10 md:order-1 flex flex-col justify-center`,
  `<div className="relative z-10 min-h-0 md:order-1 flex flex-col justify-center`)
// Trace du correctif (sert au « déjà appliqué »)
remplacer("marqueur", "// [LOT1-BOUTIQUE] Bandeau « À la une »",
  "// [LOT1B-BOUTIQUE] correctif : ligne de grille bornée à la hauteur de la carte\n// [LOT1-BOUTIQUE] Bandeau « À la une »")

if (erreurs.length) {
  console.error("Rien n'a été modifié. Problèmes :\n - " + erreurs.join("\n - "))
  process.exit(1)
}
fs.copyFileSync(cible, cible + ".bak-hero")
fs.writeFileSync(cible, avaitCRLF ? src.replace(/\n/g, "\r\n") : src)
console.log("Correctif appliqué. Copie de sécurité : " + cible + ".bak-hero")
