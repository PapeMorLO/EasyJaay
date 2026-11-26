# Boutique : lot 2 (les infos du vendeur aux bons endroits)

## Installation FRONT (racine du projet Next.js) -- à faire APRÈS le lot 1
1. Dézippe diayrek-boutique-lot2-front.zip (ajoute src/lib/infos.js, src/lib/useInfosBoutique.js, src/components/BandeauConfiance.jsx,
   src/components/InfosCommande.jsx, et REMPLACE src/components/InfosBoutique.jsx par une version qui sait recevoir les infos de la page)
2. node scripts/appliquer-lot2-boutique.mjs "src\app\(storefront)\[tenant]\page.jsx"      (copie de sécurité : page.jsx.bak-lot2)
3. Supprime .next, puis npm run build et npm run start

## Installation BACK (Laravel) -- facultatif, juste des textes d'aide dans "Ma boutique"
Dézippe diayrek-boutique-lot2-back.zip à la racine de Laravel (remplace EditProfilBoutique.php), puis php artisan optimize:clear

## Ce que ça change
- Bandeau du haut : livraison (texte du vendeur) + moyens de paiement + lien "Plus d'infos" qui descend au bloc complet.
- Panier : livraison et paiement du vendeur juste avant le formulaire, avec la phrase "Le paiement se règle directement avec le vendeur".
- Fiche produit : livraison du vendeur et moyens de paiement.
- Bloc d'infos du bas : inchangé visuellement, avec une ancre pour le lien du haut. Les infos ne sont chargées qu'UNE fois (hook useInfosBoutique).
- Pied de page : le bouton WhatsApp en double est retiré (il reste le bouton flottant et le bloc d'infos).
