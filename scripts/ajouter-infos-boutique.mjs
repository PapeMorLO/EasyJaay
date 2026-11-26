// Ajoute le bloc "InfosBoutique" dans ton composant boutique : l'import + la balise.
//
// Utilisation (à la racine du projet Next) :
//   node scripts/ajouter-infos-boutique.mjs "app/[tenant]/StorefrontClient.js"
//
// - fait une copie  <fichier>.avant-p2.bak  avant de modifier
// - ne modifie RIEN si un repère manque (et te dit lequel)
// - peut être relancé sans risque : s'il est déjà appliqué, il le dit et s'arrête

import fs from "node:fs"
import path from "node:path"

const cible = process.argv[2]
if (!cible || !fs.existsSync(cible)) {
  console.error('Usage : node scripts/ajouter-infos-boutique.mjs "app/[tenant]/StorefrontClient.js"')
  process.exit(1)
}

const original = fs.readFileSync(cible, "utf8")
const crlf = original.includes("\r\n")          // fichier Windows : on garde ses fins de ligne
let texte = original.replace(/\r\n/g, "\n")

const dejaLa = texte.includes("InfosBoutique")   // déjà installé (peut-être ailleurs : on le déplace alors)

// 1. Où est le dossier "components" ? (à la racine, ou dans src/)
const racine = fs.existsSync("src/components") || (fs.existsSync("src") && !fs.existsSync("components")) ? "src" : "."
const cheminComposant = path.join(racine, "components", "InfosBoutique.jsx")
if (!fs.existsSync(cheminComposant)) {
  console.error(`Je ne trouve pas ${cheminComposant}. Dézippe d'abord diayrek-frontend-p2.zip à la racine du projet.`)
  process.exit(2)
}

// 2. Chemin relatif depuis le fichier boutique jusqu'au composant (ex : ../../components/InfosBoutique)
let relatif = path.relative(path.dirname(cible), cheminComposant.replace(/\.jsx$/, "")).split(path.sep).join("/")
if (!relatif.startsWith(".")) relatif = "./" + relatif
const ligneImport = `import InfosBoutique from "${relatif}"`

// 3. Repère pour l'import : la dernière ligne "import ... from ..." du haut du fichier
const lignes = texte.split("\n")
let dernierImport = -1
for (let i = 0; i < lignes.length; i++) {
  if (/^import .* from ["'].*["'];?\s*$/.test(lignes[i]) || /^} from ["'].*["'];?\s*$/.test(lignes[i])) dernierImport = i
  if (/^(export|function|const) /.test(lignes[i]) && dernierImport >= 0) break   // fin de la zone des imports
}
if (dernierImport < 0) {
  console.error("Repère manquant : je ne trouve pas les lignes `import ...` en haut du fichier. Rien n'a été modifié.")
  process.exit(2)
}

// 4. Repère pour la balise : en bas de page, juste avant le pied de page (Footer)
let iBalise = lignes.findIndex((l) => l.includes("COMPOSANT : FOOTER"))
if (iBalise < 0) iBalise = lignes.findIndex((l) => /^\s*<Footer[\s>]/.test(l))
if (iBalise < 0) {
  console.error("Repère manquant : je ne trouve ni `COMPOSANT : FOOTER` ni `<Footer`. Rien n'a été modifié.\nAjoute la balise à la main (voir LISEZMOI-FRONT-P2.md).")
  process.exit(2)
}

// Si le bloc est déjà installé ailleurs (ex : version précédente, avant le catalogue), on l'enlève pour le replacer
if (dejaLa) {
  const iAncienne = lignes.findIndex((l) => /<InfosBoutique[\s/]/.test(l))
  if (iAncienne < 0) {
    console.error("InfosBoutique est cité dans le fichier mais je ne trouve pas la balise <InfosBoutique ... />. Rien n'a été modifié.")
    process.exit(2)
  }

  // Déjà juste avant le pied de page (seulement des lignes vides entre les deux) : rien à faire
  const entre = lignes.slice(iAncienne + 1, iBalise)
  if (iAncienne < iBalise && entre.every((l) => l.trim() === "")) {
    console.log("Déjà en bas de page, avant le pied de page. Rien à faire.")
    process.exit(0)
  }

  const nb = lignes[iAncienne + 1] !== undefined && lignes[iAncienne + 1].trim() === "" ? 2 : 1   // la balise + la ligne vide qui suit
  lignes.splice(iAncienne, nb)
  if (iAncienne < iBalise) iBalise -= nb
}

// 5. Les variables utilisées : "tenant" est obligatoire, "brandColor" est facultatif
if (!/\btenant\b/.test(texte)) {
  console.error("Repère manquant : la variable `tenant` n'existe pas dans ce fichier. Rien n'a été modifié.")
  process.exit(2)
}
const propCouleur = /\bbrandColor\b/.test(texte) ? " couleur={brandColor}" : ""

const indentation = (lignes[iBalise].match(/^\s*/) || [""])[0]
const balise = `${indentation}<InfosBoutique tenant={tenant}${propCouleur} />\n`

// 6. On applique (la balise d'abord, car elle est plus bas : les numéros de ligne ne bougent pas)
lignes.splice(iBalise, 0, balise.trimEnd(), "")
if (!dejaLa) lignes.splice(dernierImport + 1, 0, ligneImport)
texte = lignes.join("\n")

fs.writeFileSync(cible + ".avant-p2.bak", original)
fs.writeFileSync(cible, crlf ? texte.replace(/\n/g, "\r\n") : texte)

console.log(dejaLa ? "OK : InfosBoutique déplacé en bas de page." : "OK : InfosBoutique ajouté.")
console.log(`  import  : ${ligneImport}`)
console.log(`  balise  : <InfosBoutique tenant={tenant}${propCouleur} />  (en bas de page, avant le pied de page)`)
console.log(`  copie   : ${cible}.avant-p2.bak`)
console.log("Lance maintenant : npm run build")
