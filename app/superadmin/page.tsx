import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileCheck, Users, BarChart3, AlertCircle } from "lucide-react"
import { getAllRegistrationRequests, getSystemAnalytics } from "@/lib/superadmin-actions"
import { RegistrationStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

export default async function SuperAdminDashboard() {
  const [pendingRequests, analytics] = await Promise.all([
    getAllRegistrationRequests(RegistrationStatus.PENDING),
    getSystemAnalytics(),
  ])

  const stats = [
    {
      title: "Pending Requests",
      value: pendingRequests.length,
      description: "New hostel registrations awaiting review",
      icon: FileCheck,
      href: "/superadmin/requests",
      color: "text-yellow-500",
      action: "Review Requests",
    },
    {
      title: "Total Tenants",
      value: analytics.totalTenants,
      description: `${analytics.activeTenants} active, ${analytics.suspendedTenants} suspended`,
      icon: Users,
      href: "/superadmin/tenants",
      color: "text-blue-500",
      action: "Manage Tenants",
    },
    {
      title: "Total Students",
      value: analytics.totalStudents,
      description: "Across all hostels",
      icon: Users,
      href: "/superadmin/analytics",
      color: "text-green-500",
      action: "View Analytics",
    },
    {
      title: "Total Rooms",
      value: analytics.totalRooms,
      description: "Across all hostels",
      icon: BarChart3,
      href: "/superadmin/analytics",
      color: "text-purple-500",
      action: "View Analytics",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage tenant registrations, monitor system health, and oversee all hostels
        </p>
      </div>

      {pendingRequests.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              {pendingRequests.length} Pending Registration{pendingRequests.length !== 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              New hostel registrations are waiting for your review
            </p>
          </div>
          <Link href="/superadmin/requests">
            <Button size="sm" variant="secondary">
              Review Now
            </Button>
          </Link>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <Link href={stat.href}>
                <Button variant="link" size="sm" className="px-0 mt-2">
                  {stat.action} →
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/superadmin/requests" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileCheck className="mr-2 h-4 w-4" />
                Review Registration Requests
              </Button>
            </Link>
            <Link href="/superadmin/tenants" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Tenants
              </Button>
            </Link>
            <Link href="/superadmin/analytics" className="block">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                View System Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
            <CardDescription className="text-muted-foreground">
              Latest registration requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No pending registration requests
              </p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{request.hostelName}</p>
                      <p className="text-sm text-muted-foreground">{request.subdomain}</p>
                    </div>
                    <Link href="/superadmin/requests">
                      <Button size="sm" variant="ghost">
                        Review
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
