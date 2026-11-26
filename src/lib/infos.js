// Petits outils partagés autour des "infos de la boutique" (livraison, paiements, contacts).
// Utilisés par le bandeau du haut, le panier, la fiche produit et le bloc d'infos en bas.

export const PAIEMENTS = {
  wave: "Wave",
  orange_money: "Orange Money",
  free_money: "Free Money",
  cash_livraison: "Espèces à la livraison",
  cash_boutique: "Espèces en boutique",
}

// Les noms des moyens de paiement cochés par le vendeur : ["Wave", "Orange Money"]
export function libellesPaiements(infos) {
  return ((infos && infos.paiements) || []).filter((p) => PAIEMENTS[p]).map((p) => PAIEMENTS[p])
}

// Pour tel: et wa.me il faut le numéro complet : 77 123 45 67 -> 221771234567
export function numeroComplet(numero) {
  let chiffres = String(numero || "").replace(/\D/g, "")
  if (chiffres.length === 9) chiffres = "221" + chiffres
  return chiffres
}

// On n'affiche que de vrais liens web (jamais "javascript:..." saisi par erreur ou par un petit malin)
export const lienSur = (url) => (/^https?:\/\//i.test(url || "") ? url : null)

// Y a-t-il quelque chose à montrer dans le bloc d'infos ? (sinon on n'affiche pas de lien "Plus d'infos")
export function aDesInfos(infos) {
  if (!infos) return false
  return Boolean(
    infos.a_propos || infos.adresse || infos.infos_livraison || libellesPaiements(infos).length > 0 ||
    infos.facebook_url || infos.instagram_url || infos.snapchat_url || infos.tiktok_url
  )
}
