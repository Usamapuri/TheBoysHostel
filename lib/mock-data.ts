import type { HostelData, Room, Student, Transaction, ActivityLog, Expense, MaintenanceTask, Location } from "./types"

// Initial locations
const initialLocations: Location[] = [
  { id: "loc-main", name: "Main Building" },
  { id: "loc-wing-a", name: "Wing A" },
  { id: "loc-wing-b", name: "Wing B" },
]

// Generate initial rooms with beds
const generateRooms = (): Room[] => {
  const rooms: Room[] = []
  const floors = [1, 2, 3]
  const locationIds = ["loc-main", "loc-wing-a", "loc-wing-b"]

  floors.forEach((floor) => {
    for (let i = 1; i <= 4; i++) {
      const roomNumber = `${floor}0${i}`
      const capacity = i % 2 === 0 ? 3 : 2
      const locationIndex = (floor - 1 + Math.floor((i - 1) / 2)) % 3
      const room: Room = {
        id: `room-${roomNumber}`,
        roomNumber,
        floor,
        capacity,
        type: floor === 3 ? "AC" : "Non-AC",
        baseMonthlyRent: floor === 3 ? 8000 : 6000,
        locationId: locationIds[locationIndex],
        beds: Array.from({ length: capacity }, (_, idx) => ({
          id: `bed-${roomNumber}-${String.fromCharCode(65 + idx)}`,
          roomId: `room-${roomNumber}`,
          label: String.fromCharCode(65 + idx),
          isOccupied: false,
        })),
      }
      rooms.push(room)
    }
  })

  return rooms
}

// Initial students (some pre-checked in)
const initialStudents: Student[] = [
  {
    id: "s1",
    name: "Rahul Sharma",
    phone: "9876543210",
    email: "rahul.sharma@email.com",
    bedId: "bed-101-A",
    roomId: "room-101",
    checkInDate: "2025-12-01",
    emergencyContact: { name: "Priya Sharma", phone: "9876543220", relation: "Mother" },
    address: "123 Main Street, Mumbai",
    securityDeposit: 500,
    securityDepositStatus: "Paid",
  },
  {
    id: "s2",
    name: "Amit Kumar",
    phone: "9876543211",
    email: "amit.kumar@email.com",
    bedId: "bed-101-B",
    roomId: "room-101",
    checkInDate: "2025-12-05",
    emergencyContact: { name: "Suresh Kumar", phone: "9876543221", relation: "Father" },
    address: "456 Park Avenue, Delhi",
    securityDeposit: 500,
    securityDepositStatus: "Paid",
  },
  {
    id: "s3",
    name: "Vikram Singh",
    phone: "9876543212",
    email: "vikram.singh@email.com",
    bedId: "bed-102-A",
    roomId: "room-102",
    checkInDate: "2025-11-15",
    emergencyContact: { name: "Meena Singh", phone: "9876543222", relation: "Mother" },
    address: "789 Lake Road, Pune",
    securityDeposit: 500,
    securityDepositStatus: "Paid",
  },
  {
    id: "s4",
    name: "Sanjay Patel",
    phone: "9876543213",
    email: "sanjay.patel@email.com",
    bedId: "bed-201-A",
    roomId: "room-201",
    checkInDate: "2025-12-10",
    emergencyContact: { name: "Ramesh Patel", phone: "9876543223", relation: "Father" },
    address: "321 Garden Lane, Ahmedabad",
    securityDeposit: 500,
    securityDepositStatus: "Pending",
  },
  {
    id: "s5",
    name: "Arjun Reddy",
    phone: "9876543214",
    email: "arjun.reddy@email.com",
    bedId: "bed-203-B",
    roomId: "room-203",
    checkInDate: "2025-11-20",
    emergencyContact: { name: "Lakshmi Reddy", phone: "9876543224", relation: "Mother" },
    address: "654 Hill View, Hyderabad",
    securityDeposit: 500,
    securityDepositStatus: "Paid",
  },
  {
    id: "s6",
    name: "Karan Malhotra",
    phone: "9876543215",
    email: "karan.malhotra@email.com",
    bedId: "bed-301-A",
    roomId: "room-301",
    checkInDate: "2026-01-02",
    emergencyContact: { name: "Neeta Malhotra", phone: "9876543225", relation: "Mother" },
    address: "987 River Side, Bangalore",
    securityDeposit: 500,
    securityDepositStatus: "Paid",
  },
  {
    id: "s7",
    name: "Aman Gupta",
    phone: "9876543216",
    email: "aman.gupta@email.com",
    bedId: "",
    roomId: "",
    checkInDate: "2026-01-10",
    emergencyContact: { name: "Sunil Gupta", phone: "9876543226", relation: "Father" },
    address: "159 Sky Tower, Indore",
    securityDeposit: 500,
    securityDepositStatus: "Paid",
  },
  {
    id: "s8",
    name: "Ishaan Verma",
    phone: "9876543217",
    email: "ishaan.verma@email.com",
    bedId: "",
    roomId: "",
    checkInDate: "2026-01-11",
    emergencyContact: { name: "Renu Verma", phone: "9876543227", relation: "Mother" },
    address: "753 Green Park, Jaipur",
    securityDeposit: 500,
    securityDepositStatus: "Pending",
  },
]

