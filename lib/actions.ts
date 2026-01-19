"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import {
    RoomType,
    StudentStatus,
    DepositStatus,
    TransactionType,
    PaymentStatus,
    ExpenseCategory,
    MaintenanceCategory,
    Priority,
    MaintenanceStatus,
    ActivityType,
    ActivityStatus,
} from "@prisma/client"

// ============================================
// TYPE DEFINITIONS FOR FRONTEND COMPATIBILITY
// ============================================

// These types match the existing frontend expectations
export type Location = {
    id: string
    name: string
}

export type Bed = {
    id: string
    roomId: string
    label: string
    isOccupied: boolean
    studentId?: string
}

export type Room = {
    id: string
    roomNumber: string
    floor: number
    capacity: number
    type: "AC" | "Non-AC"
    locationId: string
    beds: Bed[]
}

export type Student = {
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
}

export type Transaction = {
    id: string
    studentId: string
    amount: number
    type: "Rent" | "Deposit" | "Fine" | "Penalty" | "Damage"
    status: "Paid" | "Unpaid"
    date: string
    month: string
    description?: string
}

export type Expense = {
    id: string
    date: string
    month: string
    category: "Utility" | "Maintenance" | "Salary" | "Other"
    amount: number
    description: string
}

export type ActivityLog = {
    id: string
    studentId: string
    type: "gate_pass" | "visitor" | "complaint" | "notice"
    description: string
    date: string
    status?: "approved" | "pending" | "rejected"
}

