"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ExternalLink, Ban, CheckCircle, Loader2, Eye } from "lucide-react"
import { getAllTenants, suspendTenant, activateTenant } from "@/lib/superadmin-actions"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

type Tenant = Awaited<ReturnType<typeof getAllTenants>>[0]

export default function TenantsManagementPage() {
  const { data: session } = useSession()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    setIsLoading(true)
    const data = await getAllTenants()
    setTenants(data)
    setIsLoading(false)
  }

  const handleSuspend = async () => {
    if (!selectedTenant || !session?.user?.id || !suspensionReason) return
    
    setActionLoading(true)
    const result = await suspendTenant(selectedTenant.id, session.user.id, suspensionReason)
    
    if (result.success) {
      toast.success(`${selectedTenant.name} has been suspended`)
      await loadTenants()
      setSuspendDialogOpen(false)
      setSelectedTenant(null)
      setSuspensionReason("")
    } else {
      toast.error(result.error || "Failed to suspend tenant")
    }
    setActionLoading(false)
  }

  const handleActivate = async (tenant: Tenant) => {
    if (!session?.user?.id) return
    
    const result = await activateTenant(tenant.id, session.user.id)
    
    if (result.success) {
      toast.success(`${tenant.name} has been activated`)
      await loadTenants()
    } else {
      toast.error(result.error || "Failed to activate tenant")
    }
  }

  const filteredTenants = tenants.filter((tenant) =>
    searchQuery === "" ||
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Tenants</h1>
        <p className="text-muted-foreground">
          View and manage all registered hostels
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tenants ({filteredTenants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hostel Name</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Rooms</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>
                    <code className="text-sm">{tenant.subdomain}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tenant.isActive ? "default" : "destructive"}>
                      {tenant.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell>{tenant._count.users}</TableCell>
                  <TableCell>{tenant._count.students}</TableCell>
                  <TableCell>{tenant._count.rooms}</TableCell>
                  <TableCell>
                    {new Date(tenant.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/superadmin/tenants/${tenant.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <a
                        href={`http://${tenant.subdomain}.localhost:3000`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                      {tenant.isActive ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTenant(tenant)
                            setSuspendDialogOpen(true)
                          }}
                        >
                          <Ban className="h-4 w-4 text-red-500" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleActivate(tenant)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Tenant</DialogTitle>
            <DialogDescription>
              This will prevent all users from this hostel from accessing the system
            </DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-4">
              <div>
                <p><strong>Hostel:</strong> {selectedTenant.name}</p>
                <p><strong>Subdomain:</strong> {selectedTenant.subdomain}.yourdomain.com</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suspensionReason">Suspension Reason</Label>
                <Textarea
                  id="suspensionReason"
                  placeholder="Explain why this tenant is being suspended..."
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={actionLoading || !suspensionReason}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suspending...
                </>
              ) : (
                "Suspend Tenant"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
