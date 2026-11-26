// Page d'accueil (landing). Composant SERVEUR : pas de "use client", donc rapide et bien référencée.
// Textes, prix, packs : src/lib/landing.ts  |  Couleurs, boutons, animations : src/app/landing.css
// Polices : src/lib/police.ts
import type { Metadata } from "next"
import Link from "next/link"
import "./landing.css"
import { police, titres } from "../lib/police"
import {
  Storefront, DeviceMobile, BellRinging, CashRegister, Package, LinkSimple, ChartLineUp, Handshake,
} from "@phosphor-icons/react/dist/ssr"
import Reveal from "../components/landing/Reveal"
import MenuMobile from "../components/landing/MenuMobile"
import ApercuTelephone from "../components/landing/ApercuTelephone"
import ChampBoutique from "../components/landing/ChampBoutique"
import Fragment from "../components/landing/FragmentsInterface"
import {
  API_URL, MARQUE, BOUTIQUE_EXEMPLE, SUPPORT_WHATSAPP, SUPPORT_TELEPHONES, ENTREPRISE, MENU,
  PACKS, INCLUS, NOTE_DOMAINE, BOUTIQUES_MONTREES, PUBLICS, ETAPES, AVANTAGES,
  LIMITE_TITRE, LIMITE_TEXTE, QUESTIONS, EXEMPLES_PRODUITS, lienWhatsapp, fcfa, calculPack,
} from "../lib/landing"

export const metadata: Metadata = {
  title: `${MARQUE} – Créez votre boutique en ligne et vendez sur WhatsApp`,
  description:
    "Créez votre boutique en ligne en 2 minutes, partagez le lien sur WhatsApp, Facebook ou TikTok et recevez vos commandes sur WhatsApp. Paiement Wave, Orange Money ou espèces.",
}

// Les icônes : Phosphor, style « bold » (trait épais). Les clés ("boutique", "caisse"...) sont celles de landing.ts.
// Pour changer une icône : remplace le composant ici (catalogue : https://phosphoricons.com).
const ICONES: Record<string, React.ElementType> = {
  boutique: Storefront, telephone: DeviceMobile, notification: BellRinging, caisse: CashRegister,
  stock: Package, lien: LinkSimple, statistiques: ChartLineUp, confiance: Handshake,
}

// Pastille ronde colorée qui contient une icône. "teinte" 0..3 choisit la couleur dans PASTILLES.
const PASTILLES = [
  { fond: "var(--c-main)", icone: "var(--c-dark)" },
  { fond: "var(--c-teal)", icone: "var(--c-soft)" },
  { fond: "var(--c-accent)", icone: "var(--c-dark)" },
  { fond: "var(--c-dark)", icone: "var(--c-soft)" },
]
function Pastille({ nom, teinte, taille = 56 }: { nom?: string; teinte: number; taille?: number }) {
  const Icone = nom ? ICONES[nom] : undefined
  if (!Icone) return null
  const c = PASTILLES[teinte % PASTILLES.length]
  return (
    <div className="flex items-center justify-center rounded-full" style={{ width: taille, height: taille, background: c.fond }} aria-hidden="true">
      <Icone size={Math.round(taille * 0.5)} weight="bold" color={c.icone} />
    </div>
  )
}

// Couleur du bandeau de chaque carte « fonctionnalité » (répétées dans l'ordre)
const BANDEAUX = ["var(--c-main)", "var(--c-teal)", "var(--c-accent)", "var(--c-dark)"]

// Petit titre coloré au-dessus de chaque grand titre
function Surtitre({ children }: { children: React.ReactNode }) {
  return <span className="mb-3 block text-sm font-bold text-[var(--c-teal)]">{children}</span>
}

