// Page /inscription : juste une enveloppe serveur (pour le titre de l'onglet),
// le vrai formulaire est dans un composant client car il réagit à la saisie.
import type { Metadata } from "next"
import "../landing.css"
import { police, titres } from "../../lib/police"
import FormulaireInscription from "../../components/inscription/FormulaireInscription"

export const metadata: Metadata = {
  title: "Créer ma boutique – DiayRek",
  description: "Créez votre boutique en ligne en 2 minutes.",
}

export default function PageInscription() {
  return <div className={`${police.className} ${titres.variable}`}><FormulaireInscription /></div>
}
