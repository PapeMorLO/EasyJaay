import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Ne rien faire pour les fichiers statiques ou l'API
  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Si on est sur le domaine principal, on laisse Next.js gérer
  if (hostname === 'easyjaay.baobapp.tech' || hostname === 'localhost:3000') {
    return NextResponse.next()
  }

  // Extraction du sous-domaine (ex: client1.easyjaay.baobapp.tech -> client1)
  const subdomain = hostname.split('.')[0]

  // On réécrit l'URL en interne pour aller dans le dossier [subdomain]
  url.pathname = `/${subdomain}${url.pathname}`
  
  return NextResponse.rewrite(url)
}