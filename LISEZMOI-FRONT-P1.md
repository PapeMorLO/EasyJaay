# DiayRek — Correctif priorité 1 (boutique Next.js)

À dézipper **à la racine du projet Next.js** (là où se trouve `package.json`).

> Si ton projet a un dossier `src/` (c'est-à-dire `src/app/...`), déplace le dossier `lib/` dans `src/`.
> Les imports du correctif supposent que `lib/` est à côté de `app/`.

## Ce que ça change côté visiteur

- Le bouton **« Acheter direct sur WhatsApp »** enregistre d'abord la commande (le vendeur la voit dans son admin) puis ouvre WhatsApp avec un **numéro de commande** dans le message.
- Le panier n'envoie **plus aucun prix** : le serveur les relit.
- Si le serveur refuse (stock épuisé, article retiré), le client voit un message clair et **le panier est conservé** (avant : panier vidé, WhatsApp ouvert, commande perdue).
- Si le réseau est coupé ou que le serveur est en panne, le client peut **quand même** passer par WhatsApp (message sans numéro) : on ne perd pas la vente.
- Le total du message WhatsApp est celui calculé par le serveur.
- La boutique enregistre d'où viennent les visiteurs (Facebook, Snapchat…) et les étapes (visite → produit vu → ajout au panier).

## Carte des fichiers

```
lib/config.js       ← l'adresse de ton API (un seul endroit)
lib/track.js        ← détecte le canal + envoie les évènements de suivi
lib/commande.js     ← envoie la commande à Laravel (panier ou direct)
lib/whatsapp.js     ← le lien wa.me et le texte des messages
scripts/appliquer-patch-p1.mjs   ← applique les modifications sur ton composant boutique
scripts/p1-handlers.txt          ← le code des 2 fonctions remplacées (copiable à la main)
```

## Appliquer la modification (une commande)

```bash
node scripts/appliquer-patch-p1.mjs "app/[tenant]/StorefrontClient.js"
```

Le script :
1. cherche 6 repères précis dans ton fichier ;
2. si **un seul** manque, il s'arrête sans rien modifier et te dit lequel (ton fichier a changé depuis celui que j'ai vu) ;
3. sinon il garde une copie `StorefrontClient.js.avant-p1.bak` et applique les modifications. Il conserve aussi tes fins de ligne Windows.

Tu peux le relancer sans risque : il détecte que c'est déjà fait.

Puis :

```bash
npm run build      # vérifie qu'il n'y a pas d'erreur
```

## Si tu préfères le faire à la main (ou si le script refuse)

Dans ton composant boutique (celui qui contient `handleCheckout`), 6 modifications :

**1. En haut du fichier**, remplace `import { useState, useEffect } from "react"` par :

```js
import { useState, useEffect, useRef } from "react"
import { suivre } from "../../lib/track"
import { envoyerCommande, envoyerCommandeDirecte } from "../../lib/commande"
import { messageCommande, messageDirect, lienWhatsapp } from "../../lib/whatsapp"
```

**2. Avec les autres `useState`** (juste après `const [toastMessage, ...]`) :

```js
const directEnCours = useRef(false) // anti double-clic sur "Acheter direct sur WhatsApp"
```

**3. Dans `fetchShop`**, dans le bloc `if (!sessionStorage.getItem(trackKey)) {`, ajoute en première ligne :

```js
suivre(tenant, "visite_boutique")
```

**4. Dans `handleOpenProductDetails`**, après `setSelectedProduct(product)` :

```js
suivre(tenant, "vue_produit", product.id)
```

**5. Dans `addToCart`**, après `setIsCartOpen(true)` (à la fin de la fonction) :

```js
suivre(tenant, "ajout_panier", product.id)
```

**6. Remplace `handleDirectWhatsAppOrder` ET `handleCheckout`** (les deux fonctions, de
`// Commande directe par WhatsApp depuis le modal` jusqu'au `return (` du composant) par le contenu
du fichier `scripts/p1-handlers.txt`.

## Comment ça marche, expliqué simplement

```
Client clique "Acheter direct"           Client remplit le panier + formulaire
        │                                          │
        ▼                                          ▼
envoyerCommandeDirecte()                   envoyerCommande()          (lib/commande.js)
        │                                          │
        └──────────────► Laravel /api/commandes ◄──┘   → enregistre, calcule les prix, renvoie "numero"
                                 │
              ┌──────────────────┼───────────────────┐
         ok : numero        refus : message      réseau coupé
              │                  │                   │
   message WhatsApp         toast d'erreur,      message WhatsApp
   avec le n° de commande   WhatsApp NON ouvert  sans numéro
```

Les messages WhatsApp (texte, emojis) sont dans `lib/whatsapp.js` : pour changer une phrase, tu ne touches plus qu'à ce fichier.

## Suivre d'où viennent tes visiteurs

Deux façons, qui se complètent :

1. **Automatique** : si le client arrive depuis l'application Facebook, Instagram, Snapchat ou TikTok, le canal est reconnu tout seul.
2. **Par lien** : ajoute `?src=` au lien partagé, par exemple
   `https://ta-boutique.com/sokhna-cosmetiques?src=snapchat` ou `?src=statut-whatsapp`.
   Le canal du lien est prioritaire sur la détection automatique.

Le résultat se lit dans le tableau de bord Filament (widget « Parcours des visiteurs ») et dans la colonne « Canal » des commandes.

## Option : afficher le prix barré quand il y a une promotion

L'API envoie `prix_barre` (vide s'il n'y a pas de promotion). Dans `ProductCard`, à côté du prix :

```jsx
<span className="font-black text-slate-900 text-sm md:text-base whitespace-nowrap">
  {numberFormat(product.prix_vente)} F
</span>
{product.prix_barre && (
  <span className="text-xs text-slate-400 line-through ml-1.5">{numberFormat(product.prix_barre)} F</span>
)}
```

(À faire aussi dans le modal produit si tu veux.)

## Ce qui a été vérifié, et ce qui ne l'a pas été

- Vérifié : les 4 fichiers `lib/` avec un faux navigateur et un faux serveur (24 vérifications : canal, numéro WhatsApp, aucune donnée de prix envoyée, refus de stock, réseau coupé, panne serveur, trop d'appels).
- Vérifié : le script appliqué sur une copie de ton fichier de boutique (avec ses fins de ligne Windows) donne du JSX valide, est relançable sans effet, et refuse sans rien modifier un fichier différent.
- **Non vérifié** : le fonctionnement dans un vrai navigateur avec ton API. Fais une commande de test (panier, puis bouton direct) après avoir déployé le backend.
- Le fichier de boutique que j'ai utilisé prend `params` en entrée, alors que ta page lui passe `tenant` et `initialData` : tu as sans doute une version plus récente. Si le script refuse, utilise la méthode à la main.
