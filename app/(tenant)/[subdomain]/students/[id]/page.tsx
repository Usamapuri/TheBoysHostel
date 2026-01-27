import { use } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStudentById, getStudentTransactions, getStudentActivityLogs, getRoomById, updateStudent } from "@/lib/actions"
import { FinancialSettingsCard } from "@/components/students/financial-settings-card"
import { DocumentsSection } from "@/components/students/documents-section"
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BedDouble,
  AlertCircle,
  DollarSign,
  FileText,
  ClipboardList,
} from "lucide-react"

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string; subdomain: string }> }) {
  const { id, subdomain } = await params

  const [student, transactions, activityLogs] = await Promise.all([
    getStudentById(id),
    getStudentTransactions(id),
    getStudentActivityLogs(id),
  ])

  const room = student?.roomId ? await getRoomById(student.roomId) : null

  if (!student) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-foreground mb-2">Student Not Found</h2>
            <p className="text-muted-foreground mb-4">The student you&apos;re looking for doesn&apos;t exist.</p>
            <Link href={`/${subdomain}`}>
              <Button>Go Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const bedLabel = room?.beds.find((b) => b.id === student.bedId)?.label || "N/A"
  const totalDue = transactions.filter((t) => t.status === "Unpaid").reduce((acc, t) => acc + t.amount, 0)
  const totalPaid = transactions.filter((t) => t.status === "Paid").reduce((acc, t) => acc + t.amount, 0)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "gate_pass":
        return <FileText className="h-4 w-4" />
      case "visitor":
        return <User className="h-4 w-4" />
      case "complaint":
        return <AlertCircle className="h-4 w-4" />
      case "notice":
        return <ClipboardList className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-success/20 text-success border-success/30"
      case "pending":
        return "bg-warning/20 text-warning border-warning/30"
      case "rejected":
        return "bg-danger/20 text-danger border-danger/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleUpdateStudent = async (updates: any) => {
    "use server"
    await updateStudent(id, updates)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Back button and header */}
        <div className="mb-6">
          <Link href={`/${subdomain}`}>
            <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
              <p className="text-muted-foreground">
                Room {room?.roomNumber || "N/A"} - Bed {bedLabel}
              </p>
            </div>
            {totalDue > 0 ? (
              <Badge variant="destructive" className="bg-danger/20 text-danger border-danger/30 text-sm px-3 py-1">
                ${totalDue} Due
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-success/20 text-success border-success/30 text-sm px-3 py-1">
                All Cleared
              </Badge>
            )}
          </div>
        </div>

        {/* Rest of the content - same as before */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger
              value="info"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Info
            </TabsTrigger>
            <TabsTrigger
              value="finance"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Finance
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6">
            <FinancialSettingsCard student={student} onUpdate={handleUpdateStudent} />
            <DocumentsSection student={student} onUpdate={handleUpdateStudent} />

            <div className="grid gap-6 md:grid-cols-2">
              {/* Personal Details */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-foreground">{student.phone}</p>
                    </div>
                  </div>
                  {student.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-foreground">{student.email}</p>
                      </div>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Home Address</p>
                        <p className="text-foreground">{student.address}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Check-in Date</p>
                      <p className="text-foreground">{new Date(student.checkInDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Room Assignment</p>
                      <p className="text-foreground">
                        Room {room?.roomNumber} - Bed {bedLabel} ({room?.type})
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-danger" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student.emergencyContact ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="text-foreground">{student.emergencyContact.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-foreground">{student.emergencyContact.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Relation</p>
                        <p className="text-foreground">{student.emergencyContact.relation}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No emergency contact on file</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/20">
                      <DollarSign className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="text-xl font-bold text-success">${totalPaid}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-danger/20">
                      <DollarSign className="h-5 w-5 text-danger" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                      <p className="text-xl font-bold text-danger">${totalDue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${student.securityDepositStatus === "Paid" ? "bg-success/20" : "bg-warning/20"}`}
                    >
                      <DollarSign
                        className={`h-5 w-5 ${student.securityDepositStatus === "Paid" ? "text-success" : "text-warning"}`}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Security Deposit</p>
                      <p
                        className={`text-xl font-bold ${student.securityDepositStatus === "Paid" ? "text-success" : "text-warning"}`}
                      >
                        {student.securityDepositStatus || "Pending"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Type</TableHead>
                      <TableHead className="text-muted-foreground">Description</TableHead>
                      <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                      <TableHead className="text-muted-foreground text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id} className="border-border">
                          <TableCell className="text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-foreground">{transaction.type}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {transaction.description || transaction.month}
                          </TableCell>
                          <TableCell className="text-right text-foreground font-medium">
                            ${transaction.amount}
                          </TableCell>
                          <TableCell className="text-center">
                            {transaction.status === "Paid" ? (
                              <Badge className="bg-success/20 text-success border-success/30">Paid</Badge>
                            ) : (
                              <Badge className="bg-danger/20 text-danger border-danger/30">Unpaid</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No activity records found</p>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border"
                      >
                        <div className="p-2 rounded-lg bg-primary/20 text-primary">{getActivityIcon(log.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-foreground capitalize">{log.type.replace("_", " ")}</p>
                            <Badge className={getStatusColor(log.status)}>{log.status || "N/A"}</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">{log.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(log.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
