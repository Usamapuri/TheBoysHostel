import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SuperAdminNav } from '@/components/superadmin/superadmin-nav'
import { SessionProvider } from '@/components/auth/session-provider'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // NOTE: Authentication for /superadmin routes is now handled by proxy.ts
  // The proxy checks auth and redirects to /superadmin/login if not authenticated
  // This layout just provides the UI wrapper
  
  const session = await getServerSession(authOptions)
  
  // If no session, just render children (login page)
  if (!session) {
    return <SessionProvider>{children}</SessionProvider>
  }
  
  // If session exists but not super admin, redirect to home
  if (session.user.role !== 'SUPERADMIN') {
    redirect('/')
  }
  
  // Render super admin dashboard with navigation
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <SuperAdminNav />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}
