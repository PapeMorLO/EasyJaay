// ---------------------------------------------------------------------------
// TOUT ce que tu peux vouloir changer sur la page d'accueil est ICI :
// numéros, packs et tarifs, textes, boutiques à montrer. Pour modifier une phrase ou un prix,
// tu changes ce fichier : tu n'as pas besoin de toucher au design (page.tsx).
// ---------------------------------------------------------------------------

// Adresse de l'API Laravel (même variable que dans le reste du site)
export const API_URL: string = process.env.NEXT_PUBLIC_API_URL || "https://easyjaayback.baobapp.tech"

export const MARQUE = "DiayRek"

// Adresse (slug) d'une VRAIE boutique à montrer : https://ton-site/<slug>. "" = bouton caché.
export const BOUTIQUE_EXEMPLE = "sokhna-cosmetiques"

// WhatsApp du support (chiffres seulement, avec 221)
export const SUPPORT_WHATSAPP = "221778762197"

export const SUPPORT_TELEPHONES = [
  { affichage: "+221 77 516 18 01", lien: "+221775161801" },
  { affichage: "+221 77 876 21 97", lien: "+221778762197" },
  { affichage: "+221 77 541 64 96", lien: "+221775416496" },
]

// Mentions légales affichées en bas de page (reprises de ton document de tarifs)
export const ENTREPRISE = {
  nom: "African Know-How SUARL",
  ninea: "008687769",
  rccm: "SN-DKR-2021-B-22485",
  adresse: "HLM Grand Médine N°320, Dakar",
}

