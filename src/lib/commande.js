import { BASE_URL } from "./config"
import { lireCanal } from "./track"
import { pixel } from "./pixel"

// ---------------------------------------------------------------------------
// Envoie une commande à Laravel.
//
// Résultat possible :
//   { ok: true,  numero, total }          -> commande enregistrée
//   { ok: false, reseau: false, message } -> le serveur REFUSE (stock épuisé, article retiré...) :
//                                            on affiche le message et on N'ouvre PAS WhatsApp
//   { ok: false, reseau: true }           -> pas de réseau ou serveur en panne : on laisse quand même
//                                            le client passer par WhatsApp (mieux qu'une vente perdue)
//
// IMPORTANT : on n'envoie AUCUN prix. Laravel les relit dans la base.
// ---------------------------------------------------------------------------
async function appeler(chemin, corps) {
  try {
    const res = await fetch(`${BASE_URL}${chemin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(corps),
    })

    let data = {}
    try {
      data = await res.json()
    } catch (e) {
      // réponse sans JSON : on gère plus bas selon le code HTTP
    }

    if (res.ok) {
      // Commande enregistrée : on prévient le Pixel Facebook (pour optimiser les publicités sur les commandes)
      if (data.total) pixel("Purchase", { value: data.total, currency: "XOF" })
      return { ok: true, numero: data.numero || data.commande_id || null, total: data.total ?? null }
    }

    if (res.status >= 500) {
      return { ok: false, reseau: true }   // panne côté serveur : on ne bloque pas la vente
    }

    let message = data.message || "La commande n'a pas pu être enregistrée."
    if (res.status === 422 && data.errors) message = "Vérifiez votre nom, votre téléphone et votre adresse."
    if (res.status === 429) message = "Trop de tentatives. Réessayez dans une minute."

    return { ok: false, reseau: false, message }
  } catch (e) {
    return { ok: false, reseau: true }
  }
}

// Panier + formulaire (nom, téléphone, adresse)
export function envoyerCommande({ slug, client, panier }) {
  return appeler("/api/commandes", {
    entreprise_slug: slug,
    canal: lireCanal(),
    nom_client: client.nom,
    phone_client: client.phone,
    adresse_livraison: client.adresse,
    produits: panier.map((item) => ({
      id: item.product.id,
      quantite: item.quantity,
      selected_size: item.product.selectedSize || null,
      selected_color: item.product.selectedColor || null,
    })),
  })
}

// Bouton "Acheter direct sur WhatsApp" : un seul produit, sans formulaire
export function envoyerCommandeDirecte({ slug, produit, taille, couleur }) {
  return appeler("/api/commandes/direct", {
    entreprise_slug: slug,
    canal: lireCanal(),
    produits: [
      {
        id: produit.id,
        quantite: 1,
        selected_size: taille || null,
        selected_color: couleur || null,
      },
    ],
  })
}
