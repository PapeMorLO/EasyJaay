// Range les fichiers des zips P1/P2 dans src/ (ton projet utilise src/app).
//
// Problème : les zips posent lib/, components/ et app/ À LA RACINE. Or quand un dossier app/ existe
// à la racine, Next.js ignore src/app : il ne voit plus ton site, d'où l'erreur "root layout".
//
// Ce script :
//   1. déplace  lib/ -> src/lib/   et   components/ -> src/components/
//   2. déplace  app/[tenant]/p -> src/app/(ton-groupe)/[tenant]/p   (à côté de StorefrontClient)
//   3. supprime les dossiers vides laissés à la racine
//   4. recalcule les chemins d'import (../../lib/... etc.) dans StorefrontClient et la page produit
//
// Utilisation (à la racine du projet) :   node scripts/ranger-dans-src.mjs

import fs from "node:fs"
import path from "node:path"

if (!fs.existsSync("src/app")) {
  console.error("Pas de dossier src/app : ce script ne sert que pour un projet qui utilise src/. Rien n'a été modifié.")
  process.exit(1)
}

// --- Outils -----------------------------------------------------------------
function listerFichiers(dossier) {
  if (!fs.existsSync(dossier)) return []
  return fs.readdirSync(dossier, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listerFichiers(path.join(dossier, e.name)) : [path.join(dossier, e.name)]
  )
}

// Déplace tout le contenu de "de" vers "vers".
// Si un fichier existe déjà à destination (ex : le zip récent a déjà posé la bonne version dans src/),
// on GARDE celui de src/ et on jette simplement l'ancien exemplaire de la racine.
function deplacerContenu(de, vers) {
  let deplaces = 0
  let ignores = 0
  for (const fichier of listerFichiers(de)) {
    const destination = path.join(vers, path.relative(de, fichier))
    if (fs.existsSync(destination)) {
      fs.unlinkSync(fichier)
      ignores++
      continue
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.copyFileSync(fichier, destination)
    fs.unlinkSync(fichier)
    deplaces++
  }
  return { deplaces, ignores }
}

function supprimerSiVide(dossier) {
  if (!fs.existsSync(dossier)) return
  for (const e of fs.readdirSync(dossier, { withFileTypes: true })) {
    if (e.isDirectory()) supprimerSiVide(path.join(dossier, e.name))
  }
  if (fs.readdirSync(dossier).length === 0) fs.rmdirSync(dossier)
}

// --- 1. Où est ta boutique ? (le dossier [tenant] qui contient la page de la boutique) ---------
const tous = listerFichiers("src/app")
const reperes =
  tous.find((f) => /StorefrontClient\.(jsx|js|tsx)$/.test(f)) ||
  tous.find((f) => /[\\/]\[tenant\][\\/]page\.(jsx|js|tsx)$/.test(f))
if (!reperes) {
  console.error("Je ne trouve ni StorefrontClient.* ni une page [tenant]/page.* dans src/app. Rien n'a été modifié.")
  process.exit(2)
}
const dossierBoutique = path.dirname(reperes)
console.log(`Boutique trouvée : ${dossierBoutique}`)

// --- 2. Déplacements ----------------------------------------------------------
const resume = []
const ajouter = (nom, r) => {
  if (r.deplaces || r.ignores) {
    resume.push(`${nom} : ${r.deplaces} déplacé(s)` + (r.ignores ? `, ${r.ignores} ancien(s) exemplaire(s) supprimé(s) (déjà dans src/)` : ""))
  }
}
ajouter("lib/ -> src/lib/", deplacerContenu("lib", "src/lib"))
ajouter("components/ -> src/components/", deplacerContenu("components", "src/components"))
ajouter("app/[tenant]/p -> " + path.join(dossierBoutique, "p"), deplacerContenu(path.join("app", "[tenant]", "p"), path.join(dossierBoutique, "p")))

// --- 3. Nettoyage de la racine -------------------------------------------------
for (const d of ["lib", "components", "app"]) supprimerSiVide(d)
if (fs.existsSync("app")) {
  console.warn("ATTENTION : un dossier app/ existe encore à la racine (il contient d'autres fichiers). Next.js l'utilisera à la place de src/app : déplace son contenu dans src/app ou supprime-le.")
}

// --- 4. Recalcul des chemins d'import -------------------------------------------
const aCorriger = [...listerFichiers(path.join(dossierBoutique)).filter((f) => /\.(js|jsx|tsx)$/.test(f))]
let corriges = 0
for (const fichier of aCorriger) {
  const avant = fs.readFileSync(fichier, "utf8")
  const apres = avant.replace(/from (["'])((?:\.\.\/)+)(lib|components)\/([^"']+)\1/g, (_, q, __, dossier, reste) => {
    let rel = path.relative(path.dirname(fichier), path.join("src", dossier, reste)).split(path.sep).join("/")
    if (!rel.startsWith(".")) rel = "./" + rel
    return `from ${q}${rel}${q}`
  })
  if (apres !== avant) {
    fs.writeFileSync(fichier, apres)
    corriges++
  }
}

console.log("OK.")
resume.forEach((l) => console.log("  - " + l))
console.log(`  - chemins d'import recalculés dans ${corriges} fichier(s)`)
console.log("Supprime le dossier .next puis lance : npm run build")
