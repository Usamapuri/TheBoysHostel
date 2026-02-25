import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Next.js proxy for PATH-BASED multi-tenant routing
// Routes: /demo, /theboyshostel, /superadmin, etc.
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // #region agent log
  fetch('http://127.0.0.1:7409/ingest/51ef7e28-99f0-40e8-aea4-0bc2d8a7c996',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'344015'},body:JSON.stringify({sessionId:'344015',location:'proxy.ts:8',message:'Proxy entry',data:{pathname,url:request.url,method:request.method},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
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
    // #region agent log
    fetch('http://127.0.0.1:7409/ingest/51ef7e28-99f0-40e8-aea4-0bc2d8a7c996',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'344015'},body:JSON.stringify({sessionId:'344015',location:'proxy.ts:30',message:'Root landing page',data:{pathname},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return NextResponse.next()
  }
  
  // ============================================================================
  // SUPER ADMIN ROUTES (No tenant isolation)
  // ============================================================================
  if (pathname.startsWith('/superadmin')) {
    // #region agent log
    fetch('http://127.0.0.1:7409/ingest/51ef7e28-99f0-40e8-aea4-0bc2d8a7c996',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'344015'},body:JSON.stringify({sessionId:'344015',location:'proxy.ts:37',message:'Super admin route detected',data:{pathname,isLogin:pathname==='/superadmin/login'},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // Allow login page without authentication
    if (pathname === '/superadmin/login') {
      return NextResponse.next()
    }
    
    // Check if user is authenticated as super admin
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token || token.role !== 'SUPERADMIN') {
      console.log('🚫 SUPERADMIN: Unauthorized, redirecting to login')
      return NextResponse.redirect(new URL('/superadmin/login', request.url))
    }
    
    console.log('✅ SUPERADMIN: Authorized')
    return NextResponse.next()
  }
  
  // ============================================================================
  // TENANT ROUTES (Path-based: /demo, /theboyshostel, etc.)
  // ============================================================================
  
  // Match tenant routes like /demo, /theboyshostel, /anytenant
  const tenantMatch = pathname.match(/^\/([a-zA-Z0-9-]+)(\/|$)/)
  
  // #region agent log
  fetch('http://127.0.0.1:7409/ingest/51ef7e28-99f0-40e8-aea4-0bc2d8a7c996',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'344015'},body:JSON.stringify({sessionId:'344015',location:'proxy.ts:67',message:'Tenant route matching',data:{pathname,tenantMatch:tenantMatch?[tenantMatch[0],tenantMatch[1]]:null},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  if (!tenantMatch) {
    // No tenant found, redirect to home
    console.log('❌ NO TENANT MATCH, redirecting to home')
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  const tenantSlug = tenantMatch[1]
  const tenantPath = pathname.substring(tenantSlug.length + 1) || '/' // Path after /tenant
  
  console.log('🏢 TENANT:', { tenantSlug, tenantPath })
  
  // #region agent log
  fetch('http://127.0.0.1:7409/ingest/51ef7e28-99f0-40e8-aea4-0bc2d8a7c996',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'344015'},body:JSON.stringify({sessionId:'344015',location:'proxy.ts:82',message:'Tenant extracted',data:{tenantSlug,tenantPath,fullPathname:pathname},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  // Set tenant header for server actions
  const response = NextResponse.next()
  response.headers.set('x-subdomain', tenantSlug)
  
  // Public routes within tenant (no auth required)
  const isLoginPage = tenantPath === '/login' || pathname.endsWith('/login')
  const isRegisterPage = tenantPath === '/register' || pathname.endsWith('/register')
  
  if (isLoginPage || isRegisterPage) {
    console.log('📄 PUBLIC PAGE:', tenantPath)
    
    // #region agent log
    fetch('http://127.0.0.1:7409/ingest/51ef7e28-99f0-40e8-aea4-0bc2d8a7c996',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'344015'},body:JSON.stringify({sessionId:'344015',location:'proxy.ts:99',message:'Public page detected',data:{tenantPath,isLoginPage,isRegisterPage},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
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
  
  // #region agent log
  fetch('http://127.0.0.1:7409/ingest/51ef7e28-99f0-40e8-aea4-0bc2d8a7c996',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'344015'},body:JSON.stringify({sessionId:'344015',location:'proxy.ts:118',message:'Auth check',data:{tenantSlug,tenantPath,hasToken:!!token,tokenTenant:token?.subdomain,tokenEmail:token?.email},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  console.log('🔐 AUTH CHECK:', { 
    tenantSlug, 
    tenantPath,
    hasToken: !!token,
    tokenTenant: token?.subdomain 
  })
  
  if (!token) {
    console.log('🚨 NO TOKEN, redirecting to login')
    // #region agent log
    fetch('http://127.0.0.1:7409/ingest/51ef7e28-99f0-40e8-aea4-0bc2d8a7c996',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'344015'},body:JSON.stringify({sessionId:'344015',location:'proxy.ts:135',message:'No token - redirecting to login',data:{redirectTo:`/${tenantSlug}/login`},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return NextResponse.redirect(new URL(`/${tenantSlug}/login`, request.url))
  }
  
  // ============================================================================
  // TENANT ISOLATION - Ensure user accesses correct tenant
  // ============================================================================
  const tokenTenant = token.subdomain as string | undefined
  
  if (tokenTenant && tokenTenant !== tenantSlug) {
    console.log('⚠️ WRONG TENANT:', { tokenTenant, requestedTenant: tenantSlug })
    console.log('🔄 REDIRECTING to correct tenant')
    // #region agent log
    fetch('http://127.0.0.1:7409/ingest/51ef7e28-99f0-40e8-aea4-0bc2d8a7c996',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'344015'},body:JSON.stringify({sessionId:'344015',location:'proxy.ts:150',message:'Wrong tenant - redirecting',data:{tokenTenant,requestedTenant:tenantSlug},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return NextResponse.redirect(new URL(`/${tokenTenant}`, request.url))
  }
  
  console.log('✅ AUTH PASSED:', { tenantSlug, user: token.email })
  // #region agent log
  fetch('http://127.0.0.1:7409/ingest/51ef7e28-99f0-40e8-aea4-0bc2d8a7c996',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'344015'},body:JSON.stringify({sessionId:'344015',location:'proxy.ts:159',message:'Auth passed - allowing access',data:{tenantSlug,userEmail:token.email},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
  // #endregion
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