export type MaintenanceTask = {
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

export type HostelData = {
    locations: Location[]
    rooms: Room[]
    students: Student[]
    transactions: Transaction[]
    expenses: Expense[]
    activityLogs: ActivityLog[]
    maintenanceTasks: MaintenanceTask[]
}

// ============================================
// HELPER FUNCTIONS FOR TYPE CONVERSION
// ============================================

function mapRoomType(type: RoomType): "AC" | "Non-AC" {
    return type === "AC" ? "AC" : "Non-AC"
}

function mapRoomTypeToDb(type: "AC" | "Non-AC"): RoomType {
    return type === "AC" ? RoomType.AC : RoomType.NON_AC
}

function mapDepositStatus(status: DepositStatus): "Paid" | "Pending" | "Refunded" {
    const map: Record<DepositStatus, "Paid" | "Pending" | "Refunded"> = {
        PAID: "Paid",
        PENDING: "Pending",
        REFUNDED: "Refunded",
    }
    return map[status]
}

function mapTransactionType(type: TransactionType): "Rent" | "Deposit" | "Fine" | "Penalty" | "Damage" {
    const map: Record<TransactionType, "Rent" | "Deposit" | "Fine" | "Penalty" | "Damage"> = {
        RENT: "Rent",
        DEPOSIT: "Deposit",
        FINE: "Fine",
        PENALTY: "Penalty",
        DAMAGE: "Damage",
    }
    return map[type]
}

function mapTransactionTypeToDb(type: "Rent" | "Deposit" | "Fine" | "Penalty" | "Damage"): TransactionType {
    const map: Record<string, TransactionType> = {
        Rent: TransactionType.RENT,
        Deposit: TransactionType.DEPOSIT,
        Fine: TransactionType.FINE,
        Penalty: TransactionType.PENALTY,
        Damage: TransactionType.DAMAGE,
    }
    return map[type]
}

function mapPaymentStatus(status: PaymentStatus): "Paid" | "Unpaid" {
    return status === "PAID" ? "Paid" : "Unpaid"
}

function mapExpenseCategory(category: ExpenseCategory): "Utility" | "Maintenance" | "Salary" | "Other" {
    const map: Record<ExpenseCategory, "Utility" | "Maintenance" | "Salary" | "Other"> = {
        UTILITY: "Utility",
        MAINTENANCE: "Maintenance",
        SALARY: "Salary",
        OTHER: "Other",
    }
    return map[category]
}

function mapExpenseCategoryToDb(category: "Utility" | "Maintenance" | "Salary" | "Other"): ExpenseCategory {
    const map: Record<string, ExpenseCategory> = {
        Utility: ExpenseCategory.UTILITY,
        Maintenance: ExpenseCategory.MAINTENANCE,
        Salary: ExpenseCategory.SALARY,
        Other: ExpenseCategory.OTHER,
    }
    return map[category]
}

function mapActivityType(type: ActivityType): "gate_pass" | "visitor" | "complaint" | "notice" {
    const map: Record<ActivityType, "gate_pass" | "visitor" | "complaint" | "notice"> = {
        GATE_PASS: "gate_pass",
        VISITOR: "visitor",
        COMPLAINT: "complaint",
        NOTICE: "notice",
    }
    return map[type]
}

function mapActivityTypeToDb(type: "gate_pass" | "visitor" | "complaint" | "notice"): ActivityType {
    const map: Record<string, ActivityType> = {
        gate_pass: ActivityType.GATE_PASS,
        visitor: ActivityType.VISITOR,
        complaint: ActivityType.COMPLAINT,
        notice: ActivityType.NOTICE,
    }
    return map[type]
}

function mapActivityStatus(status: ActivityStatus | null): "approved" | "pending" | "rejected" | undefined {
    if (!status) return undefined
    const map: Record<ActivityStatus, "approved" | "pending" | "rejected"> = {
        APPROVED: "approved",
        PENDING: "pending",
        REJECTED: "rejected",
    }
    return map[status]
}

function mapMaintenanceCategory(category: MaintenanceCategory): "Plumbing" | "Electrical" | "Furniture" | "Internet" | "Other" {
    const map: Record<MaintenanceCategory, "Plumbing" | "Electrical" | "Furniture" | "Internet" | "Other"> = {
        PLUMBING: "Plumbing",
        ELECTRICAL: "Electrical",
        FURNITURE: "Furniture",
        INTERNET: "Internet",
        OTHER: "Other",
    }
    return map[category]
}

function mapMaintenanceCategoryToDb(category: "Plumbing" | "Electrical" | "Furniture" | "Internet" | "Other"): MaintenanceCategory {
    const map: Record<string, MaintenanceCategory> = {
        Plumbing: MaintenanceCategory.PLUMBING,
        Electrical: MaintenanceCategory.ELECTRICAL,
        Furniture: MaintenanceCategory.FURNITURE,
        Internet: MaintenanceCategory.INTERNET,
        Other: MaintenanceCategory.OTHER,
    }
    return map[category]
}

function mapPriority(priority: Priority): "Low" | "Medium" | "High" {
    const map: Record<Priority, "Low" | "Medium" | "High"> = {
        LOW: "Low",
        MEDIUM: "Medium",
        HIGH: "High",
    }
    return map[priority]
}

function mapPriorityToDb(priority: "Low" | "Medium" | "High"): Priority {
    const map: Record<string, Priority> = {
        Low: Priority.LOW,
        Medium: Priority.MEDIUM,
        High: Priority.HIGH,
    }
    return map[priority]
}

function mapMaintenanceStatus(status: MaintenanceStatus): "Reported" | "In Progress" | "Awaiting Parts" | "Completed" {
    const map: Record<MaintenanceStatus, "Reported" | "In Progress" | "Awaiting Parts" | "Completed"> = {
        REPORTED: "Reported",
        IN_PROGRESS: "In Progress",
        AWAITING_PARTS: "Awaiting Parts",
        COMPLETED: "Completed",
    }
    return map[status]
}

function mapMaintenanceStatusToDb(status: "Reported" | "In Progress" | "Awaiting Parts" | "Completed"): MaintenanceStatus {
    const map: Record<string, MaintenanceStatus> = {
        "Reported": MaintenanceStatus.REPORTED,
        "In Progress": MaintenanceStatus.IN_PROGRESS,
        "Awaiting Parts": MaintenanceStatus.AWAITING_PARTS,
        "Completed": MaintenanceStatus.COMPLETED,
    }
    return map[status]
}

// ============================================
// DATA FETCHING
// ============================================

export async function getData(): Promise<HostelData> {
    const [locations, rooms, students, transactions, expenses, activityLogs, maintenanceTasks] = await Promise.all([
        prisma.location.findMany(),
        prisma.room.findMany({
            include: {
                beds: {
                    include: {
                        student: true,
                    },
                },
            },
        }),
        prisma.student.findMany(),
        prisma.transaction.findMany(),
        prisma.expense.findMany(),
        prisma.activityLog.findMany(),
        prisma.maintenanceTask.findMany({
            include: {
                room: true,
            },
        }),
    ])

    return {
        locations: locations.map((loc) => ({
            id: loc.id,
            name: loc.name,
        })),
        rooms: rooms.map((room) => ({
            id: room.id,
            roomNumber: room.roomNumber,
            floor: room.floor,
            capacity: room.capacity,
            type: mapRoomType(room.type),
            locationId: room.locationId,
            beds: room.beds.map((bed) => ({
                id: bed.id,
                roomId: bed.roomId,
                label: bed.label,
                isOccupied: bed.isOccupied,
                studentId: bed.student?.id,
            })),
        })),
        students: students.map((s) => ({
            id: s.id,
            name: s.name,
            phone: s.phone,
            email: s.email || undefined,
            bedId: s.bedId || "",
            roomId: s.roomId || "",
            checkInDate: s.checkInDate.toISOString().split("T")[0],
            emergencyContact: s.emergencyContactName
                ? {
                    name: s.emergencyContactName,
                    phone: s.emergencyContactPhone || "",
                    relation: s.emergencyContactRelation || "",
                }
                : undefined,
            address: s.address || undefined,
            securityDeposit: s.securityDeposit || undefined,
            securityDepositStatus: s.securityDepositStatus ? mapDepositStatus(s.securityDepositStatus) : undefined,
        })),
        transactions: transactions.map((t) => ({
            id: t.id,
            studentId: t.studentId,
            amount: t.amount,
            type: mapTransactionType(t.type),
            status: mapPaymentStatus(t.status),
            date: t.date.toISOString().split("T")[0],
            month: t.month,
            description: t.description || undefined,
        })),
        expenses: expenses.map((e) => ({
            id: e.id,
            date: e.date.toISOString().split("T")[0],
            month: e.month,
            category: mapExpenseCategory(e.category),
            amount: e.amount,
            description: e.description,
        })),
        activityLogs: activityLogs.map((a) => ({
            id: a.id,
            studentId: a.studentId,
            type: mapActivityType(a.type),
            description: a.description,
            date: a.date.toISOString().split("T")[0],
            status: mapActivityStatus(a.status),
        })),
        maintenanceTasks: maintenanceTasks.map((m) => ({
            id: m.id,
            roomId: m.roomId,
            roomNumber: m.room.roomNumber,
            title: m.title,
            description: m.description,
            category: mapMaintenanceCategory(m.category),
            priority: mapPriority(m.priority),
            status: mapMaintenanceStatus(m.status),
            dateReported: m.dateReported.toISOString().split("T")[0],
            dateCompleted: m.dateCompleted?.toISOString().split("T")[0],
            cost: m.cost || undefined,
        })),
    }
}

// ============================================
// LOCATION ACTIONS
// ============================================

export async function addLocation(name: string): Promise<Location> {
    const location = await prisma.location.create({
        data: { name },
    })
    revalidatePath("/")
    return { id: location.id, name: location.name }
}

export async function updateLocation(locationId: string, name: string): Promise<void> {
    await prisma.location.update({
        where: { id: locationId },
        data: { name },
    })
    revalidatePath("/")
}

export async function deleteLocation(locationId: string): Promise<{ success: boolean; error?: string }> {
    const roomsInLocation = await prisma.room.count({
        where: { locationId },
    })

    if (roomsInLocation > 0) {
        return {
            success: false,
            error: `Cannot delete location: ${roomsInLocation} room(s) are assigned to this location.`,
        }
    }

    await prisma.location.delete({
        where: { id: locationId },
    })
    revalidatePath("/")
    return { success: true }
}

// ============================================
// ROOM ACTIONS
// ============================================

export async function addRoom(roomData: {
    roomNumber: string
    floor: number
    capacity: number
    type: "AC" | "Non-AC"
    locationId: string
}): Promise<void> {
    const bedsData = Array.from({ length: roomData.capacity }, (_, idx) => ({
        label: String.fromCharCode(65 + idx),
        isOccupied: false,
    }))

    await prisma.room.create({
        data: {
            roomNumber: roomData.roomNumber,
            floor: roomData.floor,
            capacity: roomData.capacity,
            type: mapRoomTypeToDb(roomData.type),
            locationId: roomData.locationId,
            beds: {
                create: bedsData,
            },
        },
    })
    revalidatePath("/")
}

export async function updateRoom(
    roomId: string,
    updates: Partial<{ roomNumber: string; floor: number; capacity: number; type: "AC" | "Non-AC"; locationId: string }>
): Promise<void> {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { beds: true },
    })

    if (!room) return

    const updateData: Record<string, unknown> = {}
    if (updates.roomNumber) updateData.roomNumber = updates.roomNumber
    if (updates.floor) updateData.floor = updates.floor
    if (updates.type) updateData.type = mapRoomTypeToDb(updates.type)
    if (updates.locationId) updateData.locationId = updates.locationId

    // Handle capacity changes
    if (updates.capacity && updates.capacity !== room.capacity) {
        const oldBedCount = room.beds.length
        if (updates.capacity > oldBedCount) {
            // Add new beds
            const newBeds = Array.from({ length: updates.capacity - oldBedCount }, (_, idx) => ({
                roomId,
                label: String.fromCharCode(65 + oldBedCount + idx),
                isOccupied: false,
            }))
            await prisma.bed.createMany({ data: newBeds })
        } else {
            // Remove vacant beds from the end
            const bedsToRemove = room.beds
                .filter((b) => !b.isOccupied)
                .slice(-(oldBedCount - updates.capacity))
                .map((b) => b.id)
            await prisma.bed.deleteMany({
                where: { id: { in: bedsToRemove } },
            })
        }
        updateData.capacity = updates.capacity
    }

    await prisma.room.update({
        where: { id: roomId },
        data: updateData,
    })
    revalidatePath("/")
}

