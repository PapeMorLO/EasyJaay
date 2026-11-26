// Lot 2 de la refonte de la boutique : les infos du vendeur (livraison, paiements, contacts) aux bons endroits.
//   - bandeau de confiance en haut (livraison + paiements + « Plus d'infos »)
//   - livraison et paiement dans le panier, juste avant le formulaire
//   - livraison et paiement sur la fiche produit
//   - pied de page allégé (le bouton WhatsApp en double est retiré)
// À lancer APRÈS le lot 1, à la racine du projet :
//   node scripts/appliquer-lot2-boutique.mjs "src/app/(storefront)/[tenant]/page.jsx"
// Même sécurité que le lot 1 : copie .bak-lot2, arrêt sans rien écrire si un repère manque, relançable sans risque.
import fs from "node:fs"

const cible = process.argv[2]
if (!cible || !fs.existsSync(cible)) {
  console.error('Donne le chemin de ton page.jsx, par exemple :\n  node scripts/appliquer-lot2-boutique.mjs "src/app/(storefront)/[tenant]/page.jsx"')
  process.exit(1)
}

const brut = fs.readFileSync(cible, "utf8")
const avaitCRLF = brut.includes("\r\n")
let src = brut.replace(/\r\n/g, "\n")

if (src.includes("[LOT2-BOUTIQUE]")) {
  console.log("Le lot 2 est déjà appliqué sur ce fichier. Rien à faire.")
  process.exit(0)
}
if (!src.includes("[LOT1-BOUTIQUE]") || !src.includes("function couleurTexte(")) {
  console.error("Applique d'abord le lot 1 (node scripts/appliquer-lot1-boutique.mjs ...), puis relance ce script.")
  process.exit(1)
}

const erreurs = []
function remplacer(nom, ancien, nouveau, attendu = 1) {
  const n = src.split(ancien).length - 1
  if (n !== attendu) { erreurs.push(`${nom} : ${n} occurrence(s) trouvée(s), ${attendu} attendue(s)`); return }
  src = src.split(ancien).join(nouveau)
}
function remplacerRegex(nom, regex, nouveau, attendu = 1) {
  const n = (src.match(new RegExp(regex.source, "g")) || []).length
  if (n !== attendu) { erreurs.push(`${nom} : ${n} occurrence(s) trouvée(s), ${attendu} attendue(s)`); return }
  src = src.replace(new RegExp(regex.source, "g"), nouveau)
}

// 1. Imports
remplacer("imports", `import InfosBoutique from "../../../components/InfosBoutique"`,
`import InfosBoutique from "../../../components/InfosBoutique"
// [LOT2-BOUTIQUE] infos du vendeur : chargées une seule fois, affichées en haut, dans le panier et sur la fiche produit
import { useInfosBoutique } from "../../../lib/useInfosBoutique"
import { libellesPaiements } from "../../../lib/infos"
import BandeauConfiance from "../../../components/BandeauConfiance"
import InfosCommande from "../../../components/InfosCommande"`)

// 2. Chargement des infos (une seule fois, avant les retours anticipés du composant)
remplacerRegex("chargement des infos", /(const directEnCours = useRef\(false\)[^\n]*\n)/,
  "$1\n  // [LOT2-BOUTIQUE] Infos du vendeur (livraison, paiements, contacts...). Démarre aussi le Pixel Facebook de la boutique.\n  const infos = useInfosBoutique(tenant)\n")

// 3. Bandeau du haut : l'ancien bandeau « livraison » est remplacé par le bandeau de confiance
remplacerRegex("bandeau du haut",
  /\{\/\* Bandeau d'annonce Livraison tout en haut \*\/\}[\s\S]*?(?=\s*\{\/\* 1\. COMPOSANT : HEADER \*\/\})/,
  `{/* [LOT2-BOUTIQUE] Bandeau de confiance : livraison, paiements, lien vers les infos */}
      <BandeauConfiance
        infos={infos}
        typeLivraison={resolvedTypeLivraison}
        fond={brandColor}
        texte={couleurTexte(brandColor)}
      />`)

// 4. Bloc d'infos du bas : on lui donne les infos déjà chargées
remplacer("bloc infos du bas", `<InfosBoutique tenant={tenant} couleur={brandColor} />`, `<InfosBoutique infos={infos} tenant={tenant} couleur={brandColor} />`)

// 5. Panier : le gros bloc « livraison » est remplacé par livraison + paiement du vendeur
remplacerRegex("panier : appel", /<CartDrawer(\s+)isOpen=\{isCartOpen\}/, "<CartDrawer$1infos={infos}$1isOpen={isCartOpen}")
remplacerRegex("panier : paramètres", /function CartDrawer\(\{(\s*)isOpen,/, "function CartDrawer({$1infos, isOpen,")
remplacerRegex("panier : bloc livraison",
  /\{\/\* SECTION LIVRAISON DYNAMIQUE DANS LE TIROIR PANIER \*\/\}[\s\S]*?(?=\s*\{\/\* Formulaire de livraison minimaliste \*\/\})/,
  `{/* [LOT2-BOUTIQUE] Livraison et paiement du vendeur, là où le client hésite */}
              <InfosCommande infos={infos} typeLivraison={typeLivraison} />`)

// 6. Fiche produit : livraison du vendeur + moyens de paiement
remplacerRegex("fiche : appel", /<ProductDetailModal(\s+)isOpen=\{!!selectedProduct\}/, "<ProductDetailModal$1infos={infos}$1isOpen={!!selectedProduct}")
remplacerRegex("fiche : paramètres", /function ProductDetailModal\(\{(\s*)isOpen,/, "function ProductDetailModal({$1infos, isOpen,")
remplacer("fiche : livraison",
  `<span><span className="font-bold text-slate-800">Livraison rapide</span> : Tarif calculé selon votre zone lors de la commande.</span>`,
  `<span><span className="font-bold text-slate-800">Livraison</span> : {(infos && infos.infos_livraison) || "tarif calculé selon votre zone lors de la commande."}</span>`)
remplacer("fiche : paiements", "{/* Message d'erreur dynamique */}",
`{/* [LOT2-BOUTIQUE] Moyens de paiement acceptés par le vendeur */}
            {libellesPaiements(infos).length > 0 && (
              <p className="text-xs text-slate-500">
                <span className="font-bold text-slate-700">Paiement</span> : {libellesPaiements(infos).join(" · ")}
              </p>
            )}

            {/* Message d'erreur dynamique */}`)

// 7. Pied de page : le bouton WhatsApp en double est retiré (il y a déjà le bouton flottant et le bloc d'infos)
remplacerRegex("pied de page : whatsapp",
  /\n\s*\{whatsapp && \(\s*<a\s+href=\{`https:\/\/wa\.me\/\$\{formattedWhatsapp\}`\}[\s\S]*?<\/a>\s*\)\}/,
  "")

if (erreurs.length > 0) {
  console.error("\nJe n'ai RIEN modifié : certains repères sont introuvables dans ton fichier.\n")
  for (const e of erreurs) console.error("  - " + e)
  console.error("\nEnvoie-moi ton page.jsx actuel et j'adapte le script.")
  process.exit(1)
}

fs.writeFileSync(cible + ".bak-lot2", brut)
fs.writeFileSync(cible, avaitCRLF ? src.replace(/\n/g, "\r\n") : src)
console.log(`Lot 2 appliqué sur ${cible}\nCopie de sécurité : ${cible}.bak-lot2`)
