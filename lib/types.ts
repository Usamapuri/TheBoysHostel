// Data types for the hostel management system

export interface Location {
  id: string
  name: string
  tenantId?: string // Optional for frontend, handled on server
}

export interface Room {
  id: string
  roomNumber: string
  floor: number
  capacity: number
  type: "AC" | "Non-AC"
  baseMonthlyRent: number
  locationId: string
  beds: Bed[]
}

export interface Bed {
  id: string
  roomId: string
  label: string // e.g., "A", "B"
  isOccupied: boolean
  studentId?: string
}

export interface Student {
  id: string
  name: string
  phone: string
  email?: string
  bedId: string
  roomId: string
  checkInDate: string
  emergencyContact?: {
    name: string
    phone: string
    relation: string
  }
  address?: string
  securityDeposit?: number
  securityDepositStatus?: "Paid" | "Pending" | "Refunded"
  monthlyRent?: number
  adminNotes?: string
  idProofUrl?: string
}

export interface Transaction {
  id: string
  studentId: string
  amount: number
  type: "Rent" | "Deposit" | "Fine" | "Penalty" | "Damage"
  status: "Paid" | "Unpaid"
  date: string
  dueDate?: string
  month: string // e.g., "January 2026"
  description?: string
}

export interface Expense {
  id: string
  date: string
  month: string
  category: "Utility" | "Maintenance" | "Salary" | "Supplies" | "Staff" | "Other"
  amount: number
  description: string
  vendorName?: string
  receiptUrl?: string
}

export interface ActivityLog {
  id: string
  studentId: string
  type: "gate_pass" | "visitor" | "complaint" | "notice"
  description: string
  date: string
  status?: "approved" | "pending" | "rejected"
}

export interface MaintenanceTask {
  id: string
  roomId: string
  roomNumber: string
  title: string
  description: string
  category: "Plumbing" | "Electrical" | "Furniture" | "Internet" | "Other"
  priority: "Low" | "Medium" | "High"
  status: "Reported" | "In Progress" | "Awaiting Parts" | "Completed"
  dateReported: string
  dateCompleted?: string
  cost?: number
}

export interface HostelData {
  locations: Location[]
  rooms: Room[]
  students: Student[]
  transactions: Transaction[]
  expenses: Expense[]
  activityLogs: ActivityLog[]
  maintenanceTasks: MaintenanceTask[]
}