export async function deleteRoom(roomId: string): Promise<{ success: boolean; error?: string }> {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { beds: true },
    })

    if (!room) {
        return { success: false, error: "Room not found" }
    }

    if (room.beds.some((b) => b.isOccupied)) {
        return { success: false, error: "Cannot delete room with occupied beds" }
    }

    await prisma.room.delete({
        where: { id: roomId },
    })
    revalidatePath("/")
    return { success: true }
}

// ============================================
// STUDENT ACTIONS
// ============================================

export async function addStudent(studentData: {
    name: string
    phone: string
    email?: string
    roomId?: string
    bedId?: string
    checkInDate: string
    emergencyContact?: { name: string; phone: string; relation: string }
    address?: string
}): Promise<void> {
    // Create student
    const student = await prisma.student.create({
        data: {
            name: studentData.name,
            phone: studentData.phone,
            email: studentData.email,
            bedId: studentData.bedId || null,
            roomId: studentData.roomId || null,
            checkInDate: new Date(studentData.checkInDate),
            status: StudentStatus.ACTIVE,
            emergencyContactName: studentData.emergencyContact?.name,
            emergencyContactPhone: studentData.emergencyContact?.phone,
            emergencyContactRelation: studentData.emergencyContact?.relation,
            address: studentData.address,
            securityDeposit: 500,
            securityDepositStatus: DepositStatus.PENDING,
        },
    })

    // Mark bed as occupied if assigned
    if (studentData.bedId) {
        await prisma.bed.update({
            where: { id: studentData.bedId },
            data: { isOccupied: true },
        })
    }

    // Create deposit transaction
    await prisma.transaction.create({
        data: {
            studentId: student.id,
            amount: 500,
            type: TransactionType.DEPOSIT,
            status: PaymentStatus.UNPAID,
            date: new Date(),
            month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            description: "Security Deposit",
        },
    })

    revalidatePath("/")
}

