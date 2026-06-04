import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // Si on est à la racine ou sur des chemins système, on laisse passer
  if (
    url.pathname === '/' ||
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Ici, vous récupérez le slug (ex: "sokhna-cosmetiques")
  const pathParts = url.pathname.split('/')
  const boutiqueSlug = pathParts[1] // Le premier segment après le "/"

  // Vous pouvez ajouter ici une logique pour vérifier si le slug est valide
  // Mais pour l'instant, laissez Next.js diriger vers le dossier [boutique]
  return NextResponse.next()
}