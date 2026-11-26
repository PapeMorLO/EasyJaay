// Lot 2b de la refonte de la boutique : un seul pied de page bleu nuit à la place du cadre blanc d'infos + de l'ancien Footer.
// À lancer APRÈS les lots 1 et 2, à la racine du projet :
//   node scripts/appliquer-lot2b-boutique.mjs "src/app/(storefront)/[tenant]/page.jsx"
// Même sécurité que les lots précédents : copie .bak-lot2b, arrêt sans rien écrire si un repère manque, relançable sans risque.
import fs from "node:fs"

const cible = process.argv[2]
if (!cible || !fs.existsSync(cible)) {
  console.error('Donne le chemin de ton page.jsx, par exemple :\n  node scripts/appliquer-lot2b-boutique.mjs "src/app/(storefront)/[tenant]/page.jsx"')
  process.exit(1)
}

const brut = fs.readFileSync(cible, "utf8")
const avaitCRLF = brut.includes("\r\n")
let src = brut.replace(/\r\n/g, "\n")

if (src.includes("[LOT2B-BOUTIQUE]")) {
  console.log("Le lot 2b est déjà appliqué sur ce fichier. Rien à faire.")
  process.exit(0)
}
if (!src.includes("[LOT2-BOUTIQUE]")) {
  console.error("Applique d'abord les lots 1 et 2, puis relance ce script.")
  process.exit(1)
}

const erreurs = []

// 1. Import : PiedDePage remplace InfosBoutique (le fichier InfosBoutique.jsx ne sert plus, tu peux le supprimer)
const ligneImport = `import InfosBoutique from "../../../components/InfosBoutique"`
if (src.split(ligneImport).length - 1 !== 1) erreurs.push("import InfosBoutique : 1 occurrence attendue")
else src = src.replace(ligneImport, `// [LOT2B-BOUTIQUE] pied de page unique (infos du vendeur + copyright), à la place du cadre blanc d'infos et de l'ancien Footer\nimport PiedDePage from "../../../components/PiedDePage"`)

// 2. Le JSX : <InfosBoutique .../> + <Footer .../>  devient  <PiedDePage .../>
const regexJsx = /<InfosBoutique[^>]*\/>\s*\{\/\* 7\. COMPOSANT : FOOTER \*\/\}\s*<Footer[\s\S]*?\/>/g
const nbJsx = (src.match(regexJsx) || []).length
if (nbJsx !== 1) erreurs.push(`bloc <InfosBoutique/> + <Footer/> : ${nbJsx} occurrence(s) trouvée(s), 1 attendue`)
else src = src.replace(regexJsx, `{/* [LOT2B-BOUTIQUE] 7. PIED DE PAGE : infos du vendeur, paiements, contacts, réseaux */}
      <PiedDePage
        infos={infos}
        shopName={resolvedShopName}
        brandColor={brandColor}
        logoUrl={resolvedLogo ? getImageUrl(resolvedLogo, BASE_URL) : null}
        texteSurCouleur={couleurTexte(brandColor || "#10b981")}
        whatsapp={resolvedWhatsapp}
      />`)

// 3. L'ancien composant Footer (dernier du fichier) n'est plus utilisé : on le retire
const reperePied = "// --- COMPOSANT : FOOTER"
const posPied = src.indexOf(reperePied)
if (posPied === -1) erreurs.push("ancien composant Footer introuvable")
else {
  const debut = src.lastIndexOf("// ==========", posPied)
  const reste = src.slice(debut)
  // Sécurité : on ne coupe que si Footer est bien la dernière chose du fichier (une seule fonction, pas d'export après)
  if (debut === -1 || (reste.match(/\nfunction /g) || []).length !== 1 || /\nexport /.test(reste)) {
    erreurs.push("l'ancien Footer n'est pas le dernier composant du fichier : je n'y touche pas")
  } else {
    src = src.slice(0, debut).replace(/\s+$/, "") + "\n"
  }
}

if (erreurs.length) {
  console.error("Rien n'a été modifié. Problèmes :\n - " + erreurs.join("\n - "))
  process.exit(1)
}

fs.copyFileSync(cible, cible + ".bak-lot2b")
fs.writeFileSync(cible, avaitCRLF ? src.replace(/\n/g, "\r\n") : src)
console.log("Lot 2b appliqué. Copie de sécurité : " + cible + ".bak-lot2b")
