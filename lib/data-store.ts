import { createInitialData, STORAGE_KEY } from "./mock-data"
import type { HostelData, Student, Transaction, ActivityLog, Room, Expense, MaintenanceTask, Location } from "./types"

// Initialize or get data from localStorage
export const getData = (): HostelData => {
  if (typeof window === "undefined") {
    return createInitialData()
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const parsed = JSON.parse(stored) as HostelData
    if (!parsed.activityLogs) {
      parsed.activityLogs = []
    }
    if (!parsed.expenses) {
      parsed.expenses = []
    }
    if (!parsed.maintenanceTasks) {
      parsed.maintenanceTasks = []
    }
    // Migration: add default locations if missing
    if (!parsed.locations) {
      parsed.locations = [
        { id: "loc-main", name: "Main Building" },
        { id: "loc-wing-a", name: "Wing A" },
        { id: "loc-wing-b", name: "Wing B" },
      ]
    }
    return parsed
  }

  const initialData = createInitialData()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData))
  return initialData
}

// Save data to localStorage
export const saveData = (data: HostelData): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

// Check in a student to a bed
export const checkInStudent = (
  data: HostelData,
  bedId: string,
  roomId: string,
  studentName: string,
  studentPhone: string,
): HostelData => {
  const studentId = `s${Date.now()}`
  const newStudent: Student = {
    id: studentId,
    name: studentName,
    phone: studentPhone,
    bedId,
    roomId,
    checkInDate: new Date().toISOString().split("T")[0],
  }

  // Update room bed status
  const updatedRooms = data.rooms.map((room) => {
    if (room.id === roomId) {
      return {
        ...room,
        beds: room.beds.map((bed) => (bed.id === bedId ? { ...bed, isOccupied: true, studentId } : bed)),
      }
    }
    return room
  })

  // Add deposit transaction
  const depositTransaction: Transaction = {
    id: `t${Date.now()}`,
    studentId,
    amount: 500,
    type: "Deposit",
    status: "Paid",
    date: new Date().toISOString().split("T")[0],
    month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  }

  const newData = {
    ...data,
    rooms: updatedRooms,
    students: [...data.students, newStudent],
    transactions: [...data.transactions, depositTransaction],
  }

  saveData(newData)
  return newData
}

// Assign an existing student to a bed (for registered students not yet assigned)
export const assignStudentToBed = (
  data: HostelData,
  studentId: string,
  bedId: string,
  roomId: string,
): HostelData => {
  // Update room bed status
  const updatedRooms = data.rooms.map((room) => {
    if (room.id === roomId) {
      return {
        ...room,
        beds: room.beds.map((bed) => (bed.id === bedId ? { ...bed, isOccupied: true, studentId } : bed)),
      }
    }
    return room
  })

  // Update student's bed and room assignment
  const updatedStudents = data.students.map((s) =>
    s.id === studentId ? { ...s, bedId, roomId } : s,
  )

  const newData = {
    ...data,
    rooms: updatedRooms,
    students: updatedStudents,
  }

  saveData(newData)
  return newData
}

// Generate monthly bills
export const generateMonthlyBills = (data: HostelData): HostelData => {
  const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  // Check which students already have rent for this month
  const existingRentStudentIds = new Set(
    data.transactions.filter((t) => t.type === "Rent" && t.month === currentMonth).map((t) => t.studentId),
  )

  // Generate rent for students without rent this month
  const newTransactions: Transaction[] = data.students
    .filter((student) => !existingRentStudentIds.has(student.id))
    .map((student) => ({
      id: `t${Date.now()}-${student.id}`,
      studentId: student.id,
      amount: 500,
      type: "Rent" as const,
      status: "Unpaid" as const,
      date: new Date().toISOString().split("T")[0],
      month: currentMonth,
    }))

  const newData = {
    ...data,
    transactions: [...data.transactions, ...newTransactions],
  }

  saveData(newData)
  return newData
}

// Mark transaction as paid
export const markAsPaid = (data: HostelData, transactionId: string): HostelData => {
  const updatedTransactions = data.transactions.map((t) =>
    t.id === transactionId ? { ...t, status: "Paid" as const } : t,
  )

  const newData = {
    ...data,
    transactions: updatedTransactions,
  }

  saveData(newData)
  return newData
}

