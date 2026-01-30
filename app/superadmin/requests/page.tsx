"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Check, X, Loader2, Search } from "lucide-react"
import { getAllRegistrationRequests, approveRegistration, rejectRegistration } from "@/lib/superadmin-actions"
import { RegistrationStatus } from "@prisma/client"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

type Request = Awaited<ReturnType<typeof getAllRegistrationRequests>>[0]

export default function RegistrationRequestsPage() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("PENDING")
  
  // Approval/Rejection dialogs
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setIsLoading(true)
    const data = await getAllRegistrationRequests()
    setRequests(data)
    setIsLoading(false)
  }

  const handleApprove = async () => {
    if (!selectedRequest || !session?.user?.id) return
    
    setActionLoading(true)
    const result = await approveRegistration(selectedRequest.id, session.user.id)
    
    if (result.success) {
      toast.success(`${selectedRequest.hostelName} has been approved!`)
      await loadRequests()
      setApproveDialogOpen(false)
      setSelectedRequest(null)
    } else {
      toast.error(result.error || "Failed to approve request")
    }
    setActionLoading(false)
  }

  const handleReject = async () => {
    if (!selectedRequest || !session?.user?.id || !rejectionReason) return
    
    setActionLoading(true)
    const result = await rejectRegistration(selectedRequest.id, session.user.id, rejectionReason)
    
    if (result.success) {
      toast.success(`${selectedRequest.hostelName} has been rejected`)
      await loadRequests()
      setRejectDialogOpen(false)
      setSelectedRequest(null)
      setRejectionReason("")
    } else {
      toast.error(result.error || "Failed to reject request")
    }
    setActionLoading(false)
  }

  const filteredRequests = requests
    .filter((req) => req.status === activeTab)
    .filter((req) =>
      searchQuery === "" ||
      req.hostelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const pendingCount = requests.filter((r) => r.status === RegistrationStatus.PENDING).length
  const approvedCount = requests.filter((r) => r.status === RegistrationStatus.APPROVED).length
  const rejectedCount = requests.filter((r) => r.status === RegistrationStatus.REJECTED).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Registration Requests</h1>
        <p className="text-muted-foreground">
          Review and manage hostel registration applications
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, subdomain, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="PENDING">
            Pending {pendingCount > 0 && <Badge className="ml-2" variant="secondary">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="APPROVED">
            Approved {approvedCount > 0 && <Badge className="ml-2" variant="secondary">{approvedCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="REJECTED">
            Rejected {rejectedCount > 0 && <Badge className="ml-2" variant="secondary">{rejectedCount}</Badge>}
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <TabsContent value={activeTab} className="mt-6 space-y-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">
                    No {activeTab.toLowerCase()} requests found
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-foreground">{request.hostelName}</CardTitle>
                        <CardDescription className="mt-1">
                          Subdomain: <span className="font-mono">{request.subdomain}.yourdomain.com</span>
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          request.status === RegistrationStatus.PENDING
                            ? "secondary"
                            : request.status === RegistrationStatus.APPROVED
                            ? "default"
                            : "destructive"
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Admin Name</p>
                        <p className="text-sm text-muted-foreground">{request.adminName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Admin Email</p>
                        <p className="text-sm text-muted-foreground">{request.adminEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Requested Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.requestedAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {request.reviewedAt && (
                        <div>
                          <p className="text-sm font-medium text-foreground">Reviewed Date</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.reviewedAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                      {request.reviewedByUser && (
                        <div>
                          <p className="text-sm font-medium text-foreground">Reviewed By</p>
                          <p className="text-sm text-muted-foreground">{request.reviewedByUser.name}</p>
                        </div>
                      )}
                      {request.rejectionReason && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-foreground">Rejection Reason</p>
                          <p className="text-sm text-muted-foreground">{request.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {request.status === RegistrationStatus.PENDING && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setSelectedRequest(request)
                            setApproveDialogOpen(true)
                          }}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request)
                            setRejectDialogOpen(true)
                          }}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this hostel registration?
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-2">
              <p><strong>Hostel:</strong> {selectedRequest.hostelName}</p>
              <p><strong>Subdomain:</strong> {selectedRequest.subdomain}.yourdomain.com</p>
              <p><strong>Admin:</strong> {selectedRequest.adminName} ({selectedRequest.adminEmail})</p>
              <p className="text-sm text-muted-foreground mt-4">
                This will create the tenant account and the admin user will be able to login immediately.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Registration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this registration
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <p><strong>Hostel:</strong> {selectedRequest.hostelName}</p>
                <p><strong>Subdomain:</strong> {selectedRequest.subdomain}.yourdomain.com</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Explain why this registration is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Registration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