// Initial transactions
const initialTransactions: Transaction[] = [
  {
    id: "t1",
    studentId: "s1",
    amount: 500,
    type: "Deposit",
    status: "Paid",
    date: "2025-12-01",
    month: "December 2025",
  },
  { id: "t2", studentId: "s1", amount: 500, type: "Rent", status: "Paid", date: "2025-12-01", month: "December 2025" },
  {
    id: "t3",
    studentId: "s2",
    amount: 500,
    type: "Deposit",
    status: "Paid",
    date: "2025-12-05",
    month: "December 2025",
  },
  {
    id: "t4",
    studentId: "s2",
    amount: 500,
    type: "Rent",
    status: "Unpaid",
    date: "2025-12-05",
    month: "December 2025",
  },
  {
    id: "t5",
    studentId: "s3",
    amount: 500,
    type: "Rent",
    status: "Unpaid",
    date: "2025-12-01",
    month: "December 2025",
  },
  {
    id: "t6",
    studentId: "s4",
    amount: 500,
    type: "Deposit",
    status: "Paid",
    date: "2025-12-10",
    month: "December 2025",
  },
  { id: "t7", studentId: "s5", amount: 500, type: "Rent", status: "Paid", date: "2025-12-01", month: "December 2025" },
]

// Initial activity logs
const initialActivityLogs: ActivityLog[] = [
  {
    id: "a1",
    studentId: "s1",
    type: "gate_pass",
    description: "Weekend leave - Going home",
    date: "2025-12-20",
    status: "approved",
  },
  {
    id: "a2",
    studentId: "s1",
    type: "visitor",
    description: "Parent visit - Priya Sharma",
    date: "2025-12-15",
    status: "approved",
  },
  {
    id: "a3",
    studentId: "s2",
    type: "complaint",
    description: "AC not working properly",
    date: "2025-12-18",
    status: "pending",
  },
  {
    id: "a4",
    studentId: "s3",
    type: "gate_pass",
    description: "Medical appointment",
    date: "2025-12-22",
    status: "approved",
  },
  {
    id: "a5",
    studentId: "s4",
    type: "notice",
    description: "Late fee payment warning",
    date: "2025-12-25",
    status: "pending",
  },
]

const initialExpenses: Expense[] = [
  {
    id: "exp1",
    date: "2025-12-01",
    month: "December 2025",
    category: "Utility",
    amount: 2000,
    description: "Electricity bill",
  },
  {
    id: "exp2",
    date: "2025-12-05",
    month: "December 2025",
    category: "Maintenance",
    amount: 1500,
    description: "Plumbing repairs",
  },
  {
    id: "exp3",
    date: "2025-12-10",
    month: "December 2025",
    category: "Salary",
    amount: 5000,
    description: "Staff salary - Maintenance",
  },
  {
    id: "exp4",
    date: "2026-01-02",
    month: "January 2026",
    category: "Utility",
    amount: 2200,
    description: "Electricity bill",
  },
]

const initialMaintenanceTasks: MaintenanceTask[] = [
  {
    id: "mt1",
    roomId: "room-101",
    roomNumber: "101",
    title: "AC not cooling properly",
    description: "Room 101 AC is not cooling efficiently. May need servicing or gas refill.",
    category: "Electrical",
    priority: "High",
    status: "In Progress",
    dateReported: "2026-01-05",
  },
  {
    id: "mt2",
    roomId: "room-102",
    roomNumber: "102",
    title: "Bathroom tap leakage",
    description: "Hot water tap is leaking continuously. Needs valve replacement.",
    category: "Plumbing",
    priority: "Medium",
    status: "Reported",
    dateReported: "2026-01-08",
  },
  {
    id: "mt3",
    roomId: "room-201",
    roomNumber: "201",
    title: "Broken bed frame",
    description: "Bed frame in corner is broken and unsafe. Needs replacement.",
    category: "Furniture",
    priority: "High",
    status: "Awaiting Parts",
    dateReported: "2026-01-03",
  },
  {
    id: "mt4",
    roomId: "room-203",
    roomNumber: "203",
    title: "WiFi router not working",
    description: "Internet connection lost. Router may need reset or replacement.",
    category: "Internet",
    priority: "Low",
    status: "Completed",
    dateReported: "2025-12-28",
    dateCompleted: "2026-01-06",
  },
  {
    id: "mt5",
    roomId: "room-301",
    roomNumber: "301",
    title: "Light bulb replacement",
    description: "Main ceiling light is not working.",
    category: "Electrical",
    priority: "Low",
    status: "Reported",
    dateReported: "2026-01-09",
  },
]

// Create initial data with occupied beds
export const createInitialData = (): HostelData => {
  const rooms = generateRooms()

  // Mark beds as occupied based on students
  initialStudents.forEach((student) => {
    const room = rooms.find((r) => r.id === student.roomId)
    if (room) {
      const bed = room.beds.find((b) => b.id === student.bedId)
      if (bed) {
        bed.isOccupied = true
        bed.studentId = student.id
      }
    }
  })

  return {
    locations: initialLocations,
    rooms,
    students: initialStudents,
    transactions: initialTransactions,
    expenses: initialExpenses,
    activityLogs: initialActivityLogs,
    maintenanceTasks: initialMaintenanceTasks,
  }
}

export const STORAGE_KEY = "hostel-data"
