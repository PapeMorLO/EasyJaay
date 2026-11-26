"use client"

import { MapPin, Truck, Phone, MessageCircle } from "lucide-react"
import { libellesPaiements, numeroComplet, lienSur } from "../lib/infos"
import { lienWhatsapp } from "../lib/whatsapp"

// ---------------------------------------------------------------------------
// PIED DE PAGE DE LA BOUTIQUE (bleu nuit)
// Il remplace DEUX anciens blocs : le cadre blanc "InfosBoutique" et l'ancien Footer.
// Tout ce qu'un inconnu veut vérifier avant de commander est ici, au même endroit :
//   colonne 1 : nom de la boutique + à propos
//   colonne 2 : adresse + livraison
//   colonne 3 : moyens de paiement + boutons WhatsApp / Appeler
//   ligne du bas : réseaux sociaux, copyright, "Propulsé par DiayRek"
//
// L'ancre id="infos-boutique" est conservée : le lien "Plus d'infos" du bandeau du haut descend jusqu'ici.
//
// Les colonnes vides disparaissent toutes seules (un vendeur qui n'a rempli que son WhatsApp aura un pied de page court).
//
// Utilisation (dans page.jsx) :
//   <PiedDePage infos={infos} shopName={...} brandColor={...} logoUrl={...} texteSurCouleur={...} whatsapp={...} />
//   - infos            : les données chargées par useInfosBoutique(tenant)
//   - logoUrl          : l'adresse COMPLÈTE de l'image du logo (ou null : on affiche la première lettre)
//   - texteSurCouleur  : "#ffffff" ou "#0f172a", la couleur de texte lisible sur brandColor
//   - whatsapp         : numéro de secours si le vendeur n'a pas rempli son WhatsApp dans "Ma boutique"
// ---------------------------------------------------------------------------

const RESEAUX = [
  ["facebook_url", "Facebook"],
  ["instagram_url", "Instagram"],
  ["snapchat_url", "Snapchat"],
  ["tiktok_url", "TikTok"],
]

// Une ligne "icône + texte" des colonnes 2 (adresse, livraison)
function Ligne({ icone: Icone, titre, children }) {
  return (
    <div className="flex gap-3">
      <Icone className="h-5 w-5 mt-0.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{titre}</p>
        <p className="text-sm text-slate-300 leading-relaxed break-words">{children}</p>
      </div>
    </div>
  )
}

export default function PiedDePage({ infos, shopName, brandColor, logoUrl, texteSurCouleur, whatsapp }) {
  const nom = shopName || "Boutique"
  const couleur = brandColor || "#10b981"
  const i = infos || {}

  // On prépare les données une seule fois
  const paiements = libellesPaiements(i)
  const livraison = i.infos_livraison || (i.type_livraison === "gratuit" ? "Livraison gratuite" : null)
  const appel = numeroComplet(i.contact_call)
  const numWhatsapp = numeroComplet(i.contact_whatsapp || whatsapp)
  const reseaux = RESEAUX.map(([cle, libelle]) => [libelle, lienSur(i[cle])]).filter(([, url]) => url)

  const aPropos = i.a_propos
  const aColonne2 = Boolean(i.adresse || livraison)
  const aColonne3 = paiements.length > 0 || Boolean(numWhatsapp || appel)

  return (
    <footer
      id="infos-boutique"
      className="bg-[#0f172a] text-slate-300 mt-20 pt-12 pb-28 px-6 scroll-mt-20 border-t-4"
      style={{ borderTopColor: couleur }}
    >
      <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-3">
        {/* Colonne 1 : qui est la boutique */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={nom}
                className="h-12 w-12 object-cover rounded-2xl border border-slate-700"
                onError={(e) => { e.target.style.display = "none" }}
              />
            ) : (
              <div
                className="h-12 w-12 flex items-center justify-center rounded-2xl font-black text-xl"
                style={{ backgroundColor: couleur, color: texteSurCouleur || "#ffffff" }}
              >
                {nom.charAt(0).toUpperCase()}
              </div>
            )}
            <h4 className="font-extrabold text-lg text-white leading-tight">{nom}</h4>
          </div>
          {aPropos && <p className="text-sm text-slate-400 leading-relaxed">{aPropos}</p>}
        </div>

        {/* Colonne 2 : où et comment on reçoit */}
        {aColonne2 && (
          <div className="space-y-5">
            {i.adresse && <Ligne icone={MapPin} titre="Où nous trouver">{i.adresse}</Ligne>}
            {livraison && <Ligne icone={Truck} titre="Livraison">{livraison}</Ligne>}
          </div>
        )}

        {/* Colonne 3 : payer et nous joindre */}
        {aColonne3 && (
          <div>
            {paiements.length > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Paiement</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {paiements.map((p) => (
                    <span key={p} className="px-2.5 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-200">{p}</span>
                  ))}
                </div>
              </>
            )}

            {/* Le bouton WhatsApp est en pleine largeur sur téléphone : facile à toucher */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2">
              {numWhatsapp && (
                <a
                  href={lienWhatsapp(numWhatsapp, `Bonjour ${nom}, j'ai une question.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-emerald-950 hover:bg-emerald-400 active:scale-95 transition"
                >
                  <MessageCircle className="h-4 w-4" /> Écrire sur WhatsApp
                </a>
              )}
              {appel && (
                <a
                  href={`tel:+${appel}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-slate-800 active:scale-95 transition"
                >
                  <Phone className="h-4 w-4" /> Appeler
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ligne du bas : réseaux, copyright, "Propulsé par" */}
      <div className="max-w-6xl mx-auto border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-slate-400 font-medium">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {reseaux.map(([libelle, url]) => (
            <a key={libelle} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline underline-offset-2 transition">
              {libelle}
            </a>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <p>&copy; {new Date().getFullYear()} {nom}. Tous droits réservés.</p>
          <a
            href="/?src=boutique"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-extrabold text-slate-300 hover:text-white transition"
          >
            <span className="font-medium text-slate-400">Propulsé par</span>
            <span className="h-4 w-6 bg-teal-600 text-white rounded flex items-center justify-center font-black text-[9px]">AKH</span>
            <span>DiayRek</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