// Calculate KPIs
export const calculateKPIs = (data: HostelData, selectedMonth?: string) => {
  const totalBeds = data.rooms.reduce((acc, room) => acc + room.beds.length, 0)
  const occupiedBeds = data.rooms.reduce((acc, room) => acc + room.beds.filter((b) => b.isOccupied).length, 0)

  const filterMonth = selectedMonth || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const filteredTransactions = selectedMonth
    ? data.transactions.filter((t) => t.month === filterMonth)
    : data.transactions.filter(
      (t) => t.month === new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    )
  const filteredExpenses = selectedMonth
    ? data.expenses.filter((e) => e.month === filterMonth)
    : data.expenses.filter(
      (e) => e.month === new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    )

  const revenue = filteredTransactions
    .filter((t) => t.status === "Paid" && (t.type === "Rent" || t.type === "Deposit"))
    .reduce((acc, t) => acc + t.amount, 0)
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0)
  const outstanding = filteredTransactions.filter((t) => t.status === "Unpaid").reduce((acc, t) => acc + t.amount, 0)

  return {
    occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
    totalCollected: revenue,
    totalOutstanding: outstanding,
    totalExpenses,
    netProfit: revenue - totalExpenses,
    pendingMaintenance: data.maintenanceTasks.filter((t) => t.status !== "Completed").length,
  }
}

export const addStudent = (
  data: HostelData,
  studentData: {
    name: string
    phone: string
    email?: string
    roomId?: string
    bedId?: string
    checkInDate: string
    emergencyContact?: { name: string; phone: string; relation: string }
    address?: string
  },
): HostelData => {
  const studentId = `s${Date.now()}`
  const newStudent: Student = {
    id: studentId,
    name: studentData.name,
    phone: studentData.phone,
    email: studentData.email,
    bedId: studentData.bedId || "",
    roomId: studentData.roomId || "",
    checkInDate: studentData.checkInDate,
    emergencyContact: studentData.emergencyContact,
    address: studentData.address,
    securityDeposit: 500,
    securityDepositStatus: "Pending",
  }

  // Update room bed status only if roomId and bedId are provided
  let updatedRooms = data.rooms
  if (studentData.roomId && studentData.bedId) {
    updatedRooms = data.rooms.map((room) => {
      if (room.id === studentData.roomId) {
        return {
          ...room,
          beds: room.beds.map((bed) => (bed.id === studentData.bedId ? { ...bed, isOccupied: true, studentId } : bed)),
        }
      }
      return room
    })
  }

  // Add deposit transaction
  const depositTransaction: Transaction = {
    id: `t${Date.now()}`,
    studentId,
    amount: 500,
    type: "Deposit",
    status: "Unpaid",
    date: new Date().toISOString().split("T")[0],
    month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    description: "Security Deposit",
  }

  const newData = {
    ...data,
    rooms: updatedRooms,
    students: [...data.students, newStudent],
    transactions: [...data.transactions, depositTransaction],
  }

  saveData(newData)
  return newData
}

export const updateStudent = (data: HostelData, studentId: string, updates: Partial<Student>): HostelData => {
  const updatedStudents = data.students.map((s) => (s.id === studentId ? { ...s, ...updates } : s))

  const newData = {
    ...data,
    students: updatedStudents,
  }

  saveData(newData)
  return newData
}

export const deleteStudent = (data: HostelData, studentId: string): HostelData => {
  const student = data.students.find((s) => s.id === studentId)
  if (!student) return data

  // Free up the bed
  const updatedRooms = data.rooms.map((room) => {
    if (room.id === student.roomId) {
      return {
        ...room,
        beds: room.beds.map((bed) =>
          bed.id === student.bedId ? { ...bed, isOccupied: false, studentId: undefined } : bed,
        ),
      }
    }
    return room
  })

  const newData = {
    ...data,
    rooms: updatedRooms,
    students: data.students.filter((s) => s.id !== studentId),
    // Keep transactions for record, but could optionally archive them
  }

  saveData(newData)
  return newData
}

export const getStudentById = (data: HostelData, studentId: string): Student | undefined => {
  return data.students.find((s) => s.id === studentId)
}

export const getStudentTransactions = (data: HostelData, studentId: string): Transaction[] => {
  return data.transactions.filter((t) => t.studentId === studentId)
}

export const getStudentActivityLogs = (data: HostelData, studentId: string): ActivityLog[] => {
  return (data.activityLogs || []).filter((a) => a.studentId === studentId)
}

