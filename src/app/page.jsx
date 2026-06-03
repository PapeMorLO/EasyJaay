"use client"

import { useState } from "react"
import { 
  Rocket, 
  Sparkles, 

  ArrowRight, 
  Palette, 
 
  TrendingUp, 
  Store,
  ShieldCheck,
  Smartphone,

  Loader2,
  Settings,
  Eye
} from "lucide-react"

// URL de ton Laragon locale
const BASE_URL = "http://ecommerce.test:8034"

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [raisonSociale, setRaisonSociale] = useState("")
  const [slug, setSlug] = useState("")
  const [contactCall, setContactCall] = useState("")
  const [contactWhatsapp, setContactWhatsapp] = useState("")
  
  // Paramètres administrateur pour la connexion Filament
  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  
  // États d'envoi et de succès
  const [submitting, setSubmitting] = useState(false)
  const [successData, setSuccessData] = useState<{
    shopUrl: string, 
    adminUrl: string
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleRaisonSocialeChange = (value) => {
    setRaisonSociale(value)
    // Convertit "Sokhna Cosmétiques" en "sokhna-cosmetiques"
    const generatedSlug = value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Nettoyage et correction de la Regex des accents
    .replace(/[^a-z0-9 -]/g, "") // Supprime les caractères spéciaux
    .replace(/\s+/g, "-") // Remplace les espaces par des tirets
    .replace(/-+/g, "-") // Supprime les tirets doublons
    setSlug(generatedSlug)


  }

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    const payload = {
      raison_sociale: raisonSociale,
      slug: slug,
      phone: contactCall,
      contact_whatsapp: contactWhatsapp,
      name: adminName,
      email: adminEmail,
      password: adminPassword
    }

    try {
      const res = await fetch(`${BASE_URL}/api/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la création de la boutique.")
      }

      // Succès : Enregistrement des liens d'accès dynamiques
      setSuccessData({
        shopUrl: `/${slug}`,
        adminUrl: `${BASE_URL}/admin/login`
      })

    } catch {
      console.error(err)
      setErrorMessage(err.message || "Une erreur technique s'est produite.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-chariow antialiased selection:bg-teal-100">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .font-chariow {
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif !important;
        }
      `}} />

      {/* Navigation Header */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-600 text-white font-black text-xl shadow-md shadow-teal-100">
              Ej
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-950">Easy <span className="text-teal-600 font-bold">Jaay</span></span>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl font-extrabold text-sm text-white bg-slate-950 hover:bg-slate-900 transition active:scale-95 shadow-sm"
          >
            Lancer ma boutique
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-radial-at-t from-teal-50 via-slate-50 to-slate-50" />
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 font-extrabold text-xs uppercase tracking-wider animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
             E-commerce locale
          </span>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto">
            Vendez sur le web. <br />
            Livrables et gérés par <span className="text-teal-600">WhatsApp</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Créez votre boutique en ligne personnalisée en 30 secondes. Publiez vos produits, gérez vos stocks et recevez vos commandes directement sur votre téléphone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-lg shadow-teal-100 transition active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Créer ma boutique maintenant</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-2xl transition flex items-center justify-center"
            >
              En savoir plus
            </a>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      {}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-100">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-black text-slate-950 tracking-tight">Pourquoi nous faire confiance ?</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto">Tout le nécessaire pour propulser votre business et professionnaliser vos ventes.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">100% Mobile & WhatsApp</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Vos clients commandent d'un simple clic sur leur mobile. Le récapitulatif complet de la commande arrive pré-rempli dans votre boîte WhatsApp.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
              <Palette className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Thème Personnalisable</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Gérez votre marque avec soin. Changez la couleur de votre site, votre logo et vos bannières directement depuis votre espace d'administration.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Gestion de Stock & API</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Suivi réel des quantités en temps réel. Notre backend décrémente automatiquement le stock physique à chaque commande confirmée.
            </p>
          </div>
        </div>
      </section>

      {/* Onboarding Modal */}
      {}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh] relative space-y-6 animate-fade-in">
            
            <button 
              onClick={() => {
                setIsModalOpen(false)
                setSuccessData(null)
                setErrorMessage(null)
              }}
              className="absolute top-6 right-6 h-10 w-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              ✕
            </button>

            {!successData ? (
              <form onSubmit={handleOnboardingSubmit} className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-950 flex items-center gap-2">
                    <Store className="h-6 w-6 text-teal-600" />
                    Créer ma boutique
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">Configurez votre identité commerciale en quelques secondes.</p>
                </div>

                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Données de la boutique</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nom commercial (Raison sociale)</label>
                    <input 
                      type="text"
                      placeholder="Ex: Sokhna Cosmétiques"
                      required
                      value={raisonSociale}
                      onChange={(e) => handleRaisonSocialeChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Adresse URL de la boutique (Générée automatiquement)</label>
                    <div className="flex rounded-2xl overflow-hidden border border-slate-200">
                      <span className="bg-slate-100 text-slate-500 px-4 py-3 text-xs md:text-sm font-mono flex items-center">
                        easyjaay.com/
                      </span>
                      <input 
                        type="text"
                        required
                        readOnly
                        value={slug}
                        className="w-full px-4 py-3 bg-slate-50 font-mono text-sm text-teal-700 font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Téléphone appel</label>
                      <input 
                        type="tel"
                        placeholder="Ex: 77 123 45 67"
                        required
                        value={contactCall}
                        onChange={(e) => setContactCall(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Numéro WhatsApp</label>
                      <input 
                        type="tel"
                        placeholder="Ex: 221771234567"
                        required
                        value={contactWhatsapp}
                        onChange={(e) => setContactWhatsapp(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Création du compte administrateur</h4>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nom complet de l'admin</label>
                    <input 
                      type="text"
                      placeholder="Ex: Sokhna Diop"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">E-mail</label>
                      <input 
                        type="email"
                        placeholder="admin@sokhna.sn"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Mot de passe</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl text-white bg-teal-600 hover:bg-teal-700 font-extrabold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Valider & Générer ma boutique</span>
                      <Rocket className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-6 animate-fade-in">
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-950">Félicitations, boutique prête !</h3>
                  <p className="text-slate-500 text-sm font-medium">Votre boutique en ligne a été générée avec succès.</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-semibold max-w-sm mx-auto">
                  🎉 Vos accès administrateur ont été créés.
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <a 
                    href={successData.shopUrl}
                    target="_blank"
                    className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50/20 transition flex flex-col items-center gap-3 text-center group"
                  >
                    <Eye className="h-6 w-6 text-teal-600" />
                    <span className="font-extrabold text-sm text-slate-800">Voir ma vitrine</span>
                    <span className="text-xs text-slate-400 font-mono">/{slug}</span>
                  </a>

                  <a 
                    href={successData.adminUrl}
                    target="_blank"
                    className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50/20 transition flex flex-col items-center gap-3 text-center group"
                  >
                    <Settings className="h-6 w-6 text-teal-600" />
                    <span className="font-extrabold text-sm text-slate-800">Espace admin</span>
                    <span className="text-xs text-slate-400 font-mono">Filament</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}