export async function updateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
    const updateData: Record<string, unknown> = {}

    if (updates.name) updateData.name = updates.name
    if (updates.phone) updateData.phone = updates.phone
    if (updates.email !== undefined) updateData.email = updates.email || null
    if (updates.address !== undefined) updateData.address = updates.address || null
    if (updates.emergencyContact) {
        updateData.emergencyContactName = updates.emergencyContact.name
        updateData.emergencyContactPhone = updates.emergencyContact.phone
        updateData.emergencyContactRelation = updates.emergencyContact.relation
    }

    await prisma.student.update({
        where: { id: studentId },
        data: updateData,
    })
    revalidatePath("/")
}

export async function deleteStudent(studentId: string): Promise<void> {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
    })

    if (!student) return

    // Free the bed
    if (student.bedId) {
        await prisma.bed.update({
            where: { id: student.bedId },
            data: { isOccupied: false },
        })
    }

    await prisma.student.delete({
        where: { id: studentId },
    })
    revalidatePath("/")
}

export async function assignStudentToBed(studentId: string, bedId: string, roomId: string): Promise<void> {
    // Update bed status
    await prisma.bed.update({
        where: { id: bedId },
        data: { isOccupied: true },
    })

    // Update student
    await prisma.student.update({
        where: { id: studentId },
        data: { bedId, roomId },
    })

    revalidatePath("/")
}

