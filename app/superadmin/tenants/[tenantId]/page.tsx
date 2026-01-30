import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getTenantDetails } from "@/lib/superadmin-actions"
import { ArrowLeft, ExternalLink, Users, Building2, DollarSign } from "lucide-react"

export default async function TenantDetailsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const tenant = await getTenantDetails(tenantId)

  if (!tenant) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/superadmin/tenants">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tenants
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{tenant.name}</h1>
          <div className="flex items-center gap-3">
            <code className="text-sm bg-muted px-2 py-1 rounded">{tenant.subdomain}.yourdomain.com</code>
            <Badge variant={tenant.isActive ? "default" : "destructive"}>
              {tenant.isActive ? "Active" : "Suspended"}
            </Badge>
            <a
              href={`http://${tenant.subdomain}.localhost:3000`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Dashboard
              </Button>
            </a>
          </div>
        </div>
      </div>

      {tenant.suspendedAt && tenant.suspensionReason && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-red-500 mb-1">Suspension Details</h3>
          <p className="text-sm text-muted-foreground">
            Suspended on {new Date(tenant.suspendedAt).toLocaleDateString()}
          </p>
          <p className="text-sm mt-2"><strong>Reason:</strong> {tenant.suspensionReason}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant.users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant._count.students}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant._count.rooms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant._count.transactions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tenant ID</p>
              <code className="text-sm">{tenant.id}</code>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created Date</p>
              <p className="text-sm">{new Date(tenant.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}</p>
            </div>
            {tenant.approvedAt && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Date</p>
                <p className="text-sm">{new Date(tenant.approvedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users ({tenant.users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tenant.users.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users</p>
              ) : (
                tenant.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
