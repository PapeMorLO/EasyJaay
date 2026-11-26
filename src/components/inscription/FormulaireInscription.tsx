"use client"
// Inscription en 2 temps :
//   ETAPE 1 : un formulaire court (nom boutique, WhatsApp, e-mail, mot de passe)
//   ETAPE 2 : écran « Premiers pas » (tester WhatsApp, ajouter un produit, partager le lien)
// Les infos de la boutique créée sont gardées dans le navigateur (localStorage) :
// si le vendeur rafraîchit la page, il retrouve son écran « Premiers pas ».
import { useEffect, useState } from "react"
import Link from "next/link"
import { API_URL, MARQUE, SUPPORT_WHATSAPP, lienWhatsapp } from "../../lib/landing"

type Boutique = { slug: string; nom: string; email: string; whatsapp: string }
type Verif = { slug: string | null; nom_pris: boolean; adresse_modifiee: boolean }

const CLE_STOCKAGE = "diayrek_premiers_pas"

// "77 123 45 67" ou "+221 77 123 45 67" -> "221771234567" (même règle que le serveur)
function normaliser(brut: string): string {
  let n = brut.replace(/\D/g, "")
  if (n.startsWith("00221")) n = n.slice(2)
  if (n.length === 9) n = "221" + n
  return n
}

