# Correctif : bandeau « À la une » (titre, prix et bouton invisibles)

1. Dézippe diayrek-boutique-hero-fix.zip à la racine du projet Next.js
2. node scripts/corriger-hero-boutique.mjs "src\app\(storefront)\[tenant]\page.jsx"      (copie de sécurité : page.jsx.bak-hero)
3. Supprime .next, puis npm run build et npm run start

Cause : avec une photo haute, la ligne de la grille devenait plus haute que la carte et le texte sortait du cadre.
Le correctif impose une ligne de la hauteur de la carte. La photo reste entière (object-contain) avec du blanc autour si besoin.
