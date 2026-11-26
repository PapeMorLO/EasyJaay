"use client"
// Charge les infos de la boutique (livraison, paiements, contacts, réseaux...) UNE seule fois pour toute la page,
// et démarre le Pixel Facebook de la boutique s'il y en a un.
// Utilisation :  const infos = useInfosBoutique(tenant)     -> null tant que ce n'est pas chargé (ou en cas d'erreur)
// Passer null à la place du tenant = ne rien charger.
import { useEffect, useState } from "react"
import { BASE_URL } from "./config"
import { initialiserPixel } from "./pixel"

export function useInfosBoutique(tenant) {
  const [infos, setInfos] = useState(null)

  useEffect(() => {
    if (!tenant) return
    let annule = false

    fetch(`${BASE_URL}/api/shops/${tenant}/infos`, { headers: { Accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (annule || !data || !data.infos) return
        setInfos(data.infos)
        initialiserPixel(data.infos.pixel_facebook)
      })
      .catch(() => {})   // pas d'infos plutôt qu'une erreur visible

    return () => { annule = true }
  }, [tenant])

  return infos
}