export default function FormulaireInscription() {
  const [nom, setNom] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [motDePasse, setMotDePasse] = useState("")
  const [voirMdp, setVoirMdp] = useState(false)

  const [verif, setVerif] = useState<Verif | null>(null)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [erreurGenerale, setErreurGenerale] = useState("")
  const [envoi, setEnvoi] = useState(false)
  const [boutique, setBoutique] = useState<Boutique | null>(null)
  const [copie, setCopie] = useState(false)

  // Au chargement : a-t-on déjà créé une boutique dans ce navigateur ?
  useEffect(() => {
    try {
      const sauve = localStorage.getItem(CLE_STOCKAGE)
      if (sauve) setBoutique(JSON.parse(sauve))
    } catch {}
    // Venu du champ de la page d'accueil : /inscription?nom=Ma%20Boutique
    const nomPropose = new URLSearchParams(window.location.search).get("nom")
    if (nomPropose) setNom(nomPropose.slice(0, 60))
  }, [])

  // Pendant la saisie du nom : on demande au serveur quelle adresse sera attribuée (après 400 ms de pause)
  useEffect(() => {
    if (nom.trim().length < 2) { setVerif(null); return }
    const minuteur = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/api/onboarding/verifier?nom=${encodeURIComponent(nom.trim())}`)
        if (r.ok) setVerif(await r.json())
      } catch {}
    }, 400)
    return () => clearTimeout(minuteur)
  }, [nom])

  // ----- validation côté navigateur (le serveur revalide toujours) -----
  function valider(): Record<string, string> {
    const e: Record<string, string> = {}
    if (nom.trim().length < 2) e.raison_sociale = "Donnez un nom à votre boutique."
    if (!/^221\d{9}$/.test(normaliser(whatsapp))) e.contact_whatsapp = "Numéro invalide. Exemple : 77 123 45 67"
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = "Adresse e-mail invalide."
    if (motDePasse.length < 6) e.password = "6 caractères minimum."
    return e
  }

  async function envoyer(ev: React.FormEvent) {
    ev.preventDefault()
    setErreurGenerale("")
    const e = valider()
    setErreurs(e)
    if (Object.keys(e).length > 0) return

    setEnvoi(true)
    try {
      const r = await fetch(`${API_URL}/api/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          raison_sociale: nom.trim(),
          contact_whatsapp: normaliser(whatsapp),
          email: email.trim(),
          password: motDePasse,
        }),
      })
      const donnees = await r.json().catch(() => ({}))

      if (r.status === 422 && donnees.errors) {
        // Laravel renvoie { errors: { champ: ["message", ...] } } : on garde le 1er message de chaque champ
        const m: Record<string, string> = {}
        for (const champ of Object.keys(donnees.errors)) m[champ] = donnees.errors[champ][0]
        setErreurs(m)
        return
      }
      if (!r.ok) {
        setErreurGenerale(donnees.message || "Une erreur est survenue. Réessayez dans un instant.")
        return
      }

      const b: Boutique = {
        slug: donnees.data.shop_slug,
        nom: donnees.data.raison_sociale,
        email: email.trim(),
        whatsapp: normaliser(whatsapp),
      }
      try { localStorage.setItem(CLE_STOCKAGE, JSON.stringify(b)) } catch {}
      setBoutique(b)
      window.scrollTo({ top: 0 })
    } catch {
      setErreurGenerale("Connexion impossible. Vérifiez votre réseau et réessayez.")
    } finally {
      setEnvoi(false)
    }
  }

  // =====================  ETAPE 2 : PREMIERS PAS  =====================
  if (boutique) {
    const lien = `${typeof window !== "undefined" ? window.location.origin : ""}/${boutique.slug}`
    const msgTest = lienWhatsapp(
      boutique.whatsapp,
      `Test ${MARQUE} ✅ Ma boutique « ${boutique.nom} » est prête : ${lien}`
    )
    const msgPartage = `https://wa.me/?text=${encodeURIComponent(`Ma boutique est en ligne 🎉 Découvrez-la ici : ${lien}`)}`
    const msgAide = lienWhatsapp(SUPPORT_WHATSAPP, `Bonjour, j'ai créé ma boutique « ${boutique.nom} » et j'ai besoin d'aide.`)

    async function copier() {
      try { await navigator.clipboard.writeText(lien); setCopie(true); setTimeout(() => setCopie(false), 2000) } catch {}
    }
    function recommencer() {
      try { localStorage.removeItem(CLE_STOCKAGE) } catch {}
      setBoutique(null)
    }

    return (
      <main className="min-h-screen bg-[var(--c-soft)] px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <div className="text-5xl">🎉</div>
            <h1 className="titre mt-3 text-3xl font-black text-slate-900">Votre boutique est créée !</h1>
            <p className="mt-2 text-slate-600">Trois petites choses pour bien démarrer.</p>
          </div>

          <ol className="mt-8 space-y-4">
            {/* 1. test WhatsApp */}
            <li className="rounded-2xl bg-white p-5 border border-slate-200">
              <h2 className="font-extrabold text-slate-900">1. Vérifiez que WhatsApp fonctionne</h2>
              <p className="mt-1 text-sm text-slate-600">
                Les commandes arriveront sur le <strong>+{boutique.whatsapp}</strong>. Envoyez-vous un message test.
              </p>
              <a href={msgTest} target="_blank" rel="noopener noreferrer"
                 className="mt-3 inline-block rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600">
                Envoyer un message test
              </a>
            </li>

            {/* 2. premier produit */}
            <li className="rounded-2xl bg-white p-5 border border-slate-200">
              <h2 className="font-extrabold text-slate-900">2. Ajoutez votre premier produit</h2>
              <p className="mt-1 text-sm text-slate-600">
                Connectez-vous à votre espace avec l&apos;e-mail <strong>{boutique.email}</strong> et le mot de passe choisi.
              </p>
              <a href={`${API_URL}/admin/login`}
                 className="mt-3 inline-block rounded-xl bg-[var(--c-main)] px-5 py-2.5 text-sm font-bold text-[var(--c-dark)] hover:brightness-95">
                Ouvrir mon espace vendeur
              </a>
            </li>

            {/* 3. partager */}
            <li className="rounded-2xl bg-white p-5 border border-slate-200">
              <h2 className="font-extrabold text-slate-900">3. Partagez le lien de votre boutique</h2>
              <p className="mt-2 break-all rounded-lg bg-slate-100 px-3 py-2 text-sm font-mono text-slate-800">{lien}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={copier}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  {copie ? "Lien copié ✓" : "Copier le lien"}
                </button>
                <a href={msgPartage} target="_blank" rel="noopener noreferrer"
                   className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600">
                  Partager sur WhatsApp
                </a>
                <a href={lien} target="_blank" rel="noopener noreferrer"
                   className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  Voir ma boutique
                </a>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Votre boutique sera plus convaincante avec des produits : ajoutez-en quelques-uns avant de la partager.
              </p>
            </li>
          </ol>

          <p className="mt-8 text-center text-sm text-slate-500">
            Besoin d&apos;aide ?{" "}
            <a href={msgAide} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-600 underline">Écrivez-nous sur WhatsApp</a>
            {" · "}
            <button type="button" onClick={recommencer} className="underline">Créer une autre boutique</button>
          </p>
        </div>
      </main>
    )
  }

  // =====================  ETAPE 1 : FORMULAIRE  =====================
  const champ = "mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-[var(--c-main)] focus:ring-2 focus:ring-[var(--c-accent)]"
  const msgErr = (k: string) => erreurs[k] && <p className="mt-1 text-sm text-red-600">{erreurs[k]}</p>

  return (
    <main className="min-h-screen bg-[var(--c-soft)] px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800">← Retour</Link>
        <h1 className="titre mt-4 text-3xl font-black text-slate-900">Créez votre boutique</h1>
        <p className="mt-1 text-slate-600">4 informations, 2 minutes.</p>

        <form onSubmit={envoyer} noValidate className="mt-6 space-y-5 rounded-2xl bg-white p-6 border border-slate-200">
          <div>
            <label htmlFor="nom" className="text-sm font-bold text-slate-800">Nom de votre boutique</label>
            <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Sokhna Cosmétiques"
                   className={champ} autoComplete="organization" />
            {msgErr("raison_sociale")}
            {verif?.slug && !erreurs.raison_sociale && (
              <p className="mt-1 text-xs text-slate-500">
                Votre adresse : <strong className="text-slate-800">/{verif.slug}</strong>
                {verif.nom_pris && <span className="text-red-600"> · ce nom existe déjà, choisissez-en un autre</span>}
                {!verif.nom_pris && verif.adresse_modifiee && <span> (adresse déjà prise, une variante vous est attribuée)</span>}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="wa" className="text-sm font-bold text-slate-800">Votre numéro WhatsApp</label>
            <div className="mt-1 flex">
              <span className="flex items-center rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 px-3 text-sm text-slate-600">+221</span>
              <input id="wa" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="77 123 45 67"
                     inputMode="tel" autoComplete="tel" className={champ.replace("mt-1 ", "").replace("rounded-xl", "rounded-r-xl")} />
            </div>
            <p className="mt-1 text-xs text-slate-500">C&apos;est là que vous recevrez les commandes.</p>
            {msgErr("contact_whatsapp")}{msgErr("phone")}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-bold text-slate-800">E-mail</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com"
                   autoComplete="email" className={champ} />
            {msgErr("email")}
          </div>

          <div>
            <label htmlFor="mdp" className="text-sm font-bold text-slate-800">Mot de passe</label>
            <div className="relative">
              <input id="mdp" type={voirMdp ? "text" : "password"} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
                     placeholder="6 caractères minimum" autoComplete="new-password" className={champ + " pr-24"} />
              <button type="button" onClick={() => setVoirMdp(!voirMdp)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--c-dark)]">
                {voirMdp ? "Masquer" : "Afficher"}
              </button>
            </div>
            {msgErr("password")}
          </div>

          {erreurGenerale && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{erreurGenerale}</p>}

          <button type="submit" disabled={envoi}
                  className="w-full rounded-xl bg-[var(--c-main)] py-3.5 font-bold text-[var(--c-dark)] hover:brightness-95 disabled:opacity-60">
            {envoi ? "Création en cours…" : "Créer ma boutique"}
          </button>
          <p className="text-center text-xs text-slate-500">
            Déjà un compte ? <a href={`${API_URL}/admin/login`} className="font-bold text-[var(--c-dark)] underline">Se connecter</a>
          </p>
        </form>
      </div>
    </main>
  )
}
