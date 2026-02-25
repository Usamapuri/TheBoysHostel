import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Next.js proxy for PATH-BASED multi-tenant routing
// Routes: /demo, /theboyshostel, /superadmin, etc.
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip static assets and build files
  if (pathname.includes('.') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }
  
  // Skip API routes and favicon
  if (pathname.startsWith('/api') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }
  
  console.log('🔍 PROXY:', { pathname, url: request.url })
  
  // ============================================================================
  // ROOT LANDING PAGE
  // ============================================================================
  if (pathname === '/') {
    return NextResponse.next()
  }
  
  // ============================================================================
  // SUPER ADMIN ROUTES (No tenant isolation)
  // ============================================================================
  if (pathname.startsWith('/superadmin')) {
    // Allow login page: pass through and set pathname so layout can skip redirect
    if (pathname === '/superadmin/login') {
      const res = NextResponse.next()
      res.headers.set('x-pathname', pathname)
      return res
    }
    
    // Check if user is authenticated as super admin
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token || token.role !== 'SUPERADMIN') {
      console.log('🚫 SUPERADMIN: Unauthorized, redirecting to login')
      return NextResponse.redirect(new URL('/superadmin/login', request.url))
    }
    
    console.log('✅ SUPERADMIN: Authorized')
    const res = NextResponse.next()
    res.headers.set('x-pathname', pathname)
    return res
  }
  
  // ============================================================================
  // TENANT ROUTES (Path-based: /demo, /theboyshostel, etc.)
  // ============================================================================
  
  // Match tenant routes like /demo, /theboyshostel, /anytenant
  const tenantMatch = pathname.match(/^\/([a-zA-Z0-9-]+)(\/|$)/)
  
  if (!tenantMatch) {
    // No tenant found, redirect to home
    console.log('❌ NO TENANT MATCH, redirecting to home')
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  const tenantSlug = tenantMatch[1]
  
  // Reserved path segments: never treat as tenant (avoids "Tenant not found for subdomain: login")
  const reservedSlugs = ['login', 'register', 'api', 'auth', 'signin', 'signout']
  if (reservedSlugs.includes(tenantSlug.toLowerCase())) {
    console.log('❌ RESERVED SLUG:', tenantSlug, '- redirecting to home')
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  const tenantPath = pathname.substring(tenantSlug.length + 1) || '/' // Path after /tenant
  
  console.log('🏢 TENANT:', { tenantSlug, tenantPath })
  
  // Set tenant header for server actions
  const response = NextResponse.next()
  response.headers.set('x-subdomain', tenantSlug)
  
  // Public routes within tenant (no auth required)
  const isLoginPage = tenantPath === '/login' || pathname.endsWith('/login')
  const isRegisterPage = tenantPath === '/register' || pathname.endsWith('/register')
  
  if (isLoginPage || isRegisterPage) {
    console.log('📄 PUBLIC PAGE:', tenantPath)
    
    // If already authenticated, redirect to dashboard
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (token) {
      console.log('✅ ALREADY AUTHENTICATED, redirecting to dashboard')
      return NextResponse.redirect(new URL(`/${tenantSlug}`, request.url))
    }
    
    return response
  }
  
  // ============================================================================
  // PROTECTED ROUTES - Require Authentication
  // ============================================================================
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  console.log('🔐 AUTH CHECK:', { 
    tenantSlug, 
    tenantPath,
    hasToken: !!token,
    tokenTenant: token?.subdomain 
  })
  
  if (!token) {
    console.log('🚨 NO TOKEN, redirecting to login')
    return NextResponse.redirect(new URL(`/${tenantSlug}/login`, request.url))
  }
  
  // ============================================================================
  // TENANT ISOLATION - Ensure user accesses correct tenant
  // ============================================================================
  const tokenTenant = token.subdomain as string | undefined
  
  if (tokenTenant && tokenTenant !== tenantSlug) {
    console.log('⚠️ WRONG TENANT:', { tokenTenant, requestedTenant: tenantSlug })
    console.log('🔄 REDIRECTING to correct tenant')
    return NextResponse.redirect(new URL(`/${tokenTenant}`, request.url))
  }
  
  console.log('✅ AUTH PASSED:', { tenantSlug, user: token.email })
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
