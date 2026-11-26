# Boutique : lot 2b (un seul pied de page bleu nuit)

## Installation (racine du projet Next.js) -- APRÈS les lots 1 et 2
1. Dézippe diayrek-boutique-lot2b.zip à la racine (ajoute src/components/PiedDePage.jsx et scripts/appliquer-lot2b-boutique.mjs)
2. node scripts/appliquer-lot2b-boutique.mjs "src\app\(storefront)\[tenant]\page.jsx"      (copie de sécurité : page.jsx.bak-lot2b)
3. Supprime .next, puis npm run build et npm run start
4. Facultatif : supprime src/components/InfosBoutique.jsx (il ne sert plus)

## Ce que ça change
- Le cadre blanc d'infos ET l'ancien pied de page disparaissent : un seul pied de page bleu nuit les remplace.
- 3 colonnes sur ordinateur (boutique + à propos | adresse + livraison | paiement + WhatsApp/Appeler), tout empilé sur téléphone.
- Fine bande de la couleur du vendeur en haut du pied de page.
- Une colonne sans information disparaît toute seule. Un vendeur qui n'a rempli que son WhatsApp a un pied de page court.
- Le lien "Plus d'infos" du bandeau du haut descend toujours ici (ancre id="infos-boutique" conservée).
- Bandeau du haut, panier et fiche produit : inchangés.

## Où modifier ensuite
- Textes, couleurs, colonnes : src/components/PiedDePage.jsx (commenté en français, une colonne = un bloc).
- Données (à propos, adresse, livraison, paiements, réseaux) : le vendeur les remplit dans « Ma boutique » (admin Filament), rien à changer dans le code.
