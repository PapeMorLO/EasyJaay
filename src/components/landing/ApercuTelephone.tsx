// Téléphone illustré qui joue en boucle : le client choisit un produit, appuie sur « Commander »,
// et le vendeur reçoit une notification WhatsApp. Tout est animé en CSS (voir src/app/landing.css, « tel-* »).
// C'est une ILLUSTRATION (aucune vraie donnée) : « Aperçu illustratif » le dit clairement.

const PRODUITS = [
  { emoji: "👟", nom: "Baskets", prix: "15 000 F", cible: true },
  { emoji: "👜", nom: "Sac à main", prix: "12 500 F" },
  { emoji: "🧴", nom: "Crème karité", prix: "5 000 F" },
  { emoji: "👗", nom: "Robe wax", prix: "18 000 F" },
]

export default function ApercuTelephone() {
  return (
    <div className="mx-auto w-64 sm:w-72">
      <div className="tel-boucle relative rounded-[2.5rem] border-[10px] border-[var(--c-soft)] bg-white shadow-2xl overflow-hidden">
        {/* notification WhatsApp qui descend en haut du téléphone */}
        <div className="tel-notif absolute inset-x-2 top-2 z-20 rounded-xl bg-white p-2.5 shadow-lg border border-slate-100 flex items-center gap-2">
          <div className="h-7 w-7 shrink-0 rounded-full bg-emerald-500 text-white text-sm flex items-center justify-center">💬</div>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold text-slate-900">Nouvelle commande ✅</p>
            <p className="text-[10px] text-slate-500 truncate">Baskets · 15 000 F</p>
          </div>
        </div>

        <div className="bg-[var(--c-accent)] text-[var(--c-dark)] text-center text-[10px] font-bold uppercase tracking-wider py-1.5">
          🚚 Livraison à Dakar et en régions
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
          <div className="h-7 w-7 rounded-lg bg-[var(--c-main)] text-[var(--c-dark)] text-xs font-black flex items-center justify-center">B</div>
          <span className="text-sm font-extrabold text-slate-900">Boutique Exemple</span>
        </div>

        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50">
          {PRODUITS.map((p) => (
            <div key={p.nom}
                 className={`rounded-xl bg-white border border-slate-100 p-2 text-center ${p.cible ? "tel-carte-cible" : ""}`}>
              <div className="aspect-square rounded-lg bg-[var(--c-soft)] flex items-center justify-center text-3xl">{p.emoji}</div>
              <p className="mt-1.5 text-[11px] font-bold text-slate-800 truncate">{p.nom}</p>
              <p className="text-[11px] font-black text-slate-900">{p.prix}</p>
            </div>
          ))}
        </div>

        <div className="p-3 bg-white">
          <div className="tel-bouton rounded-xl bg-emerald-500 text-white text-center text-xs font-extrabold py-2.5">
            Commander sur WhatsApp
          </div>
        </div>

        {/* le doigt qui touche l'écran */}
        <div className="tel-doigt pointer-events-none absolute z-30 text-2xl" style={{ opacity: 0 }}>👆</div>
      </div>
      <p className="mt-3 text-center text-xs opacity-60">Aperçu illustratif</p>
    </div>
  )
}