export async function transferStudent(studentId: string, newBedId: string, newRoomId: string): Promise<void> {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
    })

    if (!student) return

    // Free old bed
    if (student.bedId) {
        await prisma.bed.update({
            where: { id: student.bedId },
            data: { isOccupied: false },
        })
    }

    // Occupy new bed
    await prisma.bed.update({
        where: { id: newBedId },
        data: { isOccupied: true },
    })

    // Update student
    await prisma.student.update({
        where: { id: studentId },
        data: { bedId: newBedId, roomId: newRoomId },
    })

    revalidatePath("/")
}

export async function checkInStudent(
    bedId: string,
    roomId: string,
    studentName: string,
    studentPhone: string
): Promise<void> {
    const student = await prisma.student.create({
        data: {
            name: studentName,
            phone: studentPhone,
            bedId,
            roomId,
            checkInDate: new Date(),
            status: StudentStatus.ACTIVE,
            securityDeposit: 500,
            securityDepositStatus: DepositStatus.PENDING,
        },
    })

    await prisma.bed.update({
        where: { id: bedId },
        data: { isOccupied: true },
    })

    await prisma.transaction.create({
        data: {
            studentId: student.id,
            amount: 500,
            type: TransactionType.DEPOSIT,
            status: PaymentStatus.PAID,
            date: new Date(),
            month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        },
    })

    revalidatePath("/")
}

// ============================================
// TRANSACTION ACTIONS
// ============================================

export async function generateMonthlyBills(): Promise<void> {
    const currentMonth = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

    // Get students who already have rent for this month
    const existingRentStudentIds = await prisma.transaction
        .findMany({
            where: {
                type: TransactionType.RENT,
                month: currentMonth,
            },
            select: { studentId: true },
        })
        .then((txs) => txs.map((t) => t.studentId))

    // Get all active students without rent this month
    const studentsWithoutRent = await prisma.student.findMany({
        where: {
            status: StudentStatus.ACTIVE,
            id: { notIn: existingRentStudentIds },
        },
    })

    // Create rent transactions
    await prisma.transaction.createMany({
        data: studentsWithoutRent.map((student) => ({
            studentId: student.id,
            amount: 500,
            type: TransactionType.RENT,
            status: PaymentStatus.UNPAID,
            date: new Date(),
            month: currentMonth,
        })),
    })

    revalidatePath("/")
}

export async function markAsPaid(transactionId: string): Promise<void> {
    await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: PaymentStatus.PAID },
    })
    revalidatePath("/")
}

export async function addOneOffCharge(
    studentId: string,
    type: "Penalty" | "Damage",
    amount: number,
    description: string
): Promise<void> {
    await prisma.transaction.create({
        data: {
            studentId,
            amount,
            type: mapTransactionTypeToDb(type),
            status: PaymentStatus.UNPAID,
            date: new Date(),
            month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            description,
        },
    })
    revalidatePath("/")
}

export async function updateRentAmount(transactionId: string, newAmount: number): Promise<void> {
    await prisma.transaction.update({
        where: { id: transactionId },
        data: { amount: newAmount },
    })
    revalidatePath("/")
}

// ============================================
// EXPENSE ACTIONS
// ============================================

export async function addExpense(expenseData: {
    date: string
    month: string
    category: "Utility" | "Maintenance" | "Salary" | "Other"
    amount: number
    description: string
}): Promise<void> {
    await prisma.expense.create({
        data: {
            date: new Date(expenseData.date),
            month: expenseData.month,
            category: mapExpenseCategoryToDb(expenseData.category),
            amount: expenseData.amount,
            description: expenseData.description,
        },
    })
    revalidatePath("/")
}

export async function deleteExpense(expenseId: string): Promise<void> {
    await prisma.expense.delete({
        where: { id: expenseId },
    })
    revalidatePath("/")
}

// ============================================
// ACTIVITY LOG ACTIONS
// ============================================

