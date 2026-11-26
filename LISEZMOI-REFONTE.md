# Refonte : page d'accueil + inscription en 2 temps

## Carte des fichiers (tout est sous src/)
- src/lib/landing.ts                              <- TOUS les textes, numéros, boutique exemple, tarifs. Tu modifies ICI.
- src/app/page.tsx                                <- page d'accueil (design, lit landing.ts)
- src/components/landing/ApercuTelephone.tsx      <- le téléphone illustré du haut de page
- src/app/inscription/page.tsx                    <- page /inscription (enveloppe)
- src/components/inscription/FormulaireInscription.tsx <- formulaire + écran « Premiers pas »

## Installation
0. NOUVEAU (v5) : npm install @phosphor-icons/react   (icônes Phosphor, à faire une seule fois)
1. SAUVEGARDE l'ancienne page : copie src/app/page.tsx en src/app/page.tsx.ancien (hors du dossier app si possible)
2. Dézippe à la racine du projet (écrase src/app/page.tsx)
3. rm -rf .next   (Windows : supprime le dossier .next)
4. npm run build   puis   npm run start

## À régler dans src/lib/landing.ts
- BOUTIQUE_EXEMPLE : mets le slug d'une VRAIE boutique remplie (ton log montrait /sokhna-cosmetique : vérifie l'orthographe)
- TARIFS : vide = section cachée. Remplis quand tu as décidé des prix.
- API_URL : lit NEXT_PUBLIC_API_URL, sinon l'adresse en dur.

## Si /inscription donne une 404
Ton middleware.ts la prend peut-être pour une boutique : envoie-moi ce fichier.

## Couleurs et animations (v2)
- Palette : 4 lignes en haut de src/app/landing.css (--c-main violet, --c-dark, --c-soft, --c-accent jaune). Change-les, tout le site suit.
- Le vert WhatsApp (boutons "Commander", "Discuter sur WhatsApp") reste volontairement vert.
- Animations : toutes dans landing.css (téléphone qui joue la commande en boucle de 9 s, bouton qui pulse, cartes qui se soulèvent, FAQ qui glisse)
  + composant Reveal.tsx (apparition au scroll). Elles se coupent seules si le téléphone du visiteur a "réduire les animations".
- Pour ralentir/accélérer le téléphone : --duree: 9s dans .tel-boucle.

## Version 3 : inspiration "design moderne"
- Titres plus grands et gras, police Plus Jakarta Sans (fichier dans src/fonts/, aucune requête Google, aucune nouvelle dépendance npm).
- Grille "bento" colorée pour les avantages : couleurs/tailles des cases dans le tableau BENTO en haut de src/app/page.tsx.
- Hero : champ "Nom de votre boutique" (ChampBoutique.tsx) -> l'adresse s'affiche en direct -> /inscription?nom=... avec le nom déjà rempli.
- Bande de produits qui défile (liste EXEMPLES_PRODUITS dans landing.ts ; c'est une illustration).
- Changer de police : remplace le .woff2 et le chemin dans src/lib/police.ts.

## Version 4 : habillage "marché" + tarifs DiayRek
- Palette crème / encre / corail / safran : variables --c-* en haut de src/app/landing.css (inspirée du design Souk, contenu 100 % DiayRek).
- Titres en serif (Fraunces, src/fonts/), frange de triangles safran, boutons à ombre dure (.btn-corail, .btn-safran, .btn-whatsapp).
- TARIFS : les 3 packs (Tawfekh, Baaral, Joni Joni) sont dans PACKS de src/lib/landing.ts. Total, 1er versement et "reste" sont CALCULES
  depuis la durée, la mensualité et les mois d'avance. Change un chiffre, tout suit.
- INCLUS (landing.ts) = les services du PDF. A VERIFIER : ne garde que ce qui est réellement livré (campagnes mensuelles, factures/devis, synchro réseaux).
- BOUTIQUES_MONTREES (landing.ts) : vide = galerie cachée. Ajoute de VRAIES boutiques avec l'accord de leur propriétaire.
- Pied de page : nom, NINEA, RCCM, adresse (ENTREPRISE dans landing.ts). Supprime-les si tu ne veux pas les afficher.
- Menu mobile (MenuMobile.tsx), section "Pour qui ?", bouton "Choisir ce pack" -> WhatsApp avec le nom du pack déjà écrit.

## Version 5 : icônes Phosphor, plus d'emojis (sauf dans l'aperçu du téléphone)
- Icônes : Phosphor, style "bold", dans une pastille ronde de la couleur de la marque. Table ICONES en haut de src/app/page.tsx
  (clé de landing.ts -> composant). Catalogue pour changer : https://phosphoricons.com
- Fragments d'interface illustrés (commande, stock bas, aperçu de lien) : src/components/landing/FragmentsInterface.tsx.
  On les active par carte avec fragment: "commande" | "stock" | "lien" dans AVANTAGES (landing.ts). Données fictives, mention "Illustration".
- Étapes : seulement les grands numéros. Bande de produits : texte + losange de couleur.
