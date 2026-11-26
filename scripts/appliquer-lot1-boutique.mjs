// Lot 1 de la refonte de la boutique : lisibilité du bandeau, contraste automatique, barre panier mobile, textes.
// Usage (à la racine du projet) :
//   node scripts/appliquer-lot1-boutique.mjs "src/app/(storefront)/[tenant]/page.jsx"
//
// Ce que fait le script, dans l'ordre :
//  1. lit ton page.jsx et en garde une copie (page.jsx.bak-lot1) ;
//  2. REMPLACE 4 composants entiers (Header, HeroCarousel, CategoryFilters, ProductCard) par les versions de scripts/lot1/*.txt ;
//  3. fait une quinzaine de petites retouches ciblées (textes, couleurs, emojis, bouton WhatsApp...) ;
//  4. s'ARRÊTE sans rien écrire si un repère n'est pas trouvé : ton fichier n'est jamais abîmé à moitié.
// On peut le relancer sans risque : s'il a déjà été appliqué, il le dit et ne touche à rien.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ici = path.dirname(fileURLToPath(import.meta.url))
const cible = process.argv[2]
if (!cible || !fs.existsSync(cible)) {
  console.error('Donne le chemin de ton page.jsx, par exemple :\n  node scripts/appliquer-lot1-boutique.mjs "src/app/(storefront)/[tenant]/page.jsx"')
  process.exit(1)
}

// --- lecture (on convertit les fins de ligne Windows en \n pour chercher, puis on les remet à l'écriture)
const brut = fs.readFileSync(cible, "utf8")
const avaitCRLF = brut.includes("\r\n")
let src = brut.replace(/\r\n/g, "\n")

if (src.includes("[LOT1-BOUTIQUE]")) {
  console.log("Le lot 1 est déjà appliqué sur ce fichier. Rien à faire.")
  process.exit(0)
}

const erreurs = []

// Remplace un texte exact. "attendu" = nombre d'occurrences qu'on doit trouver.
function remplacer(nom, ancien, nouveau, attendu = 1) {
  const n = src.split(ancien).length - 1
  if (n !== attendu) { erreurs.push(`${nom} : ${n} occurrence(s) trouvée(s), ${attendu} attendue(s)`); return }
  src = src.split(ancien).join(nouveau)
}
// Pareil avec une expression régulière (pour les espaces et retours à la ligne variables)
function remplacerRegex(nom, regex, nouveau, attendu = 1) {
  const n = (src.match(new RegExp(regex.source, "g")) || []).length
  if (n !== attendu) { erreurs.push(`${nom} : ${n} occurrence(s) trouvée(s), ${attendu} attendue(s)`); return }
  src = src.replace(new RegExp(regex.source, "g"), nouveau)
}
// Remplace un composant entier : du bandeau « COMPOSANT : A » jusqu'au bandeau « COMPOSANT : B » (exclu)
function remplacerBloc(nom, debut, fin, fichier) {
  // position du début du bandeau « // === » qui précède la ligne « // --- COMPOSANT : NOM »
  const bandeau = (n) => {
    const p = src.indexOf(`// --- COMPOSANT : ${n}`)
    return p === -1 ? -1 : src.lastIndexOf("// ==========", p)
  }
  const a = bandeau(debut)
  const b = bandeau(fin)
  if (a === -1 || b === -1 || b < a) { erreurs.push(`${nom} : repères « COMPOSANT : ${debut} » / « ${fin} » introuvables`); return }
  const nouveau = fs.readFileSync(path.join(ici, "lot1", fichier), "utf8").replace(/\r\n/g, "\n")
  src = src.slice(0, a) + nouveau + src.slice(b)
}

// ---------- 1. Fonction qui choisit texte blanc ou foncé selon la couleur du vendeur ----------
remplacer("fonction couleurTexte", "// Fonction de résolution intelligente pour la galerie d'images du modal",
`// [LOT1-BOUTIQUE] Choisit le texte à poser sur la couleur du vendeur : blanc sur une couleur foncée, presque noir sur une couleur claire.
// (calcul de luminosité du standard d'accessibilité WCAG)
function couleurTexte(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim())
  if (!m) return "#ffffff"
  const n = parseInt(m[1], 16)
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  // contraste avec du blanc vs contraste avec du foncé : on garde le meilleur
  return 1.05 / (L + 0.05) >= (L + 0.05) / 0.06 ? "#ffffff" : "#0f172a"
}

// Fonction de résolution intelligente pour la galerie d'images du modal`)

// ---------- 2. Les 4 composants remplacés en entier ----------
remplacerBloc("Header",            "HEADER",            "HERO CAROUSEL",     "Header.txt")
remplacerBloc("HeroCarousel",      "HERO CAROUSEL",     "FILTRE CATEGORIES", "HeroCarousel.txt")
remplacerBloc("CategoryFilters",   "FILTRE CATEGORIES", "CARTE PRODUIT",     "CategoryFilters.txt")
remplacerBloc("ProductCard",       "CARTE PRODUIT",     "TIROIR PANIER",     "ProductCard.txt")

