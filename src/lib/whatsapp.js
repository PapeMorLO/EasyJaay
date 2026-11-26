// Tout ce qui concerne WhatsApp au même endroit : le lien et le texte des messages.

const formater = (nombre) => new Intl.NumberFormat("fr-FR").format(nombre || 0)

// Lien wa.me vers le numéro de la boutique avec le message déjà écrit.
// wa.me veut un numéro complet sans "+" ni espaces : 221771234567.
// Si le vendeur a saisi "77 123 45 67" (9 chiffres), on ajoute 221.
export function lienWhatsapp(numeroBoutique, message) {
  let numero = String(numeroBoutique || "").replace(/\D/g, "")
  if (numero.length === 9) numero = "221" + numero

  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`
}

// Message pour une commande avec panier
export function messageCommande({ boutique, numero, client, panier, total, livraisonGratuite }) {
  let m = `*Nouvelle commande${numero ? ` n°${numero}` : ""} sur ${boutique}*\n\n`
  m += `👤 *Client :* ${client.nom}\n`
  m += `📞 *Téléphone :* ${client.phone}\n`
  m += `📍 *Livraison :* ${client.adresse}\n`
  m += `🚚 *Mode de livraison :* ${livraisonGratuite ? "Gratuite (Offerte !)" : "Selon zone (à convenir)"}\n\n`
  m += `🛒 *Articles commandés :*\n`

  panier.forEach((item) => {
    const options = []
    if (item.product.selectedSize) options.push(`Taille: ${item.product.selectedSize}`)
    if (item.product.selectedColor) options.push(`Couleur: ${item.product.selectedColor}`)
    const texteOptions = options.length > 0 ? ` [${options.join(", ")}]` : ""

    m += `- *${item.quantity}x* ${item.product.designation}${texteOptions} (${formater(item.product.prix_vente * item.quantity)} FCFA)\n`
  })

  m += `\n💵 *TOTAL : ${formater(total)} FCFA*`
  return m
}

// Message pour "Acheter direct" (un seul produit)
export function messageDirect({ boutique, numero, produit, taille, couleur }) {
  let m = `*Commande directe${numero ? ` n°${numero}` : ""} sur ${boutique}*\n\n`
  m += `🛍️ *Article :* ${produit.designation}\n`
  if (taille) m += `📏 *Pointure/Taille :* ${taille}\n`
  if (couleur) m += `🎨 *Couleur :* ${couleur}\n`
  m += `💵 *Prix :* ${formater(produit.prix_vente)} FCFA\n\n`
  m += `Bonjour, je souhaite commander cet article. Est-il disponible pour livraison ?`
  return m
}
