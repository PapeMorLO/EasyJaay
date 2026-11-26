// Petits morceaux d'interface (illustrations) affichés dans les cartes de fonctionnalités.
// Ils montrent ce que voit le vendeur ou le client. Les données sont FICTIVES : la mention « Illustration » le dit.
// Composants serveur : pas de JavaScript envoyé au navigateur.
import { Warning } from "@phosphor-icons/react/dist/ssr"

function Cadre({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-2xl border border-[var(--c-dark)]/15 bg-white p-3 shadow-sm" aria-hidden="true">
      {children}
      <p className="mt-2 text-right text-[10px] opacity-50">Illustration</p>
    </div>
  )
}

// Notification de commande
function Commande() {
  return (
    <Cadre>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold">Commande n° 1042</p>
          <p className="truncate text-xs opacity-60">Baskets · 15 000 F</p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--c-main)] px-2.5 py-1 text-[10px] font-extrabold text-[var(--c-dark)]">Nouvelle</span>
      </div>
    </Cadre>
  )
}

// Alerte de stock bas
function Stock() {
  return (
    <Cadre>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-extrabold">Crème karité</p>
        <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--c-main)]" style={{ color: "#b8402f" }}>
          <Warning size={14} weight="bold" /> Plus que 2
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-[var(--c-soft2)]">
        <div className="h-2 w-[12%] rounded-full bg-[var(--c-main)]" />
      </div>
    </Cadre>
  )
}

// Aperçu d'un lien de produit collé dans WhatsApp
function Lien() {
  return (
    <Cadre>
      <div className="flex gap-3 overflow-hidden rounded-xl bg-[var(--c-soft)] p-2">
        <div className="h-14 w-14 shrink-0 rounded-lg bg-[var(--c-accent)]" />
        <div className="min-w-0 self-center">
          <p className="truncate text-xs font-extrabold">Sac à main</p>
          <p className="text-xs font-bold">12 500 F</p>
          <p className="truncate text-[10px] opacity-60">votre-boutique.com/p/12</p>
        </div>
      </div>
    </Cadre>
  )
}

export default function Fragment({ type }: { type: "commande" | "stock" | "lien" }) {
  if (type === "commande") return <Commande />
  if (type === "stock") return <Stock />
  return <Lien />
}
