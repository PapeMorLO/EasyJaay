// ---------------------------------------------------------------------------
// Pixel Facebook (Meta) : dit à Facebook ce que font les visiteurs venus de tes publicités,
// pour qu'il trouve ensuite des gens qui ressemblent à ceux qui achètent.
//
// Chaque boutique a SON Pixel (champ "Pixel" dans Ma boutique) : le vendeur garde ses données.
// Rien n'est chargé si la boutique n'a pas de Pixel.
// ---------------------------------------------------------------------------

const PIXEL_VALIDE = /^\d{8,20}$/   // on refuse tout ce qui n'est pas un numéro (sécurité)

export function initialiserPixel(id) {
  if (typeof window === "undefined") return

  const pixelId = String(id || "")
  if (!PIXEL_VALIDE.test(pixelId)) return

  window.__pixelsActifs = window.__pixelsActifs || {}
  if (window.__pixelsActifs[pixelId]) return   // déjà démarré sur cette page
  window.__pixelsActifs[pixelId] = true

  // Code officiel de Meta (version courte) : prépare "fbq" et charge le script de Facebook
  if (!window.fbq) {
    const n = (window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    })
    if (!window._fbq) window._fbq = n
    n.push = n
    n.loaded = true
    n.version = "2.0"
    n.queue = []

    const script = document.createElement("script")
    script.async = true
    script.src = "https://connect.facebook.net/en_US/fbevents.js"
    document.head.appendChild(script)
  }

  window.fbq("init", pixelId)
  window.fbq("track", "PageView")
}

// Envoie un évènement à Facebook : "ViewContent", "AddToCart", "Purchase"...
// Sans Pixel ou en cas de problème : ne fait rien (ne doit jamais gêner un achat).
export function pixel(evenement, donnees) {
  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", evenement, donnees)
    }
  } catch (e) {
    // on ignore
  }
}
