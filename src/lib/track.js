import { BASE_URL } from "./config"
import { pixel } from "./pixel"

// ---------------------------------------------------------------------------
// D'où vient le visiteur ? (le "canal")
//
// On le devine dans cet ordre :
//   1. le lien partagé : https://ta-boutique.com/sokhna?src=snapchat
//   2. l'application qui a ouvert la page (Facebook, Instagram, Snapchat, TikTok)
//   3. le site précédent (referrer)
// Le résultat est gardé pour toute la visite (sessionStorage).
// ---------------------------------------------------------------------------

function nettoyer(texte) {
  return String(texte).toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30)
}

function detecterCanal() {
  const ua = navigator.userAgent || ""
  const ref = document.referrer || ""

  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook"       // navigateur intégré à Facebook / Messenger
  if (/Instagram/i.test(ua)) return "instagram"
  if (/Snapchat/i.test(ua)) return "snapchat"
  if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return "tiktok"

  if (/facebook\.com|fb\.com/i.test(ref)) return "facebook"
  if (/instagram\.com/i.test(ref)) return "instagram"
  if (/snapchat\.com/i.test(ref)) return "snapchat"
  if (/tiktok\.com/i.test(ref)) return "tiktok"
  if (/wa\.me|whatsapp\.com/i.test(ref)) return "whatsapp"
  if (/google\./i.test(ref)) return "google"

  return "inconnu"
}

export function lireCanal() {
  if (typeof window === "undefined") return null

  try {
    const param = new URL(window.location.href).searchParams.get("src")
    if (param && nettoyer(param)) {
      sessionStorage.setItem("canal", nettoyer(param))   // le lien gagne toujours
    }

    let canal = sessionStorage.getItem("canal")
    if (!canal) {
      canal = detecterCanal()
      sessionStorage.setItem("canal", canal)
    }
    return canal
  } catch (e) {
    return null   // navigation privée stricte : on ne bloque rien
  }
}

// ---------------------------------------------------------------------------
// Envoie un évènement au serveur : "visite_boutique", "vue_produit" ou "ajout_panier".
// Si ça échoue, le visiteur ne voit rien : le suivi ne doit JAMAIS gêner un achat.
// ---------------------------------------------------------------------------
export function suivre(slug, type, produitId = null) {
  if (!slug) return

  // Même information pour le Pixel Facebook (s'il y en a un sur cette boutique)
  if (type === "vue_produit" && produitId) {
    pixel("ViewContent", { content_ids: [String(produitId)], content_type: "product" })
  }
  if (type === "ajout_panier" && produitId) {
    pixel("AddToCart", { content_ids: [String(produitId)], content_type: "product" })
  }

  fetch(`${BASE_URL}/api/evenements`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      entreprise_slug: slug,
      type,
      canal: lireCanal(),
      produit_id: produitId,
    }),
    keepalive: true,
  }).catch(() => {})
}
