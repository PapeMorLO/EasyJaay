"use client"
// Petit menu pour téléphone : un bouton « Menu » qui ouvre la liste des sections, et se referme au clic.
import { useState } from "react"

export default function MenuMobile({ liens }: { liens: { label: string; href: string }[] }) {
  const [ouvert, setOuvert] = useState(false)
  return (
    <div className="relative md:hidden">
      <button type="button" onClick={() => setOuvert(!ouvert)} aria-expanded={ouvert}
              className="rounded-full border-2 border-[var(--c-dark)] px-4 py-1.5 text-sm font-bold text-[var(--c-dark)]">
        {ouvert ? "Fermer" : "Menu"}
      </button>
      {ouvert && (
        <nav className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--c-soft2)] bg-white p-2 shadow-xl">
          {liens.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOuvert(false)}
               className="block rounded-xl px-4 py-3 text-sm font-semibold text-[var(--c-dark)] hover:bg-[var(--c-soft)]">
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}