export const addActivityLog = (data: HostelData, log: Omit<ActivityLog, "id">): HostelData => {
  const newLog: ActivityLog = {
    ...log,
    id: `a${Date.now()}`,
  }

  const newData = {
    ...data,
    activityLogs: [...(data.activityLogs || []), newLog],
  }

  saveData(newData)
  return newData
}

// Transfer student between beds
export const transferStudent = (
  data: HostelData,
  studentId: string,
  newBedId: string,
  newRoomId: string,
): HostelData => {
  const student = data.students.find((s) => s.id === studentId)
  if (!student) return data

  // Free up the old bed
  const updatedRooms = data.rooms.map((room) => {
    if (room.id === student.roomId) {
      return {
        ...room,
        beds: room.beds.map((bed) =>
          bed.id === student.bedId ? { ...bed, isOccupied: false, studentId: undefined } : bed,
        ),
      }
    }
    // Assign to new bed
    if (room.id === newRoomId) {
      return {
        ...room,
        beds: room.beds.map((bed) => (bed.id === newBedId ? { ...bed, isOccupied: true, studentId } : bed)),
      }
    }
    return room
  })

  // Update student's room and bed assignment
  const updatedStudents = data.students.map((s) =>
    s.id === studentId ? { ...s, bedId: newBedId, roomId: newRoomId } : s,
  )

  const newData = {
    ...data,
    rooms: updatedRooms,
    students: updatedStudents,
  }

  saveData(newData)
  return newData
}

// Add a new room
export const addRoom = (
  data: HostelData,
  roomData: {
    roomNumber: string
    floor: number
    capacity: number
    type: "AC" | "Non-AC"
    locationId: string
  },
): HostelData => {
  const roomId = `room-${roomData.roomNumber}`
  const newRoom: Room = {
    id: roomId,
    roomNumber: roomData.roomNumber,
    floor: roomData.floor,
    capacity: roomData.capacity,
    type: roomData.type,
    locationId: roomData.locationId,
    beds: Array.from({ length: roomData.capacity }, (_, idx) => ({
      id: `bed-${roomData.roomNumber}-${String.fromCharCode(65 + idx)}`,
      roomId: roomId,
      label: String.fromCharCode(65 + idx),
      isOccupied: false,
    })),
  }

  const newData = {
    ...data,
    rooms: [...data.rooms, newRoom],
  }

  saveData(newData)
  return newData
}

// Update a room
export const updateRoom = (
  data: HostelData,
  roomId: string,
  updates: Partial<Omit<Room, "id" | "beds">>,
): HostelData => {
  const updatedRooms = data.rooms.map((room) => {
    if (room.id === roomId) {
      const updatedRoom = { ...room, ...updates }
      // If capacity changes, adjust beds
      if (updates.capacity && updates.capacity !== room.capacity) {
        const oldBedCount = room.beds.length
        if (updates.capacity > oldBedCount) {
          // Add new beds
          const newBeds = Array.from({ length: updates.capacity - oldBedCount }, (_, idx) => ({
            id: `bed-${room.roomNumber}-${String.fromCharCode(65 + oldBedCount + idx)}`,
            roomId: roomId,
            label: String.fromCharCode(65 + oldBedCount + idx),
            isOccupied: false,
          }))
          updatedRoom.beds = [...room.beds, ...newBeds]
        } else {
          // Remove beds (only if they're vacant)
          updatedRoom.beds = room.beds.slice(0, updates.capacity)
        }
      }
      return updatedRoom
    }
    return room
  })

  const newData = {
    ...data,
    rooms: updatedRooms,
  }

  saveData(newData)
  return newData
}

// Delete a room
export const deleteRoom = (data: HostelData, roomId: string): HostelData => {
  const room = data.rooms.find((r) => r.id === roomId)
  if (!room) return data

  // Don't delete if room has occupied beds
  if (room.beds.some((b) => b.isOccupied)) {
    console.warn("Cannot delete room with occupied beds")
    return data
  }

  const newData = {
    ...data,
    rooms: data.rooms.filter((r) => r.id !== roomId),
  }

  saveData(newData)
  return newData
}

// Expense management functions
export const addExpense = (
  data: HostelData,
  expenseData: {
    date: string
    month: string
    category: "Utility" | "Maintenance" | "Salary" | "Other"
    amount: number
    description: string
  },
): HostelData => {
  const newExpense: Expense = {
    id: `exp${Date.now()}`,
    ...expenseData,
  }

  const newData = {
    ...data,
    expenses: [...data.expenses, newExpense],
  }

  saveData(newData)
  return newData
}

