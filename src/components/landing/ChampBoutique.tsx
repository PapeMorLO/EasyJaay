"use client"
// Petit champ du hero : le visiteur tape le nom de sa boutique, voit son adresse apparaître,
// puis arrive sur /inscription avec le nom déjà rempli (voir FormulaireInscription : paramètre ?nom=).
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// "Sokhna Cosmétiques" -> "sokhna-cosmetiques" (simple version d'aperçu ; le vrai calcul est fait par le serveur)
function slugifier(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

export default function ChampBoutique() {
  const router = useRouter()
  const [nom, setNom] = useState("")
  const [hote, setHote] = useState("")
  useEffect(() => setHote(window.location.host), [])

  function valider(e: React.FormEvent) {
    e.preventDefault()
    router.push(nom.trim() ? `/inscription?nom=${encodeURIComponent(nom.trim())}` : "/inscription")
  }

  const slug = slugifier(nom)

  return (
    <form onSubmit={valider} className="w-full max-w-md">
      <label htmlFor="hero-nom" className="sr-only">Nom de votre boutique</label>
      <div className="flex flex-col sm:flex-row gap-2 rounded-3xl bg-white p-2 shadow-lg">
        <input id="hero-nom" value={nom} onChange={(e) => setNom(e.target.value)} maxLength={60}
               placeholder="Nom de votre boutique" autoComplete="off"
               className="flex-1 rounded-2xl px-4 py-3 text-base text-[var(--c-dark)] outline-none placeholder:text-slate-400" />
        <button type="submit"
                className="btn btn-corail">
          Créer ma boutique
        </button>
      </div>
      <p className="mt-3 pl-2 text-sm opacity-75 truncate">
        Votre adresse : <span className="font-bold">{hote || "votre-site"}/{slug || "nom-de-votre-boutique"}</span>
      </p>
    </form>
  )
}
