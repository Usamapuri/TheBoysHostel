import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Renamed from middleware to proxy for Next.js 16 compatibility
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // CRITICAL: Skip all Next.js internal routes FIRST to prevent build worker interference
  if (pathname.startsWith('/_next')) {
    return NextResponse.next()
  }
  
  const hostname = request.headers.get('host') || ''
  
  // Define your root domains (add your production domains here)
  const rootDomains = [
    'localhost:3000',
    'localhost',
    'yourdomain.com',
    'www.yourdomain.com',
  ]
  
  // Check if it's a root domain
  const isRootDomain = rootDomains.some(domain => hostname === domain || hostname.startsWith(domain))
  
  // If it's the root domain, allow access to the landing page
  if (isRootDomain) {
    // Allow API routes (already handled above but kept for clarity)
    if (pathname.startsWith('/api')) {
      return NextResponse.next()
    }
    
    // Allow access to public assets
    if (pathname.startsWith('/icon') || pathname.startsWith('/placeholder') || pathname.startsWith('/apple-icon')) {
      return NextResponse.next()
    }
    
    // If pathname is just /, show landing page
    if (pathname === '/') {
      return NextResponse.next()
    }
    
    // For any other route from root domain, redirect to landing
    if (!pathname.startsWith('/landing')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    return NextResponse.next()
  }
  
  // Extract subdomain
  let subdomain = hostname.split('.')[0]
  
  // Handle www prefix (strip it out)
  if (subdomain === 'www') {
    subdomain = hostname.split('.')[1] || ''
  }
  
  // Remove port if present (for localhost:3000)
  subdomain = subdomain.split(':')[0]
  
  // If no subdomain or subdomain is the same as hostname (like localhost), treat as root
  if (!subdomain || subdomain === hostname.split(':')[0]) {
    return NextResponse.next()
  }
  
  // Rewrite the URL to include the subdomain as a path parameter
  // For example: theboyshostel.localhost:3000/dashboard -> localhost:3000/theboyshostel/dashboard
  
  // Skip rewrite if already in subdomain path
  if (pathname.startsWith(`/${subdomain}`)) {
    return NextResponse.next()
  }
  
  // Skip rewrite for API routes (Next.js internals already handled at top)
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }
  
  // Skip rewrite for public assets
  if (pathname.startsWith('/icon') || pathname.startsWith('/placeholder') || pathname.startsWith('/apple-icon')) {
    return NextResponse.next()
  }
  
  // Check if the user is authenticated
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))
  
  // Demo subdomain gets special treatment (auto-login handled in the page)
  const isDemoSubdomain = subdomain === 'demo'
  
  // If accessing a protected route without authentication (and not demo)
  if (!token && !isPublicRoute && !isDemoSubdomain) {
    // Redirect to login page for this subdomain
    const loginUrl = new URL(`http://${hostname}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }
  
  // If authenticated and trying to access login page, redirect to dashboard
  if (token && pathname === '/login') {
    const dashboardUrl = new URL(`http://${hostname}/`, request.url)
    return NextResponse.redirect(dashboardUrl)
  }
  
  // Rewrite to subdomain route
  const url = request.nextUrl.clone()
  url.pathname = `/${subdomain}${pathname}`
  
  // Add subdomain as header for easy access in components
  const response = NextResponse.rewrite(url)
  response.headers.set('x-subdomain', subdomain)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
