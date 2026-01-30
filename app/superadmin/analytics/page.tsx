import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSystemAnalytics } from "@/lib/superadmin-actions"
import { Building2, Users, Home, FileCheck, TrendingUp } from "lucide-react"

export default async function AnalyticsPage() {
  const analytics = await getSystemAnalytics()

  const stats = [
    {
      title: "Total Tenants",
      value: analytics.totalTenants,
      description: `${analytics.activeTenants} active`,
      icon: Building2,
      color: "text-blue-500",
    },
    {
      title: "Pending Requests",
      value: analytics.pendingRequests,
      description: "Awaiting approval",
      icon: FileCheck,
      color: "text-yellow-500",
    },
    {
      title: "Total Students",
      value: analytics.totalStudents,
      description: "Across all hostels",
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Total Rooms",
      value: analytics.totalRooms,
      description: "Across all hostels",
      icon: Home,
      color: "text-purple-500",
    },
  ]

  const growthData = Object.entries(analytics.growthByMonth).map(([month, count]) => ({
    month,
    count,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">System Analytics</h1>
        <p className="text-muted-foreground">
          Overview of platform-wide metrics and growth
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {growthData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Tenant Growth (Last 6 Months)
            </CardTitle>
            <CardDescription>
              New hostel registrations by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {growthData.map((data) => (
                <div key={data.month} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="font-medium text-foreground">{data.month}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min((data.count / Math.max(...growthData.map(d => d.count))) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-8 text-right">{data.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current platform status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Tenants</span>
              <span className="font-medium text-foreground">{analytics.activeTenants}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Suspended Tenants</span>
              <span className="font-medium text-foreground">{analytics.suspendedTenants}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Approvals</span>
              <span className="font-medium text-foreground">{analytics.pendingRequests}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
            <CardDescription>Aggregated data across all tenants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Students</span>
              <span className="font-medium text-foreground">{analytics.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Rooms</span>
              <span className="font-medium text-foreground">{analytics.totalRooms}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Students per Tenant</span>
              <span className="font-medium text-foreground">
                {analytics.totalTenants > 0 ? Math.round(analytics.totalStudents / analytics.totalTenants) : 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
