"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { RoomGrid } from "@/components/room-grid/room-grid"
import { StudentTable } from "@/components/students/student-table"
import { TransactionLedger } from "@/components/finance/transaction-ledger"
import { BillingActions } from "@/components/finance/billing-actions"
import { MonthPicker } from "@/components/finance/month-picker"
import { FinanceKPICards } from "@/components/finance/finance-kpi-cards"
import { ExpensesTable } from "@/components/finance/expenses-table"
import { AddExpenseDialog } from "@/components/finance/add-expense-dialog"
import { AddChargeDialog } from "@/components/finance/add-charge-dialog"
import { KanbanBoard } from "@/components/maintenance/kanban-board"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useHostelData } from "@/hooks/use-hostel-data"
import { Loader2 } from "lucide-react"
import { calculateKPIs } from "@/lib/data-store"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const {
    data,
    isLoading,
    kpis,
    handleCheckIn,
    handleGenerateBills,
    handleMarkAsPaid,
    handleAddStudent,
    handleUpdateStudent,
    handleDeleteStudent,
    handleAddRoom,
    handleUpdateRoom,
    handleDeleteRoom,
    handleTransferStudent,
    handleAddExpense,
    handleDeleteExpense,
    handleAddOneOffCharge,
    handleUpdateRent,
    handleAddMaintenanceTask,
    handleUpdateMaintenanceTask,
    handleDeleteMaintenanceTask,
    handleCompleteMaintenanceTask,
    handleAddLocation,
    handleUpdateLocation,
    handleDeleteLocation,
    handleAssignStudent,
  } = useHostelData()

  if (isLoading || !data || !kpis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const occupiedBeds = data.rooms.reduce((acc, room) => acc + room.beds.filter((b) => b.isOccupied).length, 0)

  const allMonths = Array.from(
    new Set([...data.transactions.map((t) => t.month), ...data.expenses.map((e) => e.month)]),
  ).sort((a, b) => new Date(`1 ${b}`) - new Date(`1 ${a}`)) as string[]

  const monthlyKPIs = selectedMonth ? calculateKPIs(data, selectedMonth) : kpis

  const filteredTransactions = selectedMonth
    ? data.transactions.filter((t) => t.month === selectedMonth)
    : data.transactions
  const filteredExpenses = selectedMonth ? data.expenses.filter((e) => e.month === selectedMonth) : data.expenses

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Command Center</h2>
              <p className="text-muted-foreground">Overview of hostel operations</p>
            </div>
            <KPICards
              occupancyRate={kpis.occupancyRate}
              totalCollected={kpis.totalCollected}
              totalOutstanding={kpis.totalOutstanding}
              pendingMaintenance={kpis.pendingMaintenance}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
                <TransactionLedger
                  transactions={data.transactions.slice(0, 5)}
                  students={data.students}
                  onMarkAsPaid={handleMarkAsPaid}
                  onUpdateRent={handleUpdateRent}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <BillingActions onGenerateBills={handleGenerateBills} occupiedBeds={occupiedBeds} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "rooms" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Rooms & Occupancy</h2>
              <p className="text-muted-foreground">Manage rooms, check-in students, and transfer between beds</p>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success/50 border border-success" />
                <span className="text-sm text-muted-foreground">Vacant - Click to check-in</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-danger/50 border border-danger" />
                <span className="text-sm text-muted-foreground">Occupied - Click to transfer</span>
              </div>
            </div>
            <RoomGrid
              rooms={data.rooms}
              students={data.students}
              locations={data.locations}
              onCheckIn={handleCheckIn}
              onAddRoom={handleAddRoom}
              onEditRoom={handleUpdateRoom}
              onDeleteRoom={handleDeleteRoom}
              onTransferStudent={handleTransferStudent}
              onAssignStudent={handleAssignStudent}
              onAddLocation={handleAddLocation}
              onUpdateLocation={handleUpdateLocation}
              onDeleteLocation={handleDeleteLocation}
            />
          </div>
        )}

        {activeTab === "students" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Student Directory</h2>
              <p className="text-muted-foreground">{data.students.length} students currently residing</p>
            </div>
            <StudentTable
              students={data.students}
              transactions={data.transactions}
              rooms={data.rooms}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          </div>
        )}

        {activeTab === "finance" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Finance & Billing</h2>
              <p className="text-muted-foreground">Advanced accounting and expense management</p>
            </div>

            <div className="flex items-center justify-between">
              <MonthPicker selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} availableMonths={allMonths} />
            </div>

            <FinanceKPICards
              totalRevenue={monthlyKPIs.totalCollected}
              totalExpenses={monthlyKPIs.totalExpenses}
              netProfit={monthlyKPIs.netProfit}
              outstandingDues={monthlyKPIs.totalOutstanding}
            />

            <Tabs defaultValue="income" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="income">Income (Students)</TabsTrigger>
                <TabsTrigger value="expenses">Expenses (Hostel)</TabsTrigger>
              </TabsList>

              {/* Income tab with transaction ledger and one-off charges */}
              <TabsContent value="income" className="space-y-4">
                <AddChargeDialog students={data.students} onAddCharge={handleAddOneOffCharge} />
                <TransactionLedger
                  transactions={filteredTransactions}
                  students={data.students}
                  onMarkAsPaid={handleMarkAsPaid}
                  onUpdateRent={handleUpdateRent}
                />
              </TabsContent>

              {/* Expenses tab with expense table */}
              <TabsContent value="expenses" className="space-y-4">
                <AddExpenseDialog onAddExpense={handleAddExpense} />
                <ExpensesTable expenses={filteredExpenses} onDeleteExpense={handleDeleteExpense} />
              </TabsContent>
            </Tabs>

            {/* Billing actions card */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Billing</h3>
              <BillingActions onGenerateBills={handleGenerateBills} occupiedBeds={occupiedBeds} />
            </div>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Maintenance Dashboard</h2>
              <p className="text-muted-foreground">Track and manage maintenance requests with financial integration</p>
            </div>
            <KanbanBoard
              tasks={data.maintenanceTasks}
              rooms={data.rooms}
              onAddTask={handleAddMaintenanceTask}
              onMoveTask={(taskId, newStatus) => handleUpdateMaintenanceTask(taskId, { status: newStatus })}
              onDeleteTask={handleDeleteMaintenanceTask}
              onCompleteWithCost={handleCompleteMaintenanceTask}
            />
          </div>
        )}
      </main>
    </div>
  )
}
