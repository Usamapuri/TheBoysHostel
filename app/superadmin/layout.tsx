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
  const session = await getServerSession(authOptions)
  
  // Check if user is super admin
  if (!session || session.user.role !== 'SUPERADMIN') {
    redirect('/')
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
