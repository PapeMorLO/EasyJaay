// Deux polices, toutes deux servies par TON site (fichiers dans src/fonts/, licence libre OFL) :
//   police  = Plus Jakarta Sans : le texte courant
//   titres  = Fraunces (serif)  : les grands titres. S'utilise avec la classe CSS "titre" (voir landing.css)
// Pas de requête vers Google : plus rapide, et le build marche sans internet.
// Pour changer une police : remplace le fichier .woff2 dans src/fonts/ et le chemin ci-dessous.
import localFont from "next/font/local"

export const police = localFont({
  src: "../fonts/PlusJakartaSans-latin.woff2",
  weight: "200 800", // police "variable" : tous les poids dans un seul fichier
  display: "swap",
})

export const titres = localFont({
  src: "../fonts/Fraunces-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-titres", // expose la police sous forme de variable CSS
})
