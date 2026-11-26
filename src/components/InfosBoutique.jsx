"use client"

import { MapPin, Truck, Wallet, Phone, MessageCircle } from "lucide-react"
import { useInfosBoutique } from "../lib/useInfosBoutique"
import { libellesPaiements, numeroComplet, lienSur, aDesInfos } from "../lib/infos"
import { lienWhatsapp } from "../lib/whatsapp"

// ---------------------------------------------------------------------------
// Le bloc d'infos COMPLET, en bas de la boutique : ce qu'un inconnu veut vérifier avant de commander
// (où est la boutique, comment on paie, la livraison, comment joindre une vraie personne, les réseaux).
// Le bandeau du haut ("Plus d'infos") descend ici grâce à l'ancre id="infos-boutique".
//
// Utilisation :  <InfosBoutique infos={infos} couleur={brandColor} />
//   - infos : les données chargées par useInfosBoutique(tenant) dans la page (recommandé : un seul chargement)
//   - ou bien <InfosBoutique tenant={tenant} /> : le composant charge alors ses propres données
// ---------------------------------------------------------------------------

const RESEAUX = [
  ["facebook_url", "Facebook"],
  ["instagram_url", "Instagram"],
  ["snapchat_url", "Snapchat"],
  ["tiktok_url", "TikTok"],
]

function Ligne({ icone: Icone, titre, couleur, children }) {
  return (
    <div className="flex gap-3">
      <Icone className="h-5 w-5 mt-0.5 shrink-0" style={{ color: couleur }} />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{titre}</p>
        <div className="text-sm text-slate-700 leading-relaxed break-words">{children}</div>
      </div>
    </div>
  )
}

export default function InfosBoutique({ tenant, infos: infosFournies, couleur = "#10b981", largeur = "max-w-6xl" }) {
  // Si la page nous donne déjà les infos, on ne charge rien (null = pas de chargement)
  const infosChargees = useInfosBoutique(infosFournies ? null : tenant)
  const infos = infosFournies || infosChargees

  if (!infos || !aDesInfos(infos)) return null

  const paiements = libellesPaiements(infos)
  const livraison = infos.infos_livraison || (infos.type_livraison === "gratuit" ? "Livraison gratuite" : null)
  const appel = numeroComplet(infos.contact_call)
  const whatsapp = numeroComplet(infos.contact_whatsapp)
  const reseaux = RESEAUX.map(([cle, nom]) => [nom, lienSur(infos[cle])]).filter(([, url]) => url)

  return (
    <section id="infos-boutique" className={`${largeur} mx-auto px-4 mt-16 scroll-mt-20`}>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {infos.a_propos && (
          <p className="text-sm text-slate-600 leading-relaxed mb-4 pb-4 border-b border-slate-100">{infos.a_propos}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {infos.adresse && (
            <Ligne icone={MapPin} titre="Où nous trouver" couleur={couleur}>{infos.adresse}</Ligne>
          )}

          {livraison && (
            <Ligne icone={Truck} titre="Livraison" couleur={couleur}>{livraison}</Ligne>
          )}

          {paiements.length > 0 && (
            <Ligne icone={Wallet} titre="Paiement" couleur={couleur}>
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {paiements.map((p) => (
                  <span key={p} className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{p}</span>
                ))}
              </div>
            </Ligne>
          )}

          {(appel || whatsapp) && (
            <Ligne icone={Phone} titre="Nous joindre" couleur={couleur}>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {appel && (
                  <a href={`tel:+${appel}`} className="font-semibold underline underline-offset-2">Appeler</a>
                )}
                {whatsapp && (
                  <a
                    href={lienWhatsapp(whatsapp, `Bonjour ${infos.raison_sociale || ""}, j'ai une question.`)}
                    className="font-semibold underline underline-offset-2 inline-flex items-center gap-1"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                )}
              </div>
            </Ligne>
          )}
        </div>

        {reseaux.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            {reseaux.map(([nom, url]) => (
              <a
                key={nom}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                {nom}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
