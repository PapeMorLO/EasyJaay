import StorefrontClient from "./StorefrontClient"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://easyjaayback.baobapp.tech";

// Le SEO est géré ici sur le serveur pour une indexation optimale
export async function generateMetadata({ params }) {
  const { tenant } = await params;
  return { 
    title: `Boutique ${tenant} - Easy Jaay`,
    description: "Découvrez notre boutique en ligne et passez commande facilement via WhatsApp."
  };
}

// La page serveur appelle le composant client
export default async function Page({ params }) {
  const { tenant } = await params;
  
  let data = null;
  try {
    const res = await fetch(`${BASE_URL}/api/shops/${tenant}`, { cache: "no-store" });
    if (res.ok) {
      data = await res.json();
    }
  } catch (err) {
    console.error("Erreur lors de la récupération des données :", err);
  }
  
  return <StorefrontClient initialData={data} tenant={tenant} />;
}