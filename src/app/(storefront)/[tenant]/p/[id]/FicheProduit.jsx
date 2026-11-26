"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MessageCircle, ShoppingBag } from "lucide-react"
import { BASE_URL } from "../../../../../lib/config"
import { urlsImages } from "../../../../../lib/images"
import { suivre } from "../../../../../lib/track"
import { envoyerCommandeDirecte } from "../../../../../lib/commande"
import { messageDirect, lienWhatsapp } from "../../../../../lib/whatsapp"
import InfosBoutique from "../../../../../components/InfosBoutique"

const formater = (n) => new Intl.NumberFormat("fr-FR").format(n || 0)

// Une ligne de boutons pour choisir une taille ou une couleur
function Choix({ titre, options, valeur, onChoisir, couleur }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">{titre}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const actif = valeur === String(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChoisir(String(option))}
              className="px-4 py-2 rounded-xl border text-sm font-bold transition active:scale-95"
              style={actif ? { backgroundColor: couleur, borderColor: couleur, color: "#fff" } : { borderColor: "#e2e8f0", color: "#334155" }}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function FicheProduit({ tenant, shop, produit }) {
  const couleur = shop.couleur_theme || "#10b981"
  const images = urlsImages(produit.image1)
  const tailles = produit.taille_dimension || []
  const couleurs = produit.color || []
  const epuise = produit.quantite_stock <= 0

  const [indexImage, setIndexImage] = useState(0)
  const [taille, setTaille] = useState("")
  const [couleurChoisie, setCouleurChoisie] = useState("")
  const [message, setMessage] = useState("")
  const [enCours, setEnCours] = useState(false)
  const dejaClique = useRef(false)   // évite le double clic

  // À l'arrivée sur la page : on compte la visite et la vue du produit (une visite par session)
  useEffect(() => {
    suivre(tenant, "visite_boutique")
    suivre(tenant, "vue_produit", produit.id)

    try {
      const cle = `tracked_shop_${tenant}`
      if (!sessionStorage.getItem(cle)) {
        fetch(`${BASE_URL}/api/shops/${tenant}/increment-view`, { method: "POST", keepalive: true })
          .then(() => sessionStorage.setItem(cle, "true"))
          .catch(() => {})
      }
    } catch (e) {
      // navigation privée stricte : on ignore
    }
  }, [tenant, produit.id])

  const commander = async () => {
    if (dejaClique.current || epuise) return

    if (tailles.length > 0 && !taille) return setMessage("Choisissez une taille.")
    if (couleurs.length > 0 && !couleurChoisie) return setMessage("Choisissez une couleur.")
    if (!shop.contact_whatsapp) return setMessage("Cette boutique n'a pas encore de numéro WhatsApp.")

    setMessage("")
    dejaClique.current = true
    setEnCours(true)
    suivre(tenant, "ajout_panier", produit.id)   // l'intention d'achat, comme un ajout au panier

    // 1. On enregistre la commande chez Laravel : le vendeur la voit dans son admin
    const resultat = await envoyerCommandeDirecte({
      slug: tenant,
      produit,
      taille: taille || null,
      couleur: couleurChoisie || null,
    })

    // 2. Le serveur refuse (ex : stock épuisé) : on explique, WhatsApp ne s'ouvre pas
    if (!resultat.ok && !resultat.reseau) {
      setMessage(resultat.message)
      setEnCours(false)
      dejaClique.current = false
      return
    }

    // 3. Enregistrée (ou réseau coupé : on laisse passer) -> WhatsApp avec le message prêt
    const texte = messageDirect({
      boutique: shop.raison_sociale,
      numero: resultat.numero,
      produit,
      taille,
      couleur: couleurChoisie,
    })
    window.location.href = lienWhatsapp(shop.contact_whatsapp, texte)

    // Si le client revient avec la flèche "retour", le bouton doit refonctionner
    setTimeout(() => {
      dejaClique.current = false
      setEnCours(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* En-tête : retour vers toute la boutique */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <p className="font-extrabold text-slate-900 truncate">{shop.raison_sociale}</p>
        <Link
          href={`/${tenant}`}
          className="shrink-0 ml-3 inline-flex items-center gap-1.5 text-sm font-bold"
          style={{ color: couleur }}
        >
          <ShoppingBag className="h-4 w-4" /> Voir la boutique
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 grid gap-6 md:grid-cols-2">
        {/* Photos */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200">
            <img src={images[indexImage]} alt={produit.designation} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => setIndexImage(i)}
                  className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2"
                  style={{ borderColor: i === indexImage ? couleur : "transparent" }}
                >
                  <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos et commande */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{produit.designation}</h1>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{formater(produit.prix_vente)} FCFA</span>
            {produit.prix_barre && (
              <span className="text-sm text-slate-400 line-through">{formater(produit.prix_barre)} FCFA</span>
            )}
            {produit.taux_promotion > 0 && (
              <span className="text-xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5">-{produit.taux_promotion}%</span>
            )}
          </div>

          {produit.description && (
            <p className="mt-4 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{produit.description}</p>
          )}

          <div className="mt-5">
            {tailles.length > 0 && (
              <Choix titre="Taille / Pointure" options={tailles} valeur={taille} onChoisir={setTaille} couleur={couleur} />
            )}
            {couleurs.length > 0 && (
              <Choix titre="Couleur" options={couleurs} valeur={couleurChoisie} onChoisir={setCouleurChoisie} couleur={couleur} />
            )}
          </div>

          {message && <p className="mb-3 text-sm font-semibold text-red-600">{message}</p>}

          <button
            type="button"
            onClick={commander}
            disabled={epuise || enCours}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-white font-extrabold text-base shadow-sm transition active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: epuise ? "#94a3b8" : "#16a34a" }}
          >
            <MessageCircle className="h-5 w-5" />
            {epuise ? "Épuisé" : enCours ? "Un instant..." : "Commander sur WhatsApp"}
          </button>
          {!epuise && (
            <p className="mt-2 text-xs text-slate-400 text-center">
              Votre commande s'ouvre dans WhatsApp : appuyez sur « Envoyer » pour la confirmer.
            </p>
          )}
        </div>
      </main>

      <InfosBoutique tenant={tenant} couleur={couleur} largeur="max-w-5xl" />
    </div>
  )
}