// ---------- 3. Petites retouches ----------
// Écran de chargement : couleurs neutres (on ne connaît pas encore la couleur de la boutique)
remplacer("chargement 1", "bg-teal-500 opacity-25", "bg-slate-400 opacity-25")
remplacer("chargement 2", "border-4 border-teal-600 border-t-transparent", "border-4 border-slate-500 border-t-transparent")
// Boutique introuvable : plus d'emoji
remplacer("introuvable", `<div className="text-6xl mb-4 animate-bounce">🏪</div>`, `<ShoppingBag className="h-14 w-14 text-slate-300 mb-4" />`)
// Le bandeau « à la une » ne montre que des produits en stock
remplacer("hero produits", "products={resolvedProducts.slice(0, 3)}", "products={resolvedProducts.filter((p) => p.quantite_stock > 0).slice(0, 3)}")
// Bandeau de livraison : texte lisible sur toutes les couleurs, camion immobile
remplacerRegex("bandeau livraison", /style=\{\{ backgroundColor: brandColor \}\}(\s*)className="w-full text-white py-2/, 'style={{ backgroundColor: brandColor, color: couleurTexte(brandColor) }}$1className="w-full py-2')
remplacer("camion", `<Truck className="h-4 w-4 animate-bounce" />`, `<Truck className="h-4 w-4" />`)
// Recherche : texte neutre (la boutique ne vend pas forcément des chaussures)
remplacer("recherche", `placeholder="Rechercher une paire, une marque, un vêtement..."`, `placeholder="Rechercher un produit..."`)
// Filtre « derniers en stock » seulement s'il y a des produits concernés
remplacerRegex("filtres", /<CategoryFilters(\s+)activeFilter=\{activeFilter\}/, "<CategoryFilters$1showLowStock={resolvedProducts.some((p) => p.quantite_stock > 0 && p.quantite_stock <= 5)}$1activeFilter={activeFilter}")
// Aucun résultat : icône au lieu d'un emoji
remplacer("aucun résultat", `<span className="text-5xl mb-4 block">📦</span>`, `<Search className="h-10 w-10 text-slate-300 mx-auto mb-4" />`)
// Bouton d'envoi de la commande : texte lisible
remplacerRegex("bouton commande", /className="w-full py-4 mt-2 rounded-2xl font-bold text-white text-sm([^"]*)"(\s*)style=\{\{ backgroundColor: brandColor \}\}/, 'className="w-full py-4 mt-2 rounded-2xl font-bold text-sm$1"$2style={{ backgroundColor: brandColor, color: couleurTexte(brandColor) }}')
// Fiche produit : plus d'emojis, et le bouton « panier » n'affiche plus le nom de la plateforme
remplacer("emoji livraison offerte", `<span>🚀 <span className="font-bold text-emerald-600">`, `<span><span className="font-bold text-emerald-600">`)
remplacer("emoji livraison rapide", `<span>🚚 <span className="font-bold text-slate-800">`, `<span><span className="font-bold text-slate-800">`)
remplacer("emoji conseil", `<span>💡 <strong>Conseil :</strong>`, `<span><strong>Conseil :</strong>`)
remplacer("emoji whatsapp", `Acheter direct sur WhatsApp 🟢`, `Acheter direct sur WhatsApp`)
remplacer("bouton panier", `"Ajouter au panier DiayRek"`, `"Ajouter au panier"`)
remplacerRegex("couleur bouton panier", /color: isOutOfStock\s*\?\s*"#ffffff"\s*:\s*"#ffffff"/, 'color: isOutOfStock ? "#ffffff" : couleurTexte(brandColor)')

// Barre « Panier · Commander » fixe en bas (téléphone) + bouton WhatsApp qui se place au-dessus
remplacer("barre panier", "{/* 8. BOUTON FLOATING WHATSAPP */}",
`{/* [LOT1-BOUTIQUE] BARRE PANIER FIXE (téléphone) : visible seulement quand le panier n'est pas vide */}
      {cartCount > 0 && !isCartOpen && !selectedProduct && (
        <BarrePanier
          cartCount={cartCount}
          montantTotal={montantTotal}
          brandColor={brandColor}
          onOpen={() => setIsCartOpen(true)}
        />
      )}

      {/* 8. BOUTON FLOATING WHATSAPP */}`)
remplacer("bouton whatsapp flottant",
  `className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500 text-white shadow-2xl hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all duration-300 group"`,
  "className={`fixed ${cartCount > 0 ? \"bottom-24 md:bottom-6\" : \"bottom-6\"} right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500 text-white shadow-2xl hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all duration-300 group`}")

// Pied de page : marge en bas pour que le bouton WhatsApp ne cache plus « Propulsé par », texte creux retiré, lien vers la page d'accueil
remplacer("pied de page marge", `border-t border-slate-800 mt-24 py-12 px-6"`, `border-t border-slate-800 mt-24 pt-12 pb-28 px-6"`)
remplacer("pied de page slogan", `<p className="text-xs text-slate-400 mt-0.5">Votre boutique en ligne de confiance</p>`, ``)
remplacer("lien propulsé par", `href="https://easyjaay.baobapp.tech"`, `href="/?src=boutique"`)
remplacerRegex("logo pied de page", /font-black text-white shadow-sm text-xl"(\s*)style=\{\{ backgroundColor: safeBrandColor \}\}/, 'font-black shadow-sm text-xl"$1style={{ backgroundColor: safeBrandColor, color: couleurTexte(safeBrandColor) }}')

// ---------- 4. Bilan ----------
if (erreurs.length > 0) {
  console.error("\nJe n'ai RIEN modifié : certains repères sont introuvables dans ton fichier.\n")
  for (const e of erreurs) console.error("  - " + e)
  console.error("\nEnvoie-moi ton page.jsx actuel et j'adapte le script.")
  process.exit(1)
}

fs.writeFileSync(cible + ".bak-lot1", brut)
fs.writeFileSync(cible, avaitCRLF ? src.replace(/\n/g, "\r\n") : src)
console.log(`Lot 1 appliqué sur ${cible}\nCopie de sécurité : ${cible}.bak-lot1`)
