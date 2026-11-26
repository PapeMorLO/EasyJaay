import { notFound } from "next/navigation"
import { BASE_URL } from "../../../../../lib/config"
import { urlsImages } from "../../../../../lib/images"
import FicheProduit from "./FicheProduit"

// ---------------------------------------------------------------------------
// Page d'UN produit :  /nom-de-la-boutique/p/12
//
// Pourquoi une page à part ? Quand le vendeur colle ce lien dans WhatsApp, Facebook ou un statut,
// l'application affiche une belle carte (photo + nom + prix) : c'est ce qui donne envie de cliquer.
// Cette carte est fabriquée par generateMetadata ci-dessous, côté SERVEUR, avant que la page s'affiche.
// ---------------------------------------------------------------------------

const formater = (n) => new Intl.NumberFormat("fr-FR").format(n || 0)

// On demande le produit à Laravel. Le résultat est gardé 60 secondes pour que la page soit rapide.
async function charger(tenant, id) {
  try {
    const res = await fetch(`${BASE_URL}/api/shops/${tenant}/produits/${id}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return await res.json()
  } catch (e) {
    return null
  }
}

export async function generateMetadata({ params }) {
  const { tenant, id } = await params
  const data = await charger(tenant, id)

  if (!data) return { title: "Produit introuvable" }

  const { shop, produit } = data
  const titre = `${produit.designation} - ${formater(produit.prix_vente)} FCFA`
  const description =
    (produit.description || "").trim().slice(0, 150) ||
    `Commandez sur WhatsApp chez ${shop.raison_sociale}.`
  const image = urlsImages(produit.image1)[0]

  return {
    title: `${produit.designation} | ${shop.raison_sociale}`,
    description,
    openGraph: {
      title: titre,
      description,
      siteName: shop.raison_sociale,
      type: "website",
      locale: "fr_SN",
      images: [{ url: image }],
    },
    twitter: { card: "summary_large_image", title: titre, description, images: [image] },
  }
}

export default async function PageProduit({ params }) {
  const { tenant, id } = await params
  const data = await charger(tenant, id)

  if (!data) notFound()

  return <FicheProduit tenant={tenant} shop={data.shop} produit={data.produit} />
}
