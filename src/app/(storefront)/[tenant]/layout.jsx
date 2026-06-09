/*export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      {/* On peut mettre un header global ici plus tard si nécessaire }
      <main>{children}</main>
    </div>
  )
}
*/ 
// app/[tenant]/layout.js
// app/[tenant]/layout.js

export async function generateMetadata({ params }) {
  // 1. Récupération du paramètre dynamique de l'URL (ex: "ma-boutique")
  const resolvedParams = await params;
  const tenant = resolvedParams.tenant;
  
  // URL de ton backend Laravel
  const BASE_URL = "https://easyjaayback.baobapp.tech";
  // URL de ton frontend Next.js (adaptée à ton sous-domaine de production)
  const FRONT_URL = "https://easyjaay.baobapp.tech";

  try {
    // 2. Appel SSR à l'API Laravel pour récupérer les données du vendeur actuel
    const res = await fetch(`${BASE_URL}/api/shops/${tenant}`, { 
      cache: 'no-store' // Évite que le changement de logo sur Filament reste bloqué en cache
    });
    
    if (!res.ok) throw new Error("Shop introuvable");
    const data = await res.json();
    
    // Normalisation des données pour correspondre aux réponses de ta BDD
    let shopName = "Boutique en ligne";
    let logoPath = null;

    if (data && data.shop) {
      shopName = data.shop.raison_sociale || data.shop.nom || "Boutique";
      logoPath = data.shop.logo;
    } else if (data && data.data) {
      shopName = data.data.raison_sociale || data.data.nom || "Boutique";
      logoPath = data.data.logo;
    } else if (data) {
      shopName = data.raison_sociale || data.nom || "Boutique";
      logoPath = data.logo;
    }

    // 3. Reconstruction de l'URL absolue de l'image (très important pour Facebook)
    const ogImageUrl = logoPath 
      ? `${BASE_URL}/storage/${logoPath}`
      : `${FRONT_URL}/default-shop-banner.jpg`; // Image de secours si pas de logo

    // 4. Envoi des métadonnées Open Graph lues par les réseaux sociaux
    return {
      title: `${shopName} | EasyJaay`,
      description: `Découvrez notre catalogue sur EasyJaay. Commandez directement vos articles sur WhatsApp !`,
      openGraph: {
        title: shopName,
        description: `Visitez notre boutique en ligne, parcourez nos produits et profitez de la livraison rapide.`,
        url: `${FRONT_URL}/${tenant}`,
        siteName: 'EasyJaay',
        images: [
          {
            url: ogImageUrl, // C'est cette image qui devient la grande carte cliquable sur Facebook !
            width: 1200,
            height: 630,
            alt: `Logo de la boutique ${shopName}`,
          },
        ],
        locale: 'fr_FR',
        type: 'website',
      },
    };
  } catch (error) {
    // Fallback si l'API Laravel ne répond pas
    return {
      title: "Boutique en ligne - EasyJaay",
      description: "Visitez votre boutique favorite sur EasyJaay et commandez sur WhatsApp.",
    };
  }
}

export default function TenantLayout({ children }) {
  return (
    <>
      {children}
    </>
  );
}