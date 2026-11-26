// Applique le correctif "priorité 1" sur ton fichier de boutique (le composant client).
//
//   node scripts/appliquer-patch-p1.mjs "app/[tenant]/StorefrontClient.js"
//
// Ce que fait le script (rien de magique, tu peux le relire) :
//   1. il cherche 6 repères précis dans ton fichier ;
//   2. si UN SEUL manque, il s'arrête sans rien modifier et te dit lequel ;
//   3. sinon il garde une copie "<fichier>.avant-p1.bak" puis applique les 6 modifications.
//
// Les modifications sont décrites dans LISEZMOI-FRONT-P1.md si tu préfères les faire à la main.

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { dirname, join, relative, sep } from "node:path"
import { fileURLToPath } from "node:url"

const fichier = process.argv[2]
if (!fichier) {
  console.error('Usage : node scripts/appliquer-patch-p1.mjs "app/[tenant]/StorefrontClient.js"')
  process.exit(1)
}
if (!existsSync(fichier)) {
  console.error(`Fichier introuvable : ${fichier}`)
  process.exit(1)
}

// Où sera le dossier lib/ ? Dans src/ si ton projet utilise src/app, sinon à la racine.
// On calcule le chemin "../../lib" depuis TON fichier (il change selon la profondeur du dossier).
const dossierLib = existsSync("src/app") ? "src/lib" : "lib"
let cheminLib = relative(dirname(fichier), dossierLib).split(sep).join("/")
if (!cheminLib.startsWith(".")) cheminLib = "./" + cheminLib

const dossierScript = dirname(fileURLToPath(import.meta.url))
const blocHandlers = readFileSync(join(dossierScript, "p1-handlers.txt"), "utf-8").replace(/\r\n/g, "\n")
const texteOriginal = readFileSync(fichier, "utf-8")

// Sous Windows les fichiers ont souvent des fins de ligne "\r\n". On travaille en "\n"
// pour chercher les repères, puis on remet "\r\n" à l'écriture pour ne pas changer le style de ton fichier.
const finDeLigneWindows = texteOriginal.includes("\r\n")
let texte = texteOriginal.replace(/\r\n/g, "\n")

if (texte.includes("envoyerCommandeDirecte")) {
  console.log("Le correctif est déjà appliqué sur ce fichier. Rien à faire.")
  process.exit(0)
}

// Les 5 petits remplacements : [nom, ancien texte, nouveau texte]
const remplacements = [
  [
    "imports",
    'import { useState, useEffect } from "react"',
    'import { useState, useEffect, useRef } from "react"\n' +
      `import { suivre } from "${cheminLib}/track"\n` +
      `import { envoyerCommande, envoyerCommandeDirecte } from "${cheminLib}/commande"\n` +
      `import { messageCommande, messageDirect, lienWhatsapp } from "${cheminLib}/whatsapp"`,
  ],
  [
    "useRef anti double-clic",
    "  const [toastMessage, setToastMessage] = useState(null)\n",
    "  const [toastMessage, setToastMessage] = useState(null)\n" +
      '  const directEnCours = useRef(false) // anti double-clic sur "Acheter direct sur WhatsApp"\n',
  ],
  [
    "visite de la boutique",
    "        if (!sessionStorage.getItem(trackKey)) {\n" +
      "          fetch(`${BASE_URL}/api/shops/${tenant}/increment-view`, {",
    "        if (!sessionStorage.getItem(trackKey)) {\n" +
      '          suivre(tenant, "visite_boutique")\n' +
      "          fetch(`${BASE_URL}/api/shops/${tenant}/increment-view`, {",
  ],
  [
    "produit consulté",
    "  const handleOpenProductDetails = (product) => {\n    setSelectedProduct(product)\n",
    "  const handleOpenProductDetails = (product) => {\n    setSelectedProduct(product)\n" +
      '    suivre(tenant, "vue_produit", product.id)\n',
  ],
  [
    "ajout au panier",
    "      return [...prev, { product, quantity: 1 }]\n    })\n    setIsCartOpen(true)\n  }\n",
    "      return [...prev, { product, quantity: 1 }]\n    })\n    setIsCartOpen(true)\n" +
      '    suivre(tenant, "ajout_panier", product.id)\n  }\n',
  ],
]

const debutHandlers = "  // Commande directe par WhatsApp depuis le modal (Sans passer par le panier)\n"
const finHandlers = '  return (\n    <div className="min-h-screen bg-slate-50 pb-0 selection:bg-slate-200'

// 1) On vérifie TOUS les repères avant de toucher à quoi que ce soit
const manquants = []
for (const [nom, ancien] of remplacements) {
  const n = texte.split(ancien).length - 1
  if (n !== 1) manquants.push(`${nom} (trouvé ${n} fois, attendu 1)`)
}
if (texte.split(debutHandlers).length - 1 !== 1) manquants.push("début des fonctions de commande")
if (texte.split(finHandlers).length - 1 !== 1) manquants.push("fin des fonctions de commande")

if (manquants.length > 0) {
  console.error("Ton fichier est différent de celui que j'ai vu. Repères introuvables :")
  manquants.forEach((m) => console.error("  - " + m))
  console.error("Rien n'a été modifié. Fais les modifications à la main avec LISEZMOI-FRONT-P1.md.")
  process.exit(2)
}

// 2) Sauvegarde (le fichier d'origine, tel quel) puis modifications
writeFileSync(fichier + ".avant-p1.bak", texteOriginal)

for (const [, ancien, nouveau] of remplacements) {
  texte = texte.replace(ancien, () => nouveau)
}

const i = texte.indexOf(debutHandlers)
const j = texte.indexOf(finHandlers)
texte = texte.slice(0, i) + blocHandlers + texte.slice(j)

writeFileSync(fichier, finDeLigneWindows ? texte.replace(/\n/g, "\r\n") : texte)
console.log(`Correctif appliqué sur ${fichier}`)
console.log(`Copie de sauvegarde : ${fichier}.avant-p1.bak`)
