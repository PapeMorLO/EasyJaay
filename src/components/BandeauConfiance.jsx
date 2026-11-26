// Bandeau du haut de la boutique : en une ligne, ce qui rassure avant même de regarder les produits
// (livraison, moyens de paiement, lien vers toutes les infos).
// Sur téléphone la ligne défile sur le côté ; sur grand écran elle est centrée.
import { Truck, Wallet } from "lucide-react"
import { libellesPaiements, aDesInfos } from "../lib/infos"

export default function BandeauConfiance({ infos, typeLivraison, fond, texte }) {
  const paiements = libellesPaiements(infos)
  // Le texte du vendeur d'abord ; sinon une phrase par défaut selon le type de livraison
  const livraison = (infos && infos.infos_livraison) || (typeLivraison === "gratuit" ? "Livraison offerte" : "Livraison selon votre zone")

  return (
    <div style={{ backgroundColor: fond, color: texte }} className="w-full px-4 py-2 text-xs font-semibold">
      <div className="max-w-6xl mx-auto flex items-center gap-x-5 overflow-x-auto scrollbar-none whitespace-nowrap md:justify-center">
        <span className="flex items-center gap-1.5 shrink-0">
          <Truck className="h-4 w-4" />
          <span className="max-w-[18rem] truncate">{livraison}</span>
        </span>

        {paiements.length > 0 && (
          <span className="flex items-center gap-1.5 shrink-0">
            <Wallet className="h-4 w-4" />
            {paiements.join(" · ")}
          </span>
        )}

        {aDesInfos(infos) && (
          <a href="#infos-boutique" className="shrink-0 font-bold underline underline-offset-2">
            Plus d&apos;infos
          </a>
        )}
      </div>
    </div>
  )
}
