import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SuperAdminNav } from '@/components/superadmin/superadmin-nav'
import { SessionProvider } from '@/components/auth/session-provider'
import { headers } from 'next/headers'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the current pathname to check if this is the login page
  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') || headersList.get('referer') || ''
  
  // Allow login page without authentication
  if (pathname.includes('/superadmin/login')) {
    return <SessionProvider>{children}</SessionProvider>
  }
  
  const session = await getServerSession(authOptions)
  
  // Check if user is super admin
  if (!session || session.user.role !== 'SUPERADMIN') {
    redirect('/superadmin/login') // Redirect to login, not home
  }
  
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
