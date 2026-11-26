// Dans le panier, juste avant le formulaire : livraison et paiement, à l'endroit où le client hésite.
import { Truck, Wallet } from "lucide-react"
import { libellesPaiements } from "../lib/infos"

export default function InfosCommande({ infos, typeLivraison }) {
  const paiements = libellesPaiements(infos)
  const detailsLivraison = infos && infos.infos_livraison

  return (
    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-4 mt-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white rounded-xl shadow-sm text-slate-600 shrink-0"><Truck className="h-4 w-4" /></div>
        <div className="min-w-0">
          <h5 className="text-sm font-bold text-slate-900">Livraison</h5>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed break-words">
            {detailsLivraison ||
              (typeLivraison === "gratuit"
                ? "La livraison est offerte par la boutique."
                : "Les frais de livraison dépendent de votre zone et seront convenus avec le vendeur lors de la validation.")}
          </p>
        </div>
      </div>

      {paiements.length > 0 && (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm text-slate-600 shrink-0"><Wallet className="h-4 w-4" /></div>
          <div className="min-w-0">
            <h5 className="text-sm font-bold text-slate-900">Paiement</h5>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {paiements.map((p) => (
                <span key={p} className="px-2.5 py-1 rounded-full bg-white border border-slate-100 text-xs font-semibold text-slate-700">{p}</span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Le paiement se règle directement avec le vendeur.</p>
          </div>
        </div>
      )}
    </div>
  )
}