export default function Accueil() {
  const msgSupport = lienWhatsapp(SUPPORT_WHATSAPP, "Bonjour, je voudrais créer ma boutique avec DiayRek.")

  return (
    <main className={`${police.className} ${titres.variable} bg-[var(--c-soft)] text-[var(--c-dark)]`}>
      {/* ---------- BARRE DU HAUT ---------- */}
      <header className="sticky top-0 z-40 border-b border-[var(--c-soft2)] bg-[var(--c-soft)]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="titre flex items-center gap-2 text-xl font-bold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icon.png" alt="" className="h-8 w-8 rounded-lg" />
            {MARQUE}
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            {MENU.map((m) => <a key={m.href} href={m.href} className="opacity-75 hover:opacity-100">{m.label}</a>)}
            <a href={`${API_URL}/admin/login`} className="opacity-75 hover:opacity-100">Se connecter</a>
            <Link href="/inscription" className="btn btn-corail text-sm" style={{ padding: "8px 20px" }}>Créer ma boutique</Link>
          </nav>
          <MenuMobile liens={[...MENU, { label: "Se connecter", href: `${API_URL}/admin/login` }, { label: "Créer ma boutique", href: "/inscription" }]} />
        </div>
      </header>

      {/* ---------- 1. HERO (fond foncé) ---------- */}
      <section className="overflow-hidden bg-[var(--c-dark)] text-[var(--c-soft)]">
        <div className="frange" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-12 pt-14 sm:pt-20 md:grid-cols-2">
          <div>
            <span className="entree mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[var(--c-ink2)] px-4 py-1.5 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-[var(--c-accent)]" aria-hidden="true" />
              Boutique en ligne + commandes WhatsApp
            </span>
            <h1 className="entree titre text-5xl font-semibold leading-[1.05] sm:text-6xl">
              Votre boutique en ligne.{" "}
              <span className="text-[var(--c-accent)]">Vos commandes sur WhatsApp.</span>
            </h1>
            <p className="entree-2 mt-6 max-w-xl text-lg opacity-85 sm:text-xl">
              Créez votre boutique en 2 minutes, partagez le lien sur WhatsApp, Facebook ou TikTok.
              Vos clients commandent, vous recevez tout dans WhatsApp.
            </p>
            <div className="entree-3 mt-9">
              <ChampBoutique />
              {BOUTIQUE_EXEMPLE && (
                <Link href={`/${BOUTIQUE_EXEMPLE}`} className="mt-4 inline-block text-sm font-bold text-[var(--c-accent)] underline underline-offset-4">
                  Voir une boutique exemple →
                </Link>
              )}
            </div>
          </div>
          <ApercuTelephone />
        </div>

        {/* bande de produits qui défile (illustration) */}
        <div className="pb-12" aria-hidden="true">
          <div className="defile gap-3">
            {[...EXEMPLES_PRODUITS, ...EXEMPLES_PRODUITS].map((nom, i) => (
              <span key={i} className="flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold">
                {/* petit losange de couleur (couleurs de la marque, dans l'ordre) */}
                <span className="inline-block h-2 w-2 rotate-45" style={{ background: BANDEAUX[i % BANDEAUX.length] }} />
                {nom}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 2. PAIEMENTS ---------- */}
      <section className="bg-[var(--c-ink2)] text-[var(--c-soft)]">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <p className="text-sm font-bold">
            Vos clients paient comme d&apos;habitude : <span className="text-[var(--c-accent)]">Wave · Orange Money · Espèces à la livraison</span>
          </p>
          <p className="mt-1 text-xs opacity-70">Le paiement se règle directement entre vous et votre client.</p>
        </div>
      </section>

      {/* ---------- 3. POUR QUI ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mb-12 max-w-2xl">
          <Surtitre>Pour qui ?</Surtitre>
          <h2 className="titre text-4xl font-semibold leading-tight sm:text-5xl">Que vous ayez un comptoir ou seulement un téléphone</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          {PUBLICS.map((p, i) => (
            <Reveal key={p.titre} delay={i * 120} className="carte-hover rounded-3xl border border-[var(--c-dark)]/15 bg-white p-8">
              <Pastille nom={p.icone} teinte={i === 0 ? 0 : 2} taille={64} />
              <h3 className="titre mt-5 text-2xl font-semibold">{p.titre}</h3>
              <p className="mt-3 opacity-80">{p.texte}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- 4. ÉTAPES ---------- */}
      <section id="comment" className="bg-[var(--c-soft2)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <Reveal className="mb-14 max-w-2xl">
            <Surtitre>Comment ça marche</Surtitre>
            <h2 className="titre text-4xl font-semibold leading-tight sm:text-5xl">Trois étapes entre votre idée et votre première commande</h2>
          </Reveal>
          <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            {/* ligne pointillée qui relie les ronds (grand écran) */}
            <div className="absolute left-[6%] right-[6%] top-6 hidden border-t-2 border-dashed border-[var(--c-dark)]/25 md:block" aria-hidden="true" />
            {ETAPES.map((e, i) => (
              <Reveal key={e.titre} delay={i * 120} className="relative">
                <div className="titre relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--c-dark)] text-lg text-[var(--c-soft)]">{i + 1}</div>
                <h3 className="titre mt-5 text-2xl font-semibold">{e.titre}</h3>
                <p className="mt-2 opacity-80">{e.texte}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 5. FONCTIONNALITÉS ---------- */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mb-12 max-w-2xl">
          <Surtitre>Fonctionnalités</Surtitre>
          <h2 className="titre text-4xl font-semibold leading-tight sm:text-5xl">Tout ce qu&apos;il faut pour tenir boutique</h2>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AVANTAGES.map((a, i) => (
            <Reveal key={a.titre} delay={(i % 3) * 100} className="carte-hover overflow-hidden rounded-xl border border-[var(--c-dark)]/15 bg-[var(--c-soft)]">
              <div className="h-3" style={{ background: BANDEAUX[i % BANDEAUX.length] }} aria-hidden="true" />
              <div className="p-7">
                <Pastille nom={a.icone} teinte={i} />
                <h3 className="titre mt-5 text-xl font-semibold">{a.titre}</h3>
                <p className="mt-2 text-[0.95rem] opacity-80">{a.texte}</p>
                {a.fragment && <Fragment type={a.fragment} />}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Honnêteté : ce qu'aucune publicité ne garantit */}
        <Reveal className="mt-8 rounded-3xl border-2 border-dashed border-[var(--c-accent)] bg-white p-7">
          <h3 className="titre text-xl font-semibold">{LIMITE_TITRE}</h3>
          <p className="mt-2 opacity-85">{LIMITE_TEXTE}</p>
        </Reveal>
      </section>

      {/* ---------- 6. GALERIE (cachée tant qu'il n'y a pas de vraies boutiques dans landing.ts) ---------- */}
      {BOUTIQUES_MONTREES.length > 0 && (
        <section className="pb-20">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal className="mb-10 max-w-2xl">
              <Surtitre>Exemples</Surtitre>
              <h2 className="titre text-4xl font-semibold leading-tight sm:text-5xl">Des boutiques déjà en ligne</h2>
            </Reveal>
          </div>
          <div className="mx-auto flex max-w-6xl snap-x gap-5 overflow-x-auto px-4 pb-4">
            {BOUTIQUES_MONTREES.map((b) => (
              <Link key={b.slug} href={`/${b.slug}`}
                    className="carte-hover flex min-h-[280px] w-[78%] shrink-0 snap-start flex-col justify-between rounded-3xl p-6 text-white sm:w-80"
                    style={{ background: `linear-gradient(160deg, ${b.couleurs[0]}, ${b.couleurs[1]})` }}>
                <span className="self-start rounded-full bg-black/25 px-3 py-1 text-xs font-bold">{b.categorie}</span>
                <div>
                  <h3 className="titre text-2xl font-semibold">{b.nom}</h3>
                  <p className="mt-2 text-sm opacity-90">{b.description}</p>
                  <p className="mt-4 text-sm font-bold underline underline-offset-4">Voir la boutique →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- 7. TARIFS ---------- */}
      <section id="tarifs" className="bg-[var(--c-soft2)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <Reveal className="mb-12 max-w-2xl">
            <Surtitre>Tarifs</Surtitre>
            <h2 className="titre text-4xl font-semibold leading-tight sm:text-5xl">Un abonnement simple : choisissez la durée qui vous convient</h2>
            <p className="mt-4 opacity-80">Plus la durée est longue, plus la mensualité est basse. Vous réglez un premier versement (quelques mensualités d&apos;avance), puis le reste mois par mois.</p>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-3">
            {PACKS.map((p, i) => {
              const c = calculPack(p)
              const sombre = p.vedette
              const msg = lienWhatsapp(SUPPORT_WHATSAPP, `Bonjour, je souhaite souscrire au pack ${p.nom} (${p.duree} mois).`)
              return (
                <Reveal key={p.nom} delay={i * 120}
                        className={`flex flex-col rounded-3xl p-8 ${sombre ? "bg-[var(--c-dark)] text-[var(--c-soft)]" : "border-2 border-[var(--c-dark)]/15 bg-[var(--c-soft)]"}`}>
                  <p className={`text-sm font-bold ${sombre ? "text-[var(--c-accent)]" : "text-[var(--c-teal)]"}`}>{p.accroche}</p>
                  <h3 className="titre mt-2 text-2xl font-semibold">{p.nom}</h3>
                  <p className="titre mt-5 text-5xl font-semibold">
                    {fcfa(p.mensualite)} F<span className="text-base font-medium opacity-70"> / mois</span>
                  </p>
                  <p className="mt-2 text-sm opacity-75">Pack de {p.duree} mois · {fcfa(c.total)} F au total</p>

                  <div className={`mt-6 rounded-2xl p-4 text-sm ${sombre ? "bg-[var(--c-ink2)]" : "bg-white"}`}>
                    <p><strong>1er versement : {fcfa(c.premierVersement)} F</strong> ({p.moisAvance} mois d&apos;avance)</p>
                    {c.moisRestants > 0 && <p className="mt-1 opacity-80">Puis {c.moisRestants} × {fcfa(p.mensualite)} F</p>}
                  </div>

                  <a href={msg} target="_blank" rel="noopener noreferrer"
                     className={`btn mt-7 ${sombre ? "btn-safran" : "btn-corail"}`}>
                    Choisir ce pack
                  </a>
                </Reveal>
              )
            })}
          </div>

          {/* ce qui est compris dans tous les packs */}
          <Reveal className="mt-10 rounded-3xl bg-white p-8">
            <h3 className="titre text-xl font-semibold">Inclus dans tous les packs</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {INCLUS.map((t) => (
                <li key={t} className="flex gap-3 text-[0.95rem]">
                  <span className="mt-0.5 font-extrabold text-[var(--c-teal)]" aria-hidden="true">✓</span>{t}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-[var(--c-dark)]/10 pt-4 text-sm opacity-75">{NOTE_DOMAINE}</p>
          </Reveal>
        </div>
      </section>

      {/* ---------- 8. QUESTIONS ---------- */}
      <section id="questions" className="mx-auto max-w-3xl px-4 py-20">
        <Reveal className="mb-10 text-center">
          <Surtitre>Questions fréquentes</Surtitre>
          <h2 className="titre text-4xl font-semibold sm:text-5xl">Vous vous demandez peut-être…</h2>
        </Reveal>
        <Reveal className="divide-y divide-[var(--c-dark)]/10 rounded-3xl border border-[var(--c-dark)]/15 bg-white">
          {QUESTIONS.map((q) => (
            <details key={q.question} className="group p-5">
              <summary className="flex cursor-pointer list-none justify-between gap-4 font-bold">
                {q.question}
                <span className="text-[var(--c-main)] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 opacity-80">{q.reponse}</p>
            </details>
          ))}
        </Reveal>
      </section>

      {/* ---------- 9. APPEL FINAL ---------- */}
      <section className="bg-[var(--c-dark)] text-[var(--c-soft)]">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h2 className="titre text-4xl font-semibold sm:text-6xl">Votre boutique vous attend.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg opacity-80">Créez-la en 2 minutes, ou écrivez-nous : nous la créons avec vous.</p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/inscription" className="btn btn-safran">Créer ma boutique</Link>
            <a href={msgSupport} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">Discuter sur WhatsApp</a>
          </div>
        </div>
      </section>

      {/* ---------- 10. PIED DE PAGE ---------- */}
      <footer className="bg-[var(--c-ink2)] text-[var(--c-soft)]">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col justify-between gap-8 border-b border-white/15 pb-8 md:flex-row">
            <div>
              <p className="titre text-2xl font-bold">{MARQUE}</p>
              <p className="mt-3 flex flex-col gap-1 text-sm opacity-80">
                {SUPPORT_TELEPHONES.map((t) => <a key={t.lien} href={`tel:${t.lien}`} className="hover:opacity-100">{t.affichage}</a>)}
              </p>
            </div>
            <nav className="flex flex-wrap content-start gap-x-7 gap-y-2 text-sm opacity-80">
              {MENU.map((m) => <a key={m.href} href={m.href} className="hover:opacity-100">{m.label}</a>)}
              <a href={`${API_URL}/admin/login`} className="hover:opacity-100">Se connecter</a>
              <a href={msgSupport} target="_blank" rel="noopener noreferrer" className="hover:opacity-100">Aide</a>
            </nav>
          </div>
          <div className="flex flex-col justify-between gap-2 pt-6 text-xs opacity-60 md:flex-row">
            <span>© {new Date().getFullYear()} {MARQUE} · {ENTREPRISE.nom}</span>
            <span>{ENTREPRISE.adresse} · NINEA {ENTREPRISE.ninea} · RCCM {ENTREPRISE.rccm}</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
