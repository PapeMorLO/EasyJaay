import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Sécurité pour les fichiers internes
  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // --- LOG DE TEST (Regarde ton terminal Next.js quand tu recharges la page) ---
  console.log("URL détectée par le Middleware :", hostname)

  let tenant = ''

  // Détection générique pour le local (découpe tout ce qui est avant le premier point)
  // Fonctionne pour sokhna-cosmetiques.localhost:3000, 127.0.0.1.vcap.me:3000, etc.
  if (hostname.includes('localhost:3000') && hostname !== 'localhost:3000') {
    tenant = hostname.split('.')[0]
  } 
  // Configuration pour ta production future
  else if (hostname.includes('.easyjaay.baobapp.tech')) {
    tenant = hostname.split('.easyjaay.baobapp.tech')[0]
  }

  if (tenant) {
    console.log("Tenant intercepté avec succès :", tenant)
    url.pathname = `/${tenant}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}