// Lien « discuter sur WhatsApp » avec un message déjà écrit
export function lienWhatsapp(numero: string, message: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`
}

// 86400 -> "86 400" (espace insécable pour que le prix ne se coupe pas en fin de ligne)
export function fcfa(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

// Menu du haut et du bas de page : ancres vers les sections de la page d'accueil
export const MENU = [
  { label: "Comment ça marche", href: "#comment" },
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "Questions", href: "#questions" },
]

// ---------------------------------------------------------------------------
// TARIFS (source : TARIF_DIAY_REK.pdf). Les totaux et les « restes » sont CALCULÉS :
// si tu changes une mensualité ou une durée, tout le reste se met à jour tout seul.
// ---------------------------------------------------------------------------
export type Pack = {
  nom: string
  duree: number        // en mois
  mensualite: number   // F CFA par mois
  moisAvance: number   // nombre de mensualités payées au 1er versement
  accroche: string
  vedette?: boolean    // carte mise en avant (fond foncé)
}

export const PACKS: Pack[] = [
  { nom: "DiayRek Tawfekh",   duree: 12, mensualite: 7200,  moisAvance: 7, accroche: "Le prix le plus bas par mois", vedette: true },
  { nom: "DiayRek Baaral",    duree: 6,  mensualite: 8600,  moisAvance: 4, accroche: "Un engagement plus court" },
  { nom: "DiayRek Joni Joni", duree: 3,  mensualite: 10000, moisAvance: 1, accroche: "Pour démarrer rapidement" },
]

export const calculPack = (p: Pack) => ({
  total: p.duree * p.mensualite,
  premierVersement: p.moisAvance * p.mensualite,
  moisRestants: p.duree - p.moisAvance,
})

// Ce que comprend chaque pack (source : § 4 du document de tarifs).
// ⚠ À VÉRIFIER avant de publier : ne garde que ce qui est réellement livré aux clients
// (campagnes mensuelles, factures/devis, synchronisation des réseaux sociaux).
export const INCLUS: string[] = [
  "Une boutique web mobile qui expose tous vos produits, sur tous les écrans",
  "Les commandes reçues sur WhatsApp",
  "Une campagne Facebook chaque mois",
  "Une campagne TikTok chaque mois",
  "Factures et devis faciles à émettre",
  "Un état de vos ventes en permanence",
  "Un stock mis à jour automatiquement",
  "Vos réseaux sociaux (Facebook, TikTok) synchronisés avec votre boutique",
]

export const NOTE_DOMAINE =
  "Votre propre nom de domaine (www.votreboutique.com) est en option : 9 840 F par an chez Kheweul. Si vous en avez déjà un, notre équipe technique le configure pour vous."

// ---------------------------------------------------------------------------
// BOUTIQUES À MONTRER (galerie). Tant que cette liste est VIDE, la section n'apparaît pas.
// Ajoute-y de VRAIES boutiques (avec l'accord de leur propriétaire). Exemple :
//   { slug: "sokhna-cosmetiques", nom: "Sokhna Cosmétiques", categorie: "Beauté", description: "Soins au karité.", couleurs: ["#1C7C74", "#2fa89c"] }
// ---------------------------------------------------------------------------
export type BoutiqueMontree = { slug: string; nom: string; categorie: string; description: string; couleurs: [string, string] }
export const BOUTIQUES_MONTREES: BoutiqueMontree[] = []

// ---------------------------------------------------------------------------
// TEXTES
// ---------------------------------------------------------------------------
// "icone" = NOM d'une icône (liste ICONES dans page.tsx). "fragment" = petit morceau d'interface illustré (components/landing/FragmentsInterface.tsx).
export type Bloc = { icone?: string; fragment?: "commande" | "stock" | "lien"; titre: string; texte: string }

export const PUBLICS: Bloc[] = [
  {
    icone: "boutique",
    titre: "Vous avez une boutique physique",
    texte: "Montrez votre catalogue en ligne, recevez des commandes à distance, et tenez votre caisse et votre stock au même endroit.",
  },
  {
    icone: "telephone",
    titre: "Vous vendez sur les réseaux",
    texte: "Fini les photos envoyées une par une. Un seul lien pour tous vos produits, à mettre sur votre statut WhatsApp, Facebook, Snapchat ou TikTok.",
  },
]

export const ETAPES: Bloc[] = [
  {
    titre: "Créez votre boutique",
    texte: "Nom, numéro WhatsApp, e-mail : 2 minutes, depuis votre téléphone.",
  },
  {
    titre: "Ajoutez vos produits",
    texte: "Photos de votre téléphone, prix, tailles et couleurs. Pas besoin d'ordinateur.",
  },
  {
    titre: "Partagez votre lien",
    texte: "Sur votre statut WhatsApp, Facebook, Snapchat, TikTok. Vos clients commandent, vous recevez tout sur WhatsApp.",
  },
]

export const AVANTAGES: Bloc[] = [
  {
    icone: "notification",
    fragment: "commande",
    titre: "Aucune commande perdue",
    texte: "Chaque commande est enregistrée dans votre espace avec un numéro, et vous êtes notifié. Même si le client n'appuie pas sur « Envoyer » dans WhatsApp.",
  },
  {
    icone: "caisse",
    titre: "Une caisse pour votre boutique",
    texte: "Enregistrez vos ventes au comptoir depuis votre espace vendeur. Le stock se met à jour tout seul.",
  },
  {
    icone: "stock",
    fragment: "stock",
    titre: "Un stock toujours à jour",
    texte: "Le stock baisse quand vous validez une commande et remonte si vous l'annulez. Une alerte vous prévient quand un produit va manquer.",
  },
  {
    icone: "lien",
    fragment: "lien",
    titre: "Un lien pour chaque produit",
    texte: "Collé dans WhatsApp ou Facebook, il s'affiche avec la photo, le nom et le prix du produit.",
  },
  {
    icone: "statistiques",
    titre: "Savoir d'où viennent vos clients",
    texte: "Facebook, Snapchat, WhatsApp… combien de visiteurs, combien regardent un produit, combien commandent.",
  },
  {
    icone: "confiance",
    titre: "Une boutique qui rassure",
    texte: "Adresse, moyens de paiement (Wave, Orange Money, espèces), livraison, contacts : ce qu'un client veut vérifier avant de commander.",
  },
]

// Honnêteté : on dit ce que les campagnes font, et ce qu'aucune publicité ne peut garantir.
export const LIMITE_TITRE = "Ce que personne ne peut vous garantir"
export const LIMITE_TEXTE =
  "DiayRek organise vos ventes et lance chaque mois une campagne Facebook et une campagne TikTok pour faire connaître votre boutique. Mais aucune publicité ne garantit un nombre de ventes : vos premiers clients viendront surtout de vos contacts et de vos abonnés. Partagez votre lien dès le premier jour."

export const QUESTIONS: { question: string; reponse: string }[] = [
  {
    question: "Dois-je savoir programmer ou avoir un site ?",
    reponse: "Non. Vous créez la boutique, vous ajoutez vos produits avec les photos de votre téléphone et vous partagez le lien. Tout se fait depuis le téléphone.",
  },
  {
    question: "Comment mes clients paient-ils ?",
    reponse: "Comme vous en avez l'habitude : Wave, Orange Money ou espèces à la livraison. Vous affichez vos moyens de paiement sur la boutique, et le règlement se fait directement entre vous et votre client.",
  },
  {
    question: "Comment est-ce que je reçois les commandes ?",
    reponse: "Quand un client commande, WhatsApp s'ouvre avec sa commande déjà écrite : il n'a plus qu'à l'envoyer. La commande est aussi enregistrée dans votre espace vendeur, avec un numéro, et vous êtes notifié.",
  },
  {
    question: "Puis-je l'utiliser dans ma boutique physique ?",
    reponse: "Oui. La caisse permet d'enregistrer vos ventes au comptoir et met le stock à jour.",
  },
  {
    question: "DiayRek m'apporte-t-il des clients ?",
    reponse: "Nous lançons chaque mois une campagne sur Facebook et une sur TikTok pour votre boutique, mais personne ne peut garantir un nombre de ventes. Vos premiers clients viendront surtout de vos contacts et de vos abonnés : partagez votre lien dès le premier jour.",
  },
  {
    question: "Combien ça coûte, et comment je paie ?",
    reponse: "C'est un abonnement : à partir de 7 200 F par mois avec le pack de 12 mois, ou 10 000 F par mois avec le pack de 3 mois. Vous réglez un premier versement correspondant à quelques mensualités d'avance, puis le reste en mensualités. Le détail de chaque pack est dans la section Tarifs.",
  },
  {
    question: "Je n'y arrive pas seul, qui m'aide ?",
    reponse: "Nous. Écrivez-nous sur WhatsApp et nous créons la boutique avec vous, pas à pas.",
  },
]

// Exemples de produits qui défilent sous le hero (illustration : ce ne sont pas de vrais produits)
export const EXEMPLES_PRODUITS: string[] = [
  "Tenues wax", "Baskets", "Cosmétiques", "Sacs", "Accessoires téléphone",
  "Produits locaux", "Bijoux", "Tissus", "Pâtisserie", "Décoration",
]
