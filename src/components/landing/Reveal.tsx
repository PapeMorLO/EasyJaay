"use client"
// Fait apparaître son contenu en douceur quand il entre à l'écran en scrollant.
// Usage : <Reveal delay={100} className="..."> ... </Reveal>   (delay en millisecondes, pour décaler les cartes)
// Sécurité : si le JavaScript ne tourne pas, le contenu reste visible (on ne cache qu'après le chargement).
import { useEffect, useRef } from "react"

export default function Reveal({
  children, className = "", delay = 0,
}: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Pas d'animation si la personne les a désactivées, ou si l'élément est déjà visible à l'écran
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (el.getBoundingClientRect().top < window.innerHeight) return

    el.classList.add("reveal-pre")
    const obs = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`
          el.classList.remove("reveal-pre")
          el.classList.add("reveal-in")
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  return <div ref={ref} className={className}>{children}</div>
}
