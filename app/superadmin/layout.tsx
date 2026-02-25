import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { headers } from 'next/headers'
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
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  // Always render login page without redirect (user may be logged in as another tenant)
  if (pathname === '/superadmin/login') {
    return <SessionProvider>{children}</SessionProvider>
  }

  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'SUPERADMIN') {
    redirect('/superadmin/login')
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