export const deleteExpense = (data: HostelData, expenseId: string): HostelData => {
  const newData = {
    ...data,
    expenses: data.expenses.filter((e) => e.id !== expenseId),
  }

  saveData(newData)
  return newData
}

export const addOneOffCharge = (
  data: HostelData,
  studentId: string,
  type: "Penalty" | "Damage",
  amount: number,
  description: string,
): HostelData => {
  const newTransaction: Transaction = {
    id: `t${Date.now()}`,
    studentId,
    amount,
    type,
    status: "Unpaid",
    date: new Date().toISOString().split("T")[0],
    month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    description,
  }

  const newData = {
    ...data,
    transactions: [...data.transactions, newTransaction],
  }

  saveData(newData)
  return newData
}

export const updateRentAmount = (data: HostelData, transactionId: string, newAmount: number): HostelData => {
  const updatedTransactions = data.transactions.map((t) => (t.id === transactionId ? { ...t, amount: newAmount } : t))

  const newData = {
    ...data,
    transactions: updatedTransactions,
  }

  saveData(newData)
  return newData
}

// Maintenance task management functions
export const addMaintenanceTask = (
  data: HostelData,
  taskData: {
    roomId: string
    roomNumber: string
    title: string
    description: string
    category: "Plumbing" | "Electrical" | "Furniture" | "Internet" | "Other"
    priority: "Low" | "Medium" | "High"
  },
): HostelData => {
  const newTask: MaintenanceTask = {
    id: `mt${Date.now()}`,
    ...taskData,
    status: "Reported",
    dateReported: new Date().toISOString().split("T")[0],
  }

  const newData = {
    ...data,
    maintenanceTasks: [...data.maintenanceTasks, newTask],
  }

  saveData(newData)
  return newData
}

export const updateMaintenanceTask = (
  data: HostelData,
  taskId: string,
  updates: Partial<Omit<MaintenanceTask, "id">>,
): HostelData => {
  const updatedTasks = data.maintenanceTasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t))

  const newData = {
    ...data,
    maintenanceTasks: updatedTasks,
  }

  saveData(newData)
  return newData
}

export const deleteMaintenanceTask = (data: HostelData, taskId: string): HostelData => {
  const newData = {
    ...data,
    maintenanceTasks: data.maintenanceTasks.filter((t) => t.id !== taskId),
  }

  saveData(newData)
  return newData
}

export const completeMaintenanceTask = (data: HostelData, taskId: string, cost?: number): HostelData => {
  const newData = updateMaintenanceTask(data, taskId, {
    status: "Completed",
    dateCompleted: new Date().toISOString().split("T")[0],
    cost,
  })

  // If cost is provided, add to expenses
  if (cost) {
    return addExpense(newData, {
      date: new Date().toISOString().split("T")[0],
      month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      category: "Maintenance",
      amount: cost,
      description: `Repair for Room ${data.maintenanceTasks.find((t) => t.id === taskId)?.roomNumber || "Unknown"}`,
    })
  }

  return newData
}

// Location management functions
export const addLocation = (data: HostelData, name: string): HostelData => {
  const newLocation: Location = {
    id: `loc-${Date.now()}`,
    name,
  }

  const newData = {
    ...data,
    locations: [...data.locations, newLocation],
  }

  saveData(newData)
  return newData
}

export const updateLocation = (data: HostelData, locationId: string, name: string): HostelData => {
  const updatedLocations = data.locations.map((loc) =>
    loc.id === locationId ? { ...loc, name } : loc,
  )

  const newData = {
    ...data,
    locations: updatedLocations,
  }

  saveData(newData)
  return newData
}

export const deleteLocation = (
  data: HostelData,
  locationId: string,
): { success: boolean; data: HostelData; error?: string } => {
  // Check if any rooms use this location
  const roomsInLocation = data.rooms.filter((room) => room.locationId === locationId)

  if (roomsInLocation.length > 0) {
    return {
      success: false,
      data,
      error: `Cannot delete location: ${roomsInLocation.length} room(s) are assigned to this location.`,
    }
  }

  const newData = {
    ...data,
    locations: data.locations.filter((loc) => loc.id !== locationId),
  }

  saveData(newData)
  return { success: true, data: newData }
}

export const getLocationById = (data: HostelData, locationId: string): Location | undefined => {
  return data.locations.find((loc) => loc.id === locationId)
}

