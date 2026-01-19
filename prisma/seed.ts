import { PrismaClient, RoomType, StudentStatus, DepositStatus, TransactionType, PaymentStatus, ExpenseCategory, MaintenanceCategory, Priority, MaintenanceStatus, ActivityType, ActivityStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Starting database seed...")

    // Clear existing data
    console.log("🗑️  Clearing existing data...")
    await prisma.activityLog.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.maintenanceTask.deleteMany()
    await prisma.expense.deleteMany()
    await prisma.student.deleteMany()
    await prisma.bed.deleteMany()
    await prisma.room.deleteMany()
    await prisma.location.deleteMany()

    // Create Locations
    console.log("📍 Creating locations...")
    const mainBuilding = await prisma.location.create({
        data: { name: "Main Building" },
    })
    const wingA = await prisma.location.create({
        data: { name: "Wing A" },
    })
    const wingB = await prisma.location.create({
        data: { name: "Wing B" },
    })

    const locationIds = [mainBuilding.id, wingA.id, wingB.id]
    console.log(`   ✅ Created ${locationIds.length} locations`)

    // Create Rooms with Beds
    console.log("🏠 Creating rooms...")
    const rooms: Array<{ id: string; roomNumber: string }> = []
    const floors = [1, 2, 3]

    for (const floor of floors) {
        for (let i = 1; i <= 4; i++) {
            const roomNumber = `${floor}0${i}`
            const capacity = i % 2 === 0 ? 3 : 2
            const locationIndex = (floor - 1 + Math.floor((i - 1) / 2)) % 3
            const type = floor === 3 ? RoomType.AC : RoomType.NON_AC

            // Create beds data
            const bedsData = Array.from({ length: capacity }, (_, idx) => ({
                label: String.fromCharCode(65 + idx), // A, B, C...
                isOccupied: false,
            }))

            const room = await prisma.room.create({
                data: {
                    roomNumber,
                    floor,
                    capacity,
                    type,
                    locationId: locationIds[locationIndex],
                    beds: {
                        create: bedsData,
                    },
                },
                include: { beds: true },
            })

            rooms.push({ id: room.id, roomNumber: room.roomNumber })
        }
    }
    console.log(`   ✅ Created ${rooms.length} rooms with beds`)

    // Get all beds for student assignment
    const allBeds = await prisma.bed.findMany({
        include: { room: true },
    })

    // Create Students
    console.log("👥 Creating students...")
    const studentsData = [
        {
            name: "Rahul Sharma",
            phone: "9876543210",
            email: "rahul.sharma@email.com",
            roomNumber: "101",
            bedLabel: "A",
            checkInDate: new Date("2025-12-01"),
            emergencyContactName: "Priya Sharma",
            emergencyContactPhone: "9876543220",
            emergencyContactRelation: "Mother",
            address: "123 Main Street, Mumbai",
            securityDeposit: 500,
            securityDepositStatus: DepositStatus.PAID,
        },
        {
            name: "Amit Kumar",
            phone: "9876543211",
            email: "amit.kumar@email.com",
            roomNumber: "101",
            bedLabel: "B",
            checkInDate: new Date("2025-12-05"),
            emergencyContactName: "Suresh Kumar",
            emergencyContactPhone: "9876543221",
            emergencyContactRelation: "Father",
            address: "456 Park Avenue, Delhi",
            securityDeposit: 500,
            securityDepositStatus: DepositStatus.PAID,
        },
        {
            name: "Vikram Singh",
            phone: "9876543212",
            email: "vikram.singh@email.com",
            roomNumber: "102",
            bedLabel: "A",
            checkInDate: new Date("2025-11-15"),
            emergencyContactName: "Meena Singh",
            emergencyContactPhone: "9876543222",
            emergencyContactRelation: "Mother",
            address: "789 Lake Road, Pune",
            securityDeposit: 500,
            securityDepositStatus: DepositStatus.PAID,
        },
        {
            name: "Sanjay Patel",
            phone: "9876543213",
            email: "sanjay.patel@email.com",
            roomNumber: "201",
            bedLabel: "A",
            checkInDate: new Date("2025-12-10"),
            emergencyContactName: "Ramesh Patel",
            emergencyContactPhone: "9876543223",
            emergencyContactRelation: "Father",
            address: "321 Garden Lane, Ahmedabad",
            securityDeposit: 500,
            securityDepositStatus: DepositStatus.PENDING,
        },
        {
            name: "Arjun Reddy",
            phone: "9876543214",
            email: "arjun.reddy@email.com",
            roomNumber: "203",
            bedLabel: "B",
            checkInDate: new Date("2025-11-20"),
            emergencyContactName: "Lakshmi Reddy",
            emergencyContactPhone: "9876543224",
            emergencyContactRelation: "Mother",
            address: "654 Hill View, Hyderabad",
            securityDeposit: 500,
            securityDepositStatus: DepositStatus.PAID,
        },
        {
            name: "Karan Malhotra",
            phone: "9876543215",
            email: "karan.malhotra@email.com",
            roomNumber: "301",
            bedLabel: "A",
            checkInDate: new Date("2026-01-02"),
            emergencyContactName: "Neeta Malhotra",
            emergencyContactPhone: "9876543225",
            emergencyContactRelation: "Mother",
            address: "987 River Side, Bangalore",
            securityDeposit: 500,
            securityDepositStatus: DepositStatus.PAID,
        },
        // Unassigned students
        {
            name: "Aman Gupta",
            phone: "9876543216",
            email: "aman.gupta@email.com",
            roomNumber: null,
            bedLabel: null,
            checkInDate: new Date("2026-01-10"),
            emergencyContactName: "Sunil Gupta",
            emergencyContactPhone: "9876543226",
            emergencyContactRelation: "Father",
            address: "159 Sky Tower, Indore",
            securityDeposit: 500,
            securityDepositStatus: DepositStatus.PAID,
        },
        {
            name: "Ishaan Verma",
            phone: "9876543217",
            email: "ishaan.verma@email.com",
            roomNumber: null,
            bedLabel: null,
            checkInDate: new Date("2026-01-11"),
            emergencyContactName: "Renu Verma",
            emergencyContactPhone: "9876543227",
            emergencyContactRelation: "Mother",
            address: "753 Green Park, Jaipur",
            securityDeposit: 500,
            securityDepositStatus: DepositStatus.PENDING,
        },
    ]

    const createdStudents: Array<{ id: string; name: string }> = []

    for (const studentData of studentsData) {
        let bedId: string | null = null
        let roomId: string | null = null

        if (studentData.roomNumber && studentData.bedLabel) {
            const bed = allBeds.find(
                (b) => b.room.roomNumber === studentData.roomNumber && b.label === studentData.bedLabel
            )
            if (bed) {
                bedId = bed.id
                roomId = bed.roomId
                // Mark bed as occupied
                await prisma.bed.update({
                    where: { id: bed.id },
                    data: { isOccupied: true },
                })
            }
        }

        const student = await prisma.student.create({
            data: {
                name: studentData.name,
                phone: studentData.phone,
                email: studentData.email,
                bedId,
                roomId,
                checkInDate: studentData.checkInDate,
                status: StudentStatus.ACTIVE,
                emergencyContactName: studentData.emergencyContactName,
                emergencyContactPhone: studentData.emergencyContactPhone,
                emergencyContactRelation: studentData.emergencyContactRelation,
                address: studentData.address,
                securityDeposit: studentData.securityDeposit,
                securityDepositStatus: studentData.securityDepositStatus,
            },
        })

        createdStudents.push({ id: student.id, name: student.name })
    }
    console.log(`   ✅ Created ${createdStudents.length} students`)

    // Create Transactions
    console.log("💰 Creating transactions...")
    const transactionsData = [
        { studentIndex: 0, amount: 500, type: TransactionType.DEPOSIT, status: PaymentStatus.PAID, date: new Date("2025-12-01"), month: "December 2025" },
        { studentIndex: 0, amount: 500, type: TransactionType.RENT, status: PaymentStatus.PAID, date: new Date("2025-12-01"), month: "December 2025" },
        { studentIndex: 1, amount: 500, type: TransactionType.DEPOSIT, status: PaymentStatus.PAID, date: new Date("2025-12-05"), month: "December 2025" },
        { studentIndex: 1, amount: 500, type: TransactionType.RENT, status: PaymentStatus.UNPAID, date: new Date("2025-12-05"), month: "December 2025" },
        { studentIndex: 2, amount: 500, type: TransactionType.RENT, status: PaymentStatus.UNPAID, date: new Date("2025-12-01"), month: "December 2025" },
        { studentIndex: 3, amount: 500, type: TransactionType.DEPOSIT, status: PaymentStatus.PAID, date: new Date("2025-12-10"), month: "December 2025" },
        { studentIndex: 4, amount: 500, type: TransactionType.RENT, status: PaymentStatus.PAID, date: new Date("2025-12-01"), month: "December 2025" },
    ]

    for (const txData of transactionsData) {
        await prisma.transaction.create({
            data: {
                studentId: createdStudents[txData.studentIndex].id,
                amount: txData.amount,
                type: txData.type,
                status: txData.status,
                date: txData.date,
                month: txData.month,
            },
        })
    }
    console.log(`   ✅ Created ${transactionsData.length} transactions`)

    // Create Expenses
    console.log("📊 Creating expenses...")
    const expensesData = [
        { date: new Date("2025-12-01"), month: "December 2025", category: ExpenseCategory.UTILITY, amount: 2000, description: "Electricity bill" },
        { date: new Date("2025-12-05"), month: "December 2025", category: ExpenseCategory.MAINTENANCE, amount: 1500, description: "Plumbing repairs" },
        { date: new Date("2025-12-10"), month: "December 2025", category: ExpenseCategory.SALARY, amount: 5000, description: "Staff salary - Maintenance" },
        { date: new Date("2026-01-02"), month: "January 2026", category: ExpenseCategory.UTILITY, amount: 2200, description: "Electricity bill" },
    ]

    for (const expense of expensesData) {
        await prisma.expense.create({ data: expense })
    }
    console.log(`   ✅ Created ${expensesData.length} expenses`)

    // Create Activity Logs
    console.log("📝 Creating activity logs...")
    const activityLogsData = [
        { studentIndex: 0, type: ActivityType.GATE_PASS, description: "Weekend leave - Going home", date: new Date("2025-12-20"), status: ActivityStatus.APPROVED },
        { studentIndex: 0, type: ActivityType.VISITOR, description: "Parent visit - Priya Sharma", date: new Date("2025-12-15"), status: ActivityStatus.APPROVED },
        { studentIndex: 1, type: ActivityType.COMPLAINT, description: "AC not working properly", date: new Date("2025-12-18"), status: ActivityStatus.PENDING },
        { studentIndex: 2, type: ActivityType.GATE_PASS, description: "Medical appointment", date: new Date("2025-12-22"), status: ActivityStatus.APPROVED },
        { studentIndex: 3, type: ActivityType.NOTICE, description: "Late fee payment warning", date: new Date("2025-12-25"), status: ActivityStatus.PENDING },
    ]

    for (const log of activityLogsData) {
        await prisma.activityLog.create({
            data: {
                studentId: createdStudents[log.studentIndex].id,
                type: log.type,
                description: log.description,
                date: log.date,
                status: log.status,
            },
        })
    }
    console.log(`   ✅ Created ${activityLogsData.length} activity logs`)

    // Get room IDs for maintenance tasks
    const roomsForMaintenance = await prisma.room.findMany({
        where: { roomNumber: { in: ["101", "102", "201", "203", "301"] } },
    })

    // Create Maintenance Tasks
    console.log("🔧 Creating maintenance tasks...")
    const maintenanceData = [
        { roomNumber: "101", title: "AC not cooling properly", description: "Room 101 AC is not cooling efficiently. May need servicing or gas refill.", category: MaintenanceCategory.ELECTRICAL, priority: Priority.HIGH, status: MaintenanceStatus.IN_PROGRESS, dateReported: new Date("2026-01-05") },
        { roomNumber: "102", title: "Bathroom tap leakage", description: "Hot water tap is leaking continuously. Needs valve replacement.", category: MaintenanceCategory.PLUMBING, priority: Priority.MEDIUM, status: MaintenanceStatus.REPORTED, dateReported: new Date("2026-01-08") },
        { roomNumber: "201", title: "Broken bed frame", description: "Bed frame in corner is broken and unsafe. Needs replacement.", category: MaintenanceCategory.FURNITURE, priority: Priority.HIGH, status: MaintenanceStatus.AWAITING_PARTS, dateReported: new Date("2026-01-03") },
        { roomNumber: "203", title: "WiFi router not working", description: "Internet connection lost. Router may need reset or replacement.", category: MaintenanceCategory.INTERNET, priority: Priority.LOW, status: MaintenanceStatus.COMPLETED, dateReported: new Date("2025-12-28"), dateCompleted: new Date("2026-01-06") },
        { roomNumber: "301", title: "Light bulb replacement", description: "Main ceiling light is not working.", category: MaintenanceCategory.ELECTRICAL, priority: Priority.LOW, status: MaintenanceStatus.REPORTED, dateReported: new Date("2026-01-09") },
    ]

    for (const task of maintenanceData) {
        const room = roomsForMaintenance.find((r) => r.roomNumber === task.roomNumber)
        if (room) {
            await prisma.maintenanceTask.create({
                data: {
                    roomId: room.id,
                    title: task.title,
                    description: task.description,
                    category: task.category,
                    priority: task.priority,
                    status: task.status,
                    dateReported: task.dateReported,
                    dateCompleted: task.dateCompleted,
                },
            })
        }
    }
    console.log(`   ✅ Created ${maintenanceData.length} maintenance tasks`)

    console.log("\n✨ Database seeding completed successfully!")
    console.log("\nSummary:")
    console.log(`   📍 ${locationIds.length} Locations`)
    console.log(`   🏠 ${rooms.length} Rooms`)
    console.log(`   👥 ${createdStudents.length} Students`)
    console.log(`   💰 ${transactionsData.length} Transactions`)
    console.log(`   📊 ${expensesData.length} Expenses`)
    console.log(`   📝 ${activityLogsData.length} Activity Logs`)
    console.log(`   🔧 ${maintenanceData.length} Maintenance Tasks`)
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
