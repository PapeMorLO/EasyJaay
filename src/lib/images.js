import { BASE_URL } from "./config"

const SANS_PHOTO = "https://placehold.co/600x600?text=Sans+photo"

// image1 contient une liste de chemins ("produits/abc.jpg"). Cette fonction donne les adresses complètes.
export function urlsImages(imagePath) {
  if (!imagePath) return [SANS_PHOTO]

  const chemins = Array.isArray(imagePath) ? imagePath : [imagePath]
  if (chemins.length === 0) return [SANS_PHOTO]

  return chemins.map((chemin) => {
    if (typeof chemin !== "string") return SANS_PHOTO
    if (chemin.startsWith("http://") || chemin.startsWith("https://")) return chemin
    if (chemin.startsWith("/storage/")) return `${BASE_URL}${chemin}`
    if (chemin.startsWith("storage/")) return `${BASE_URL}/${chemin}`
    return `${BASE_URL}/storage/${chemin}`
  })
}
