"use client"

import { useState, useEffect } from "react"
import { 
  ShoppingBag, 
  Bell, 
  Sparkles, 
  Plus, 
  Minus, 
  Trash2, 
  Clock, 
  MapPin, 
  MessageCircle,
  TriangleAlert
} from "lucide-react"

// URL de votre serveur de production ou local
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://easyjaayback.baobapp.tech";

// Formateur de prix global
function numberFormat(number) {
  if (number === undefined || number === null) return "0"
  return new Intl.NumberFormat('fr-FR').format(number)
}

// Fonction de résolution intelligente pour la galerie d'images du modal
function getAllImageUrls(imagePath, baseUrl) {
  if (!imagePath) {
    return ["https://placehold.co/600x600?text=Sans+photo"]
  }

  const paths = Array.isArray(imagePath) ? imagePath : [imagePath]
  
  if (paths.length === 0) {
    return ["https://placehold.co/600x600?text=Sans+photo"]
  }

  return paths.map(path => {
    if (typeof path !== "string") {
      return "https://placehold.co/600x600?text=Sans+photo"
    }
    
    // Si c'est déjà une URL absolue/externe
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path
    }

    // Reconstruction du stockage local public
    if (path.startsWith("/storage/")) {
      return `${baseUrl}${path}`
    }
    if (path.startsWith("storage/")) {
      return `${baseUrl}/${path}`
    }

    return `${baseUrl}/storage/${path}`
  })
}

// Fonction pour l'image principale
function getImageUrl(imagePath, baseUrl) {
  const allUrls = getAllImageUrls(imagePath, baseUrl)
  return allUrls[0]
}

