# DiayRek — Priorité 2 (boutique Next.js) : confiance, Pixel, page produit

À dézipper **à la racine du projet Next.js**. Prérequis : P1 installé (dossier `lib/` présent) **et** backend P2 déployé.
> Ce zip est préparé pour ton projet : les fichiers sont déjà rangés dans **`src/`** (`src/lib`, `src/components`, `src/app/(storefront)/[tenant]/p`).
> **Ne recrée jamais un dossier `app/` à la racine** : Next.js ignorerait alors `src/app` (erreur « doesn't have a root layout »).

## Ce que ça ajoute

1. **Bloc confiance** (`components/InfosBoutique.jsx`) : adresse, livraison, moyens de paiement, appel + WhatsApp, réseaux sociaux. N'affiche que ce que le vendeur a rempli, rien d'inventé.
2. **Pixel Facebook par boutique** (`lib/pixel.js`) : démarré automatiquement par le bloc si la boutique a un Pixel. Évènements envoyés : `PageView`, `ViewContent` (produit vu), `AddToCart`, `Purchase` (commande enregistrée, valeur en XOF).
3. **Page produit partageable** `/nom-boutique/p/12` : photo, prix, description, choix taille/couleur, bouton « Commander sur WhatsApp » (enregistre la commande puis ouvre WhatsApp, comme sur la boutique). Quand on colle ce lien dans WhatsApp / Facebook, il s'affiche avec **la photo, le nom et le prix**.

## Carte des fichiers

```
src/components/InfosBoutique.jsx      ← bloc confiance + démarrage du Pixel (nouveau)
src/lib/pixel.js                      ← Pixel Facebook (nouveau)
src/lib/images.js                     ← adresses des photos (nouveau)
scripts/ajouter-infos-boutique.mjs    ← place le bloc dans ta boutique (nouveau)
scripts/appliquer-patch-p1.mjs        ← correctif P1 (version qui comprend src/)
scripts/p1-handlers.txt               ← utilisé par le script ci-dessus
scripts/ranger-dans-src.mjs           ← range les fichiers des zips dans src/ si ton projet utilise src/ (nouveau)
src/lib/track.js     (mis à jour)     ← envoie aussi ViewContent / AddToCart au Pixel
src/lib/commande.js  (mis à jour)     ← envoie Purchase au Pixel quand la commande est enregistrée
src/app/(storefront)/[tenant]/p/[id]/page.js           ← page produit côté serveur + aperçu des liens (nouveau)
src/app/(storefront)/[tenant]/p/[id]/FicheProduit.jsx  ← partie interactive de la page produit (nouveau)
```

## Installation complète, dans l'ordre

Dans ton projet, la page qui affiche la boutique est **`src/app/(storefront)/[tenant]/page.jsx`** (c'est elle qui contient `handleCheckout`).
`StorefrontClient.jsx` n'est pas importé par cette page : le modifier ne change rien sur le site.

```bash
# 0. SEULEMENT si tu as dézippé une ancienne version : elle a laissé des dossiers app/, lib/, components/ à la racine.
#    Cette commande les range dans src/ et les supprime de la racine.
node scripts/ranger-dans-src.mjs

# 1. Correctif P1 (commande enregistrée, suivi du trafic) sur la page boutique
node scripts/appliquer-patch-p1.mjs "src/app/(storefront)/[tenant]/page.jsx"

# 2. Bloc de confiance, en bas de page (avant le pied de page)
node scripts/ajouter-infos-boutique.mjs "src/app/(storefront)/[tenant]/page.jsx"

# 3. Supprimer le dossier .next, puis reconstruire
npm run build
```

Après le build, il ne doit exister **aucun** dossier `app/` à la racine du projet (seulement `src/app`).

Chaque script garde une copie `.bak`, conserve les fins de ligne Windows, peut être relancé sans risque, et ne modifie rien (en disant pourquoi) s'il ne retrouve pas ses repères.

À la main, si un script refuse : voir `LISEZMOI-FRONT-P1.md` pour la commande 1, et pour la 2 ajoute `import InfosBoutique from "../../../components/InfosBoutique"` puis la balise ci-dessus avant `{/* 7. COMPOSANT : FOOTER */}`.

## Comment ça marche, expliqué simplement

```
Vendeur remplit "Ma boutique" (admin Laravel)
        │
        ▼
GET /api/shops/{slug}/infos ───► InfosBoutique.jsx ──► affiche le bloc
                                        │
                                        └──► initialiserPixel(id)  → charge le script Facebook
Visiteur voit / clique / commande
        │
   suivre() ──► notre base (entonnoir)  +  pixel("ViewContent"/"AddToCart")
   envoyerCommande...() ──► Laravel  +  pixel("Purchase")
```

Pourquoi `page.js` ET `FicheProduit.jsx` ? `page.js` tourne sur le **serveur** : il demande le produit à Laravel et fabrique l'aperçu du lien (c'est ce que lisent WhatsApp et Facebook, qui n'exécutent pas ton JavaScript). `FicheProduit.jsx` (`"use client"`) tourne dans le navigateur : boutons, choix de taille, clic sur commander.

La page produit garde les données 60 secondes (`revalidate: 60`) : elle est rapide, et un changement de prix apparaît en moins d'une minute. Le prix réellement facturé est toujours relu par Laravel à la commande.

## Pixel : comment l'utiliser

1. Le vendeur crée son Pixel (Gestionnaire d'événements Meta) et copie le **numéro**.
2. Il le colle dans Ma boutique → « Publicité Facebook (avancé) ».
3. Dans sa campagne, il choisit comme objectif/conversion **Achat (Purchase)**.

`Purchase` est envoyé quand la commande est **enregistrée** (le client ouvre WhatsApp), pas quand elle est payée ni livrée : c'est la pratique courante en paiement à la livraison, mais certaines commandes ne seront jamais confirmées.

## Test

1. Remplis « Ma boutique » dans l'admin, puis ouvre la boutique : le bloc s'affiche.
2. Avec l'extension Chrome « Meta Pixel Helper » : `PageView` à l'ouverture, `ViewContent` sur la page produit, `Purchase` après une commande.
3. Colle `https://ton-site/ta-boutique/p/ID?src=whatsapp` dans une conversation WhatsApp : la carte avec photo, nom et prix doit apparaître (si la photo est lourde, lance `php artisan images:reduire` côté serveur).
4. Après une visite par ce lien : le canal « whatsapp » apparaît dans l'entonnoir.
5. Sur la page d'un produit épuisé : bouton « Épuisé » grisé.

## Si une page `/nom-boutique/p/12` ne s'affiche pas

Ton `middleware.js` peut réécrire ou bloquer certaines adresses. Si la page produit répond 404, envoie-moi le fichier `middleware.js`.

## Ce qui a été vérifié, et ce qui ne l'a pas été

- Vérifié : les 3 composants se compilent (JSX valide) ; `pixel.js` refuse un identifiant piégé, ne se charge qu'une fois, et envoie les bons évènements ; `Purchase` part après une commande enregistrée et aucun prix n'est envoyé par le navigateur ; l'aperçu du lien contient le nom, le prix en FCFA, la photo en adresse complète, et un produit inconnu donne « Produit introuvable ».
- **Non vérifié** : l'affichage réel (mise en page Tailwind) et le rendu des aperçus sur WhatsApp / Facebook. Teste avec le point 3 ci-dessus.
