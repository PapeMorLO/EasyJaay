# Boutique : lot 1 (bandeau lisible, contraste automatique, barre panier mobile, textes)

## Installation (à la racine du projet Next.js)
1. Dézippe (il ajoute scripts/appliquer-lot1-boutique.mjs et scripts/lot1/*.txt, il ne touche à rien d'autre)
2. node scripts/appliquer-lot1-boutique.mjs "src/app/(storefront)/[tenant]/page.jsx"
   -> crée page.jsx.bak-lot1 (ta copie), applique le lot, ou s'arrête sans rien casser si un repère manque
3. supprime le dossier .next, puis npm run build et npm run start
Pour annuler : remets page.jsx.bak-lot1 à la place de page.jsx.

## Ce que ça change
- Bandeau "À la une" : texte à gauche sur fond foncé, photo à droite sur fond blanc (téléphone : photo assombrie en fond). Hauteur réduite, points de navigation visibles, plus de phrase générique, uniquement des produits en stock avec photo.
- couleurTexte() : texte blanc ou foncé selon la couleur du vendeur (boutons, badge panier, bandeau livraison, pastilles de filtre, bouton "Envoyer la commande"...).
- Barre fixe en bas sur téléphone : "Panier (2) · Commander · 27 500 F". Le bouton WhatsApp flottant se place au-dessus.
- Pied de page : marge en bas (le bouton WhatsApp ne cache plus "Propulsé par"), slogan creux retiré, lien "Propulsé par" -> page d'accueil (/?src=boutique).
- Cartes produit : plus de "Aucune description supplémentaire…", plus de ligne PRIX, photos chargées à la demande.
- Filtres : "Derniers en stock" n'apparaît que s'il y a des produits concernés. Recherche : "Rechercher un produit...".
- Emojis retirés (🚀 🚚 💡 🟢 🏪 📦). "Ajouter au panier DiayRek" -> "Ajouter au panier".

## Où modifier ensuite
Les 4 composants remplacés sont dans scripts/lot1/*.txt (le texte qui a été inséré) et désormais dans page.jsx : Header, BarrePanier, HeroCarousel, CategoryFilters, ProductCard.
Repère [LOT1-BOUTIQUE] dans page.jsx = ce que ce lot a ajouté.