export default function StorefrontPage({ params }) {
  const [tenant, setTenant] = useState("")
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Filtre actif: 'all' | 'instock' | 'promo'
  const [activeFilter, setActiveFilter] = useState('all')
  
  // État du modal de détails produit
  const [selectedProduct, setSelectedProduct] = useState(null)

  // États du checkout
  const [nomClient, setNomClient] = useState("")
  const [phoneClient, setPhoneClient] = useState("")
  const [adresse, setAdresse] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Résolution sécurisée de la promesse params exigée par Next.js 15
  useEffect(() => {
    if (!params) return

    if (typeof params.then === "function" || params instanceof Promise) {
      Promise.resolve(params).then((resolved) => {
        if (resolved && resolved.tenant) {
          setTenant(resolved.tenant)
        }
      }).catch((err) => {
        console.error("Error resolving params promise:", err)
      })
    } else if (params.tenant) {
      setTenant(params.tenant)
    }
  }, [params])

  useEffect(() => {
    async function fetchShop() {
      try {
        const res = await fetch(`${BASE_URL}/api/shops/${tenant}`, {
          cache: "no-store",
        })

        if (!res.ok) throw new Error("Server returned an error")

        const data = await res.json()
        
        let normalizedShop = null

        // Prise en charge des différentes enveloppes d'API
        if (data && data.shop) {
          normalizedShop = {
            raison_sociale: data.shop.raison_sociale || data.shop.nom || "Ma Boutique",
            couleur_theme: data.shop.couleur_theme || data.shop.theme || "#10b981",
            contact_whatsapp: data.shop.contact_whatsapp || data.shop.whatsapp || "",
            logo: data.shop.logo || data.logo || null,
            produits: data.produits || data.shop.produits || []
          }
        } else if (data && data.data) {
          normalizedShop = {
            raison_sociale: data.data.raison_sociale || data.data.nom || "Ma Boutique",
            couleur_theme: data.data.couleur_theme || data.data.theme || "#10b981",
            contact_whatsapp: data.data.contact_whatsapp || data.data.whatsapp || "",
            logo: data.data.logo || data.logo || null,
            produits: data.data.produits || data.data.products || []
          }
        } else if (data) {
          normalizedShop = {
            raison_sociale: data.raison_sociale || data.nom || "Ma Boutique",
            couleur_theme: data.couleur_theme || data.theme || "#10b981",
            contact_whatsapp: data.contact_whatsapp || data.whatsapp || "",
            logo: data.logo || null,
            produits: data.produits || data.products || []
          }
        }

        setShop(normalizedShop)

        // Récupération du panier local
        const savedCart = localStorage.getItem(`cart_${tenant}`)
        if (savedCart) {
          setCart(JSON.parse(savedCart))
        }

      } catch (error) {
        console.error("Next.js Fetch Error:", error)
      } finally {
        setLoading(false)
      }
    }

    if (tenant) {
      fetchShop()
    }
  }, [tenant])

  useEffect(() => {
    if (tenant && shop) {
      localStorage.setItem(`cart_${tenant}`, JSON.stringify(cart))
    }
  }, [cart, tenant, shop])

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  if (loading || !tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-15"></span>
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-950 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 text-center">
        <div className="text-6xl mb-4 animate-bounce">🏪</div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Oups ! Boutique introuvable</h1>
        <p className="text-slate-500 max-w-md">
          L&apos;adresse <code className="bg-slate-200 px-2 py-1 rounded text-red-600 font-mono text-sm">{tenant}</code> n&apos;est pas active ou est incorrecte.
        </p>
      </div>
    )
  }

  const resolvedShopName = shop.raison_sociale
  const brandColor = shop.couleur_theme
  const resolvedWhatsapp = shop.contact_whatsapp
  const resolvedProducts = shop.produits
  const resolvedLogo = shop.logo

  // Parser les options JSON reçues de la BDD pour vérifier la présence d'attributs
  const parseOption = (optionField) => {
    if (!optionField) return []
    if (Array.isArray(optionField)) return optionField
    try {
      return JSON.parse(optionField)
    } catch (e) {
      if (typeof optionField === 'string') {
        return optionField.split(',').map(item => item.trim()).filter(Boolean)
      }
    }
    return []
  }

  const addToCart = (product) => {
    const availableSizes = parseOption(product.taille_dimension)
    const availableColors = parseOption(product.color)

    // S'il y a des options (couleurs ou tailles) et que l'utilisateur clique sur l'ajout rapide (+),
    // on ouvre le modal de détails pour qu'il choisisse obligatoirement ses options
    if ((availableSizes.length > 0 && !product.selectedSize) || (availableColors.length > 0 && !product.selectedColor)) {
      setSelectedProduct(product)
      return
    }

    // Clé unique pour différencier le même produit mais avec des tailles/couleurs différentes dans le panier
    const cartItemId = `${product.id}-${product.selectedSize || ""}-${product.selectedColor || ""}`

    const existing = cart.find((item) => {
      const itemKey = `${item.product.id}-${item.product.selectedSize || ""}-${item.product.selectedColor || ""}`
      return itemKey === cartItemId
    })

    if (existing && existing.quantity >= product.quantite_stock) {
      showToast("Limite de stock disponible atteinte.")
      return
    }

    setCart((prev) => {
      if (existing) {
        return prev.map((item) => {
          const itemKey = `${item.product.id}-${item.product.selectedSize || ""}-${item.product.selectedColor || ""}`
          return itemKey === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        })
      }
      return [...prev, { product, quantity: 1 }]
    })
    setIsCartOpen(true)
  }

  const updateQuantity = (productId, selectedSize = "", selectedColor = "", delta) => {
    const targetKey = `${productId}-${selectedSize}-${selectedColor}`
    setCart((prev) =>
      prev
        .map((item) => {
          const itemKey = `${item.product.id}-${item.product.selectedSize || ""}-${item.product.selectedColor || ""}`
          if (itemKey === targetKey) {
            const nextQty = item.quantity + delta
            if (nextQty <= 0) return null
            if (nextQty > item.product.quantite_stock) {
              showToast("Stock insuffisant pour cette quantité.")
              return item
            }
            return { ...item, quantity: nextQty }
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const removeFromCart = (productId, selectedSize = "", selectedColor = "") => {
    const targetKey = `${productId}-${selectedSize}-${selectedColor}`
    setCart((prev) => prev.filter((item) => {
      const itemKey = `${item.product.id}-${item.product.selectedSize || ""}-${item.product.selectedColor || ""}`
      return itemKey !== targetKey
    }))
  }

  const montantTotal = cart.reduce((total, item) => total + item.product.prix_vente * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const getFilteredProducts = () => {
    switch (activeFilter) {
      case "instock":
        return resolvedProducts.filter((p) => p.quantite_stock > 0)
      case "promo":
        return resolvedProducts.filter((p) => p.quantite_stock > 0 && p.quantite_stock <= 5)
      case "all":
      default:
        return resolvedProducts
    }
  }

  const filteredProducts = getFilteredProducts()

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (cart.length === 0 || submitting) return

    if (!resolvedWhatsapp) {
      showToast("Numéro WhatsApp non configuré pour cette boutique.")
      return
    }

    setSubmitting(true)

    // Envoi de la commande vers Laravel API
    const payload = {
      entreprise_slug: tenant,
      nom_client: nomClient,
      phone_client: phoneClient,
      adresse_livraison: adresse,
      montant_total: montantTotal,
      produits: cart.map((item) => ({
        id: item.product.id,
        quantite: item.quantity,
        prix_unitaire: item.product.prix_vente,
        // On passe les options choisies dans la commande si votre API Laravel s'adapte à les stocker
        selected_size: item.product.selectedSize || null,
        selected_color: item.product.selectedColor || null,
      })),
    }

    try {
      const res = await fetch(`${BASE_URL}/api/commandes`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.warn("Local DB storage bypassed. Proceeding to WhatsApp directly:", err)
        return null
      })

      if (res && !res.ok) {
        console.warn("Laravel server returned an error, proceeding directly to WhatsApp checkout.")
      }

      // Construction du message WhatsApp dynamique avec intégration des Tailles et Couleurs
      let messageText = `*Nouvelle commande sur la boutique ${resolvedShopName}*\n\n`
      messageText += `👤 *Client :* ${nomClient}\n`
      messageText += `📞 *Téléphone :* ${phoneClient}\n`
      messageText += `📍 *Livraison :* ${adresse}\n\n`
      messageText += `🛒 *Articles commandés :*\n`
      
      cart.forEach((item) => {
        const optionDetails = []
        if (item.product.selectedSize) optionDetails.push(`Taille: ${item.product.selectedSize}`)
        if (item.product.selectedColor) optionDetails.push(`Couleur: ${item.product.selectedColor}`)
        
        const optionString = optionDetails.length > 0 ? ` [${optionDetails.join(", ")}]` : ""
        
        messageText += `- *${item.quantity}x* ${item.product.designation}${optionString} (${numberFormat(item.product.prix_vente * item.quantity)} FCFA)\n`
      })
      
      messageText += `\n💵 *TOTAL : ${numberFormat(montantTotal)} FCFA*`

      const formattedWhatsapp = resolvedWhatsapp.replace(/\D/g, "")
      const urlWhatsApp = `https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent(messageText)}`
      
      window.open(urlWhatsApp, "_blank")

      setCart([])
      localStorage.removeItem(`cart_${tenant}`)
      setIsCartOpen(false)
      setNomClient("")
      setPhoneClient("")
      setAdresse("")
      showToast("Commande validée ! Redirection vers WhatsApp...")

    } catch (err) {
      console.error("Global order workflow crashed:", err)
      showToast("Une erreur est survenue, veuillez réessayer.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-0 selection:bg-slate-200 antialiased font-sans relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        :root {
          --font-chariow-sans: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
        }

        body, button, input, textarea {
          font-family: var(--font-chariow-sans) !important;
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-semibold px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-3 animate-bounce">
          <Bell className="h-4 w-4 text-white" />
          {toastMessage}
        </div>
      )}

      {/* 1. COMPOSANT : HEADER */}
      <Header 
        shopName={resolvedShopName} 
        cartCount={cartCount} 
        brandColor={brandColor}
        logo={resolvedLogo}
        onCartClick={() => setIsCartOpen(true)} 
      />

      {/* 2. COMPOSANT : HERO CAROUSEL */}
      <HeroCarousel 
        products={resolvedProducts.slice(0, 3)} 
        brandColor={brandColor} 
        onBuyNow={addToCart}
      />

      {/* Catalogue Zone */}
      <main className="max-w-6xl mx-auto px-4 mt-12">
        
        {/* 3. COMPOSANT : FILTRES CAPSULES */}
        <CategoryFilters 
          activeFilter={activeFilter} 
          brandColor={brandColor}
          onSelectFilter={setActiveFilter} 
        />

        {/* 4. GRILLE CATALOGUE */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notre Sélection</h3>
          <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {filteredProducts.length} articles
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto">
            <span className="text-5xl mb-4 block">📦</span>
            <p className="text-slate-500 font-semibold text-lg">Aucun article ne correspond à ce filtre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                brandColor={brandColor} 
                onAddToCart={addToCart} 
                onOpenDetails={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* 5. COMPOSANT : TIROIR PANIER & FORMULAIRE */}
      <CartDrawer 
        isOpen={isCartOpen}
        cart={cart}
        montantTotal={montantTotal}
        brandColor={brandColor}
        nomClient={nomClient}
        phoneClient={phoneClient}
        adresse={adresse}
        submitting={submitting}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        setNomClient={setNomClient}
        setPhoneClient={setPhoneClient}
        setAdresse={setAdresse}
        onSubmit={handleCheckout}
      />

      {/* 6. COMPOSANT : MODAL DETAILS PRODUIT AVEC SELECTION DES OPTIONS */}
      <ProductDetailModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        brandColor={brandColor}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      {/* 7. COMPOSANT : FOOTER */}
      <Footer 
        shopName={resolvedShopName}
        brandColor={brandColor}
        logo={resolvedLogo}
        whatsapp={resolvedWhatsapp}
      />

      {/* 8. BOUTON FLOATING WHATSAPP */}
      {resolvedWhatsapp && (
        <a 
          href={`https://wa.me/${resolvedWhatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500 text-white shadow-2xl hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Contacter le vendeur"
        >
          <MessageCircle className="h-7 w-7 fill-white/10" />
          <span className="absolute right-16 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
            Contacter le vendeur
          </span>
        </a>
      )}
    </div>
  )
}

// ==========================================
// --- COMPOSANT : HEADER
// ==========================================
function Header({ shopName, cartCount, brandColor, logo, onCartClick }) {
  const safeShopName = shopName || "Boutique"
  const safeBrandColor = brandColor || "#10b981"
  
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 px-4 md:px-8 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          {logo ? (
            <img 
              src={getImageUrl(logo, BASE_URL)} 
              alt={safeShopName} 
              className="h-10 w-10 object-cover rounded-xl shadow-sm border border-slate-100"
              onError={(e) => { (e.target).style.display = 'none'; }}
            />
          ) : (
            <div 
              className="h-10 w-10 flex items-center justify-center rounded-xl font-extrabold text-white shadow-sm text-lg" 
              style={{ backgroundColor: safeBrandColor }}
            >
              {safeShopName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="font-extrabold text-xl tracking-tight text-slate-900">{safeShopName}</h1>
        </div>

        <button 
          onClick={onCartClick}
          className="relative h-11 w-11 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 hover:bg-slate-100 transition-all duration-200 active:scale-95 shadow-sm"
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span 
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full text-[10px] font-extrabold text-white flex items-center justify-center animate-pulse"
              style={{ backgroundColor: safeBrandColor }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

// ==========================================
// --- COMPOSANT : HERO CAROUSEL
// ==========================================
function HeroCarousel({ products, brandColor, onBuyNow }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (products.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [products])

  if (products.length === 0) return null

  return (
    <section className="px-4 mt-6 max-w-6xl mx-auto">
      <div className="relative h-[320px] md:h-[400px] w-full rounded-3xl overflow-hidden bg-slate-950 text-white shadow-xl shadow-slate-100">
        
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent z-10" />

        {/* Slide Content */}
        {products.map((prod, index) => {
          const isActive = index === currentIndex
          return (
            <div 
              key={prod.id}
              className={`absolute inset-0 flex items-center px-6 md:px-16 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              {/* Product Background Image */}
              {prod.image1 && (
                <img 
                  src={getImageUrl(prod.image1, BASE_URL)} 
                  alt={prod.designation} 
                  className="absolute right-0 top-0 h-full w-full md:w-2/3 object-cover opacity-60 md:opacity-95"
                  onError={(e) => { (e.target).src = "https://placehold.co/800x400?text=Produit" }}
                />
              )}

              {/* Marketing Text */}
              <div className="relative z-20 max-w-md space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm flex items-center gap-1.5 w-max">
                  <Sparkles className="h-3 w-3 text-yellow-300" /> Sélection Spéciale
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-sm">{prod.designation}</h2>
                <p className="text-white/80 text-sm md:text-base line-clamp-2">{prod.description || "Découvrez un produit phare disponible dès maintenant au meilleur prix."}</p>
                <div className="pt-2 flex items-center gap-4">
                  <span className="text-xl md:text-2xl font-black text-white">{numberFormat(prod.prix_vente)} FCFA</span>
                  <button 
                    onClick={() => onBuyNow(prod)}
                    style={{ backgroundColor: brandColor }}
                    className="px-6 py-2.5 rounded-xl font-bold text-white text-sm hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                  >
                    Commander <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Indicator dots */}
        {products.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {products.map((_, index) => (
              <button 
                key={index} 
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "w-6 bg-white" : "w-2 bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ==========================================
// --- COMPOSANT : FILTRE CATEGORIES
// ==========================================
function CategoryFilters({ activeFilter, brandColor, onSelectFilter }) {
  return (
    <section className="mb-10">
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">Parcourir la collection</h3>
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x">
        
        {/* All Products button */}
        <button
          onClick={() => onSelectFilter('all')}
          style={{
            backgroundColor: activeFilter === 'all' ? brandColor : "",
            color: activeFilter === 'all' ? "#fff" : ""
          }}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap border snap-start transition flex items-center gap-2 ${
            activeFilter === 'all' ? "border-transparent shadow-sm" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <ShoppingBag className="h-4 w-4" /> Tout voir
        </button>

        {/* In-stock button */}
        <button
          onClick={() => onSelectFilter('instock')}
          style={{
            backgroundColor: activeFilter === 'instock' ? brandColor : "",
            color: activeFilter === 'instock' ? "#fff" : ""
          }}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap border snap-start transition flex items-center gap-2 ${
            activeFilter === 'instock' ? "border-transparent shadow-sm" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="h-4 w-4" /> Disponibles
        </button>

        {/* Low Stock button */}
        <button
          onClick={() => onSelectFilter('promo')}
          style={{
            backgroundColor: activeFilter === 'promo' ? brandColor : "",
            color: activeFilter === 'promo' ? "#fff" : ""
          }}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap border snap-start transition flex items-center gap-2 ${
            activeFilter === 'promo' ? "border-transparent shadow-sm" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Clock className="h-4 w-4" /> Bientôt épuisé
        </button>
      </div>
    </section>
  )
}

// ==========================================
// --- COMPOSANT : CARTE PRODUIT
// ==========================================
function ProductCard({ product, brandColor, onAddToCart, onOpenDetails }) {
  const isOutOfStock = product.quantite_stock <= 0
  const isLowStock = product.quantite_stock > 0 && product.quantite_stock <= 5
  
  return (
    <div 
      onClick={() => !isOutOfStock && onOpenDetails(product)}
      className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      
      {/* Dynamic Image Wrapper */}
      <div className="aspect-square bg-slate-50 relative overflow-hidden">
        <img 
          src={getImageUrl(product.image1, BASE_URL)} 
          alt={product.designation} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target).src = "https://placehold.co/300x300?text=Produit" }}
        />

        {/* Dynamic Badges */}
        {isLowStock && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm z-10 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Stock Limité
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-red-600 text-white font-black text-xs px-4 py-2 rounded-xl uppercase tracking-widest shadow-md">
              Épuisé
            </span>
          </div>
        )}
      </div>

      {/* Description Block */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div className="space-y-1">
          <h4 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1 group-hover:text-slate-950 transition-colors">
            {product.designation}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
            {product.description || "Aucune description supplémentaire fournie pour cet article."}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prix</span>
            <span className="font-black text-slate-900 text-sm md:text-base whitespace-nowrap">
              {numberFormat(product.prix_vente)} F
            </span>
          </div>

          <button
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation(); // Empêche d'ouvrir le modal de détails lors du clic sur le "+" d'achat rapide
              onAddToCart(product);
            }}
            style={{ backgroundColor: isOutOfStock ? "#f1f5f9" : brandColor }}
            className={`h-9 w-9 md:h-10 md:w-10 rounded-xl flex items-center justify-center text-white transition-all duration-150 active:scale-90 hover:opacity-95 ${
              isOutOfStock ? "cursor-not-allowed !text-slate-400" : "shadow-sm"
            }`}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// --- COMPOSANT : TIROIR PANIER & CHECKOUT
// ==========================================
function CartDrawer({
  isOpen, cart, montantTotal, brandColor, nomClient, phoneClient, adresse, submitting,
  onClose, onUpdateQuantity, onRemove, setNomClient, setPhoneClient, setAdresse, onSubmit
}) {
  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ease-in-out ${
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />

      {/* Drawer Body */}
      <div className={`bg-white w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl relative overflow-y-auto transition-transform duration-300 ease-in-out transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <h3 className="text-xl font-extrabold text-slate-955 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-slate-900" /> Votre Panier 
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} articles
            </span>
          </h3>
          <button 
            onClick={onClose} 
            className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* List of Cart Items */}
        <div className="flex-1 py-4 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12">
              <ShoppingBag className="h-12 w-12 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-500">Votre panier est encore vide.</p>
              <button 
                onClick={onClose}
                className="mt-4 text-sm font-bold underline transition-opacity hover:opacity-80"
                style={{ color: brandColor }}
              >
                Découvrir nos produits
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const uniqueKey = `${item.product.id}-${item.product.selectedSize || ""}-${item.product.selectedColor || ""}`
                return (
                  <div key={uniqueKey} className="flex gap-4 items-center justify-between border-b border-slate-50 pb-4">
                    <div className="flex gap-3 items-center flex-1">
                      <img 
                        src={getImageUrl(item.product.image1, BASE_URL)} 
                        className="w-14 h-14 rounded-2xl object-cover bg-slate-50 border border-slate-100"
                        alt={item.product.designation}
                        onError={(e) => { e.target.src = "https://placehold.co/100x100" }}
                      />
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.product.designation}</h4>
                        
                        {/* Affichage des attributs s'ils ont été choisis */}
                        {(item.product.selectedSize || item.product.selectedColor) && (
                          <div className="flex flex-wrap gap-1.5 py-0.5">
                            {item.product.selectedSize && (
                              <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md uppercase">
                                T : {item.product.selectedSize}
                              </span>
                            )}
                            {item.product.selectedColor && (
                              <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md uppercase">
                                C : {item.product.selectedColor}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-xs font-semibold text-slate-400">{numberFormat(item.product.prix_vente)} FCFA</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2.5 pt-1.5">
                          <button 
                            onClick={() => onUpdateQuantity(item.product.id, item.product.selectedSize || "", item.product.selectedColor || "", -1)}
                            className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-extrabold w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.product.id, item.product.selectedSize || "", item.product.selectedColor || "", 1)}
                            className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Pricing and Removal */}
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-black text-slate-900">
                        {numberFormat(item.product.prix_vente * item.quantity)} F
                      </span>
                      <button 
                        onClick={() => onRemove(item.product.id, item.product.selectedSize || "", item.product.selectedColor || "")}
                        className="text-red-500 hover:text-red-600 transition flex items-center gap-1 text-[10px] font-bold uppercase"
                      >
                        <Trash2 className="h-3 w-3" /> Supprimer
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Formulaire de livraison minimaliste */}
              <form onSubmit={onSubmit} className="bg-slate-50 border border-slate-100 rounded-3xl p-4 mt-6 space-y-3 shadow-inner">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Adresse pour la livraison
                </h4>

                <input 
                  type="text" 
                  placeholder="Votre nom complet" 
                  required
                  value={nomClient}
                  onChange={(e) => setNomClient(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-150 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-800"
                />

                <input 
                  type="tel" 
                  placeholder="Numéro WhatsApp (Ex: 77 123 45 67)" 
                  required
                  value={phoneClient}
                  onChange={(e) => setPhoneClient(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-150 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-800"
                />

                <input 
                  type="text" 
                  placeholder="Votre Quartier & Ville de livraison" 
                  required
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-150 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-800"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  style={{ backgroundColor: brandColor }}
                  className="w-full py-4 mt-2 rounded-2xl font-bold text-white text-sm hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  {submitting ? "Validation de la commande..." : "Envoyer la commande via WhatsApp"}
                </button>

                {/* Bouton "Ajouter un autre produit" pour fermer simplement le panier */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 mt-1.5 rounded-2xl font-bold text-slate-700 bg-white border border-slate-200 text-sm hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  Ajouter un autre produit
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Totalisateur fixe de panier */}
        {cart.length > 0 && (
          <div className="border-t border-slate-100 pt-4 bg-white space-y-1">
            <div className="flex justify-between items-center font-bold text-slate-900">
              <span className="text-sm text-slate-400">Total panier :</span>
              <span className="text-2xl font-black" style={{ color: brandColor }}>
                {numberFormat(montantTotal)} FCFA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              *Les frais de livraison ne sont pas compris dans ce montant. Ils seront convenus en ligne avec le service de livraison sur WhatsApp.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ==========================================
// --- COMPOSANT : MODAL DETAILS PRODUIT (AVEC ATTRIBUTS DÉCLINABLES)
// ==========================================
function ProductDetailModal({ isOpen, product, brandColor, onClose, onAddToCart }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Réinitialisation lors du changement de produit
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0)
      setSelectedColor("")
      setSelectedSize("")
      setErrorMsg("")
    }
  }, [product])

  if (!isOpen || !product) return null

  const images = getAllImageUrls(product.image1, BASE_URL)
  const isOutOfStock = product.quantite_stock <= 0

  // Parser les options JSON reçues de la BDD (Laravel ou format d'origine)
  const parseOption = (optionField) => {
    if (!optionField) return []
    if (Array.isArray(optionField)) return optionField
    try {
      return JSON.parse(optionField)
    } catch (e) {
      if (typeof optionField === 'string') {
        return optionField.split(',').map(item => item.trim()).filter(Boolean)
      }
    }
    return []
  }

  const availableSizes = parseOption(product.taille_dimension)
  const availableColors = parseOption(product.color)

  const hasSizes = availableSizes.length > 0
  const hasColors = availableColors.length > 0

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      setErrorMsg("Veuillez sélectionner une taille / pointure.")
      return
    }
    if (hasColors && !selectedColor) {
      setErrorMsg("Veuillez sélectionner une couleur.")
      return
    }

    setErrorMsg("")
    onAddToCart({
      ...product,
      selectedSize,
      selectedColor
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in" 
        onClick={onClose} 
      />

      {/* Corps du modal */}
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh] transition-all duration-300">
        
        {/* Bouton de fermeture mobile & desktop */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 h-10 w-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
          ✕
        </button>

        {/* Zone de gauche : Galerie Photo */}
        <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col justify-between relative">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
            <img 
              src={images[activeImageIndex]} 
              alt={product.designation} 
              className="w-full h-full object-cover transition-all duration-500"
              onError={(e) => { e.target.src = "https://placehold.co/600x600?text=Produit" }}
            />
          </div>

          {/* Miniatures de navigation (uniquement s'il y a plusieurs images) */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pt-4 scrollbar-none snap-x">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-14 w-14 rounded-xl overflow-hidden border-2 bg-white snap-start flex-shrink-0 transition-all ${
                    idx === activeImageIndex ? "scale-105" : "opacity-60 hover:opacity-100"
                  }`}
                  style={{ borderColor: idx === activeImageIndex ? brandColor : "transparent" }}
                >
                  <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zone de droite : Informations Produit */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {product.designation}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-slate-955">
                {numberFormat(product.prix_vente)} FCFA
              </span>
              
              {product.quantite_stock <= 5 && product.quantite_stock > 0 && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                  Plus que {product.quantite_stock} restants !
                </span>
              )}
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Description</h4>
              <p className="text-sm text-slate-500 leading-relaxed max-h-[140px] overflow-y-auto">
                {product.description || "Aucune description supplémentaire fournie pour cet article."}
              </p>
            </div>

            {/* --- VARIATIONS SECTION INTERACTIVE --- */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              
              {/* Pointures / Tailles */}
              {hasSizes && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">
                    Taille / Pointure : <span className="text-slate-400 font-normal">{selectedSize || "Sélectionner"}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size)
                          setErrorMsg("")
                        }}
                        style={{
                          borderColor: selectedSize === size ? brandColor : "",
                          backgroundColor: selectedSize === size ? `${brandColor}10` : ""
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 transition-all active:scale-95 ${
                          selectedSize === size 
                            ? "text-slate-900 shadow-sm" 
                            : "border-slate-200 text-slate-600 hover:border-slate-350"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Couleurs */}
              {hasColors && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">
                    Couleur : <span className="text-slate-400 font-normal">{selectedColor || "Sélectionner"}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color)
                          setErrorMsg("")
                        }}
                        style={{
                          borderColor: selectedColor === color ? brandColor : "",
                          backgroundColor: selectedColor === color ? `${brandColor}10` : ""
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border-2 transition-all active:scale-95 ${
                          selectedColor === color 
                            ? "text-slate-900 shadow-sm" 
                            : "border-slate-200 text-slate-600 hover:border-slate-350"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Message d'erreur dynamique */}
            {errorMsg && (
              <div className="p-2.5 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 animate-pulse">
                <TriangleAlert className="text-xs" /> {errorMsg}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-slate-400">Disponibilité :</span>
              <span className={`font-bold ${isOutOfStock ? "text-red-500" : "text-emerald-500"}`}>
                {isOutOfStock ? "Épuisé" : `En stock (${product.quantite_stock} pièces)`}
              </span>
            </div>

            <button
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              style={{ backgroundColor: isOutOfStock ? "#cbd5e1" : brandColor }}
              className="w-full py-4 rounded-2xl text-white font-extrabold text-sm shadow-md hover:opacity-95 transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{isOutOfStock ? "Rupture de Stock" : "Ajouter au Panier"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// --- COMPOSANT : FOOTER (STYLE BLEU NUIT SOMBRE)
// ==========================================
function Footer({ shopName, brandColor, logo, whatsapp }) {
  const safeShopName = shopName || "Boutique"
  const safeBrandColor = brandColor || "#10b981"
  const formattedWhatsapp = whatsapp ? whatsapp.replace(/\D/g, "") : ""

  return (
    <footer className="bg-[#0f172a] text-slate-300 border-t border-slate-800 mt-24 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          {logo ? (
            <img 
              src={getImageUrl(logo, BASE_URL)} 
              alt={safeShopName} 
              className="h-12 w-12 object-cover rounded-2xl shadow-sm border border-slate-700"
              onError={(e) => { (e.target).style.display = 'none'; }}
            />
          ) : (
            <div 
              className="h-12 w-12 flex items-center justify-center rounded-2xl font-black text-white shadow-sm text-xl" 
              style={{ backgroundColor: safeBrandColor }}
            >
              {safeShopName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="font-extrabold text-lg text-white leading-tight">{safeShopName}</h4>
            <p className="text-xs text-slate-400 mt-0.5">Votre boutique en ligne de confiance</p>
          </div>
        </div>

        {whatsapp && (
          <a 
            href={`https://wa.me/${formattedWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 font-bold text-sm transition active:scale-95 shadow-sm"
          >
            <MessageCircle className="h-5 w-5 text-emerald-400 fill-emerald-400/10" />
            <span>Nous contacter sur WhatsApp</span>
          </a>
        )}
      </div>
      
      <div className="max-w-6xl mx-auto border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
        <p>&copy; {new Date().getFullYear()} {safeShopName}. Tous droits réservés.</p>
        <p className="flex items-center gap-1.5">
          <span>Propulsé par</span>
          <a 
            href="https://easyjaay.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-extrabold text-slate-300 hover:text-white transition flex items-center gap-1"
          >
            <span className="h-4 w-4 bg-teal-600 text-white rounded flex items-center justify-center font-black text-[9px]">Ej</span>
            <span>Easy Jaay</span>
          </a>
        </p>
      </div>
    </footer>
  )
}