export async function addActivityLog(log: Omit<ActivityLog, "id">): Promise<void> {
    await prisma.activityLog.create({
        data: {
            studentId: log.studentId,
            type: mapActivityTypeToDb(log.type),
            description: log.description,
            date: new Date(log.date),
            status: log.status ? (log.status.toUpperCase() as ActivityStatus) : null,
        },
    })
    revalidatePath("/")
}

// ============================================
// MAINTENANCE TASK ACTIONS
// ============================================

export async function addMaintenanceTask(taskData: {
    roomId: string
    roomNumber: string
    title: string
    description: string
    category: "Plumbing" | "Electrical" | "Furniture" | "Internet" | "Other"
    priority: "Low" | "Medium" | "High"
}): Promise<void> {
    await prisma.maintenanceTask.create({
        data: {
            roomId: taskData.roomId,
            title: taskData.title,
            description: taskData.description,
            category: mapMaintenanceCategoryToDb(taskData.category),
            priority: mapPriorityToDb(taskData.priority),
            status: MaintenanceStatus.REPORTED,
            dateReported: new Date(),
        },
    })
    revalidatePath("/")
}

export async function updateMaintenanceTask(
    taskId: string,
    updates: Partial<Omit<MaintenanceTask, "id" | "roomNumber">>
): Promise<void> {
    const updateData: Record<string, unknown> = {}

    if (updates.title) updateData.title = updates.title
    if (updates.description) updateData.description = updates.description
    if (updates.category) updateData.category = mapMaintenanceCategoryToDb(updates.category)
    if (updates.priority) updateData.priority = mapPriorityToDb(updates.priority)
    if (updates.status) updateData.status = mapMaintenanceStatusToDb(updates.status)
    if (updates.dateCompleted) updateData.dateCompleted = new Date(updates.dateCompleted)
    if (updates.cost !== undefined) updateData.cost = updates.cost

    await prisma.maintenanceTask.update({
        where: { id: taskId },
        data: updateData,
    })
    revalidatePath("/")
}

export async function deleteMaintenanceTask(taskId: string): Promise<void> {
    await prisma.maintenanceTask.delete({
        where: { id: taskId },
    })
    revalidatePath("/")
}

export async function completeMaintenanceTask(taskId: string, cost?: number): Promise<void> {
    const task = await prisma.maintenanceTask.findUnique({
        where: { id: taskId },
        include: { room: true },
    })

    if (!task) return

    await prisma.maintenanceTask.update({
        where: { id: taskId },
        data: {
            status: MaintenanceStatus.COMPLETED,
            dateCompleted: new Date(),
            cost,
        },
    })

    // Add expense if cost is provided
    if (cost) {
        await prisma.expense.create({
            data: {
                date: new Date(),
                month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
                category: ExpenseCategory.MAINTENANCE,
                amount: cost,
                description: `Repair for Room ${task.room.roomNumber}`,
            },
        })
    }

    revalidatePath("/")
}

// ============================================
// KPI CALCULATION
// ============================================

export async function calculateKPIs(selectedMonth?: string) {
    const filterMonth = selectedMonth || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

    const [rooms, transactions, expenses, maintenanceTasks] = await Promise.all([
        prisma.room.findMany({ include: { beds: true } }),
        prisma.transaction.findMany({ where: { month: filterMonth } }),
        prisma.expense.findMany({ where: { month: filterMonth } }),
        prisma.maintenanceTask.findMany({ where: { status: { not: MaintenanceStatus.COMPLETED } } }),
    ])

    const totalBeds = rooms.reduce((acc, room) => acc + room.beds.length, 0)
    const occupiedBeds = rooms.reduce((acc, room) => acc + room.beds.filter((b) => b.isOccupied).length, 0)

    const revenue = transactions
        .filter((t) => t.status === PaymentStatus.PAID && (t.type === TransactionType.RENT || t.type === TransactionType.DEPOSIT))
        .reduce((acc, t) => acc + t.amount, 0)

    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0)

    const outstanding = transactions
        .filter((t) => t.status === PaymentStatus.UNPAID)
        .reduce((acc, t) => acc + t.amount, 0)

    return {
        occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        totalCollected: revenue,
        totalOutstanding: outstanding,
        totalExpenses,
        netProfit: revenue - totalExpenses,
        pendingMaintenance: maintenanceTasks.length,
    }
}
