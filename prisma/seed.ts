import { PrismaClient, RoomType, StudentStatus, DepositStatus, TransactionType, PaymentStatus, ExpenseCategory, MaintenanceCategory, Priority, MaintenanceStatus, ActivityType, ActivityStatus, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Starting database seed...\n")

    // ============================================
    // 1. CREATE SUPER ADMIN USER
    // ============================================
    console.log("👑 Creating Super Admin...")
    const superAdmin = await prisma.user.upsert({
        where: { email: 'superadmin@hostelflow.com' },
        update: {},
        create: {
            name: 'Super Admin',
            email: 'superadmin@hostelflow.com',
            password: await bcrypt.hash('SuperAdmin123!', 12),
            role: UserRole.SUPERADMIN,
            tenantId: null,
        }
    })
    console.log(`   ✅ Super Admin created: ${superAdmin.email}\n`)

    // ============================================
    // 2. CREATE DEMO TENANT WITH FULL TEST DATA
    // ============================================
    console.log("🏢 Creating Demo Tenant...")
    const demoTenant = await prisma.tenant.upsert({
        where: { subdomain: 'demo' },
        update: {},
        create: {
            name: 'Demo Hostel',
            subdomain: 'demo',
            isActive: true,
            approvedAt: new Date(),
        }
    })

    const demoAdmin = await prisma.user.upsert({
        where: { email: 'demo@hostel.com' },
        update: {},
        create: {
            name: 'Demo Admin',
            email: 'demo@hostel.com',
            password: await bcrypt.hash('Demo123!', 12),
            role: UserRole.ADMIN,
            tenantId: demoTenant.id,
        }
    })
    console.log(`   ✅ Demo tenant and admin created: ${demoAdmin.email}`)

    // Create Demo Locations
    console.log("   📍 Creating demo locations...")
    const demoMainBuilding = await prisma.location.create({
        data: { name: "Main Building", tenantId: demoTenant.id },
    })
    const demoWingA = await prisma.location.create({
        data: { name: "Wing A", tenantId: demoTenant.id },
    })
    const demoWingB = await prisma.location.create({
        data: { name: "Wing B", tenantId: demoTenant.id },
    })
    const demoLocationIds = [demoMainBuilding.id, demoWingA.id, demoWingB.id]
    console.log(`   ✅ Created ${demoLocationIds.length} demo locations`)

    // Create Demo Rooms with Beds
    console.log("   🏠 Creating demo rooms...")
    const demoRooms: Array<{ id: string; roomNumber: string }> = []
    const floors = [1, 2, 3]

    for (const floor of floors) {
        for (let i = 1; i <= 4; i++) {
            const roomNumber = `${floor}0${i}`
            const capacity = i % 2 === 0 ? 3 : 2
            const locationIndex = (floor - 1 + Math.floor((i - 1) / 2)) % 3
            const type = floor === 3 ? RoomType.AC : RoomType.NON_AC
            const baseMonthlyRent = floor === 3 ? 8000 : 6000

            const bedsData = Array.from({ length: capacity }, (_, idx) => ({
                label: String.fromCharCode(65 + idx),
                isOccupied: false,
            }))

            const room = await prisma.room.create({
                data: {
                    roomNumber,
                    floor,
                    capacity,
                    type,
                    baseMonthlyRent,
                    locationId: demoLocationIds[locationIndex],
                    tenantId: demoTenant.id,
                    beds: {
                        create: bedsData,
                    },
                },
                include: { beds: true },
            })

            demoRooms.push({ id: room.id, roomNumber: room.roomNumber })
        }
    }
    console.log(`   ✅ Created ${demoRooms.length} demo rooms with beds`)

    // Get all demo beds for student assignment
    const demoBeds = await prisma.bed.findMany({
        where: { room: { tenantId: demoTenant.id } },
        include: { room: true },
    })

    // Create Demo Students
    console.log("   👥 Creating demo students...")
    const demoStudentsData = [
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
            securityDeposit: 5000,
            monthlyRent: 6000,
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
            securityDeposit: 5000,
            monthlyRent: 6000,
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
            securityDeposit: 5000,
            monthlyRent: 6000,
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
            securityDeposit: 5000,
            monthlyRent: 6000,
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
            securityDeposit: 5000,
            monthlyRent: 6000,
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
            securityDeposit: 5000,
            monthlyRent: 8000,
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
            securityDeposit: 5000,
            monthlyRent: null,
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
            securityDeposit: 5000,
            monthlyRent: null,
            securityDepositStatus: DepositStatus.PENDING,
        },
    ]

    const demoStudents: Array<{ id: string; name: string }> = []

    for (const studentData of demoStudentsData) {
        let bedId: string | null = null
        let roomId: string | null = null

        if (studentData.roomNumber && studentData.bedLabel) {
            const bed = demoBeds.find(
                (b) => b.room.roomNumber === studentData.roomNumber && b.label === studentData.bedLabel
            )
            if (bed) {
                bedId = bed.id
                roomId = bed.roomId
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
                monthlyRent: studentData.monthlyRent,
                securityDepositStatus: studentData.securityDepositStatus,
                tenantId: demoTenant.id,
            },
        })

        demoStudents.push({ id: student.id, name: student.name })
    }
    console.log(`   ✅ Created ${demoStudents.length} demo students`)

    // Create Demo Transactions
    console.log("   💰 Creating demo transactions...")
    const demoTransactionsData = [
        { studentIndex: 0, amount: 5000, type: TransactionType.DEPOSIT, status: PaymentStatus.PAID, date: new Date("2025-12-01"), dueDate: new Date("2025-12-01"), month: "December 2025", description: "Security deposit" },
        { studentIndex: 0, amount: 6000, type: TransactionType.RENT, status: PaymentStatus.PAID, date: new Date("2025-12-01"), dueDate: new Date("2025-12-05"), month: "December 2025", description: "Monthly rent - December" },
        { studentIndex: 0, amount: 6000, type: TransactionType.RENT, status: PaymentStatus.PAID, date: new Date("2026-01-01"), dueDate: new Date("2026-01-05"), month: "January 2026", description: "Monthly rent - January" },
        { studentIndex: 1, amount: 5000, type: TransactionType.DEPOSIT, status: PaymentStatus.PAID, date: new Date("2025-12-05"), dueDate: new Date("2025-12-05"), month: "December 2025", description: "Security deposit" },
        { studentIndex: 1, amount: 6000, type: TransactionType.RENT, status: PaymentStatus.UNPAID, date: new Date("2025-12-05"), dueDate: new Date("2025-12-10"), month: "December 2025", description: "Monthly rent - December" },
        { studentIndex: 2, amount: 6000, type: TransactionType.RENT, status: PaymentStatus.UNPAID, date: new Date("2026-01-01"), dueDate: new Date("2026-01-05"), month: "January 2026", description: "Monthly rent - January (OVERDUE)" },
        { studentIndex: 3, amount: 5000, type: TransactionType.DEPOSIT, status: PaymentStatus.PAID, date: new Date("2025-12-10"), dueDate: new Date("2025-12-10"), month: "December 2025", description: "Security deposit" },
        { studentIndex: 4, amount: 6000, type: TransactionType.RENT, status: PaymentStatus.PAID, date: new Date("2025-12-01"), dueDate: new Date("2025-12-05"), month: "December 2025", description: "Monthly rent - December" },
        { studentIndex: 5, amount: 8000, type: TransactionType.RENT, status: PaymentStatus.PAID, date: new Date("2026-01-01"), dueDate: new Date("2026-01-05"), month: "January 2026", description: "Monthly rent - January (AC room)" },
    ]

    for (const txData of demoTransactionsData) {
        await prisma.transaction.create({
            data: {
                studentId: demoStudents[txData.studentIndex].id,
                amount: txData.amount,
                type: txData.type,
                status: txData.status,
                date: txData.date,
                dueDate: txData.dueDate,
                month: txData.month,
                description: txData.description,
                tenantId: demoTenant.id,
            },
        })
    }
    console.log(`   ✅ Created ${demoTransactionsData.length} demo transactions`)

    // Create Demo Expenses
    console.log("   📊 Creating demo expenses...")
    const demoExpensesData = [
        { date: new Date("2025-12-01"), month: "December 2025", category: ExpenseCategory.UTILITY, amount: 12000, description: "Electricity bill - December", vendorName: "State Electric Board" },
        { date: new Date("2025-12-05"), month: "December 2025", category: ExpenseCategory.MAINTENANCE, amount: 3500, description: "Plumbing repairs - Main Building", vendorName: "Quick Fix Plumbers" },
        { date: new Date("2025-12-10"), month: "December 2025", category: ExpenseCategory.SALARY, amount: 15000, description: "Maintenance staff salary", vendorName: null },
        { date: new Date("2025-12-15"), month: "December 2025", category: ExpenseCategory.SUPPLIES, amount: 2500, description: "Cleaning supplies and toiletries", vendorName: "General Store" },
        { date: new Date("2026-01-02"), month: "January 2026", category: ExpenseCategory.UTILITY, amount: 13500, description: "Electricity bill - January", vendorName: "State Electric Board" },
        { date: new Date("2026-01-05"), month: "January 2026", category: ExpenseCategory.UTILITY, amount: 2000, description: "Water bill - January", vendorName: "Municipal Corporation" },
        { date: new Date("2026-01-10"), month: "January 2026", category: ExpenseCategory.SALARY, amount: 15000, description: "Maintenance staff salary", vendorName: null },
    ]

    for (const expense of demoExpensesData) {
        await prisma.expense.create({
            data: { ...expense, tenantId: demoTenant.id }
        })
    }
    console.log(`   ✅ Created ${demoExpensesData.length} demo expenses`)

    // Create Demo Activity Logs
    console.log("   📝 Creating demo activity logs...")
    const demoActivityLogsData = [
        { studentIndex: 0, type: ActivityType.GATE_PASS, description: "Weekend leave - Going home", date: new Date("2025-12-20"), status: ActivityStatus.APPROVED },
        { studentIndex: 0, type: ActivityType.VISITOR, description: "Parent visit - Priya Sharma", date: new Date("2025-12-15"), status: ActivityStatus.APPROVED },
        { studentIndex: 1, type: ActivityType.COMPLAINT, description: "AC not working properly", date: new Date("2025-12-18"), status: ActivityStatus.PENDING },
        { studentIndex: 2, type: ActivityType.GATE_PASS, description: "Medical appointment", date: new Date("2025-12-22"), status: ActivityStatus.APPROVED },
        { studentIndex: 3, type: ActivityType.NOTICE, description: "Late fee payment warning", date: new Date("2025-12-25"), status: ActivityStatus.PENDING },
        { studentIndex: 4, type: ActivityType.VISITOR, description: "Friend visit", date: new Date("2026-01-05"), status: ActivityStatus.APPROVED },
    ]

    for (const log of demoActivityLogsData) {
        await prisma.activityLog.create({
            data: {
                studentId: demoStudents[log.studentIndex].id,
                type: log.type,
                description: log.description,
                date: log.date,
                status: log.status,
                tenantId: demoTenant.id,
            },
        })
    }
    console.log(`   ✅ Created ${demoActivityLogsData.length} demo activity logs`)

    // Create Demo Maintenance Tasks
    console.log("   🔧 Creating demo maintenance tasks...")
    const demoRoomsForMaintenance = await prisma.room.findMany({
        where: {
            tenantId: demoTenant.id,
            roomNumber: { in: ["101", "102", "201", "203", "301"] }
        },
    })

    const demoMaintenanceData = [
        { roomNumber: "101", title: "AC not cooling properly", description: "Room 101 AC is not cooling efficiently. May need servicing or gas refill.", category: MaintenanceCategory.ELECTRICAL, priority: Priority.HIGH, status: MaintenanceStatus.IN_PROGRESS, dateReported: new Date("2026-01-05"), cost: null },
        { roomNumber: "102", title: "Bathroom tap leakage", description: "Hot water tap is leaking continuously. Needs valve replacement.", category: MaintenanceCategory.PLUMBING, priority: Priority.MEDIUM, status: MaintenanceStatus.REPORTED, dateReported: new Date("2026-01-08"), cost: null },
        { roomNumber: "201", title: "Broken bed frame", description: "Bed frame in corner is broken and unsafe. Needs replacement.", category: MaintenanceCategory.FURNITURE, priority: Priority.HIGH, status: MaintenanceStatus.AWAITING_PARTS, dateReported: new Date("2026-01-03"), cost: null },
        { roomNumber: "203", title: "WiFi router not working", description: "Internet connection lost. Router was reset and working now.", category: MaintenanceCategory.INTERNET, priority: Priority.LOW, status: MaintenanceStatus.COMPLETED, dateReported: new Date("2025-12-28"), dateCompleted: new Date("2026-01-06"), cost: 0 },
        { roomNumber: "301", title: "Light bulb replacement", description: "Main ceiling light is not working.", category: MaintenanceCategory.ELECTRICAL, priority: Priority.LOW, status: MaintenanceStatus.REPORTED, dateReported: new Date("2026-01-09"), cost: null },
    ]

    for (const task of demoMaintenanceData) {
        const room = demoRoomsForMaintenance.find((r) => r.roomNumber === task.roomNumber)
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
                    cost: task.cost,
                    tenantId: demoTenant.id,
                },
            })
        }
    }
    console.log(`   ✅ Created ${demoMaintenanceData.length} demo maintenance tasks\n`)

    // ============================================
    // 3. CREATE THE BOYS HOSTEL TENANT (ADMIN ONLY)
    // ============================================
    console.log("🏫 Creating The Boys Hostel tenant...")
    const boysHostelTenant = await prisma.tenant.upsert({
        where: { subdomain: 'theboyshostel' },
        update: {},
        create: {
            name: 'The Boys Hostel',
            subdomain: 'theboyshostel',
            isActive: true,
            approvedAt: new Date(),
        }
    })

    const boysHostelAdmin = await prisma.user.upsert({
        where: { email: 'admin@theboyshostel.com' },
        update: {},
        create: {
            name: 'Boys Hostel Admin',
            email: 'admin@theboyshostel.com',
            password: await bcrypt.hash('Admin123!', 12),
            role: UserRole.ADMIN,
            tenantId: boysHostelTenant.id,
        }
    })
    console.log(`   ✅ The Boys Hostel tenant and admin created: ${boysHostelAdmin.email}\n`)

    // ============================================
    // SEED COMPLETE
    // ============================================
    console.log("✨ Database seeding completed successfully!\n")
    console.log("=" .repeat(60))
    console.log("📧 CREDENTIALS")
    console.log("=" .repeat(60))
    console.log("\n👑 SUPER ADMIN (Login from root domain):")
    console.log("   Email:    superadmin@hostelflow.com")
    console.log("   Password: SuperAdmin123!")
    console.log("   Access:   http://localhost:3000/superadmin")
    console.log("\n🎮 DEMO HOSTEL (Full test data):")
    console.log("   Email:    demo@hostel.com")
    console.log("   Password: Demo123!")
    console.log("   Access:   http://demo.localhost:3000")
    console.log("\n🏫 THE BOYS HOSTEL (Empty - ready for data entry):")
    console.log("   Email:    admin@theboyshostel.com")
    console.log("   Password: Admin123!")
    console.log("   Access:   http://theboyshostel.localhost:3000")
    console.log("\n" + "=".repeat(60) + "\n")
    
    console.log("📊 Summary:")
    console.log(`   👑 1 Super Admin`)
    console.log(`   🏢 2 Tenants (demo + theboyshostel)`)
    console.log(`   📍 ${demoLocationIds.length} Locations (demo only)`)
    console.log(`   🏠 ${demoRooms.length} Rooms (demo only)`)
    console.log(`   👥 ${demoStudents.length} Students (demo only)`)
    console.log(`   💰 ${demoTransactionsData.length} Transactions (demo only)`)
    console.log(`   📊 ${demoExpensesData.length} Expenses (demo only)`)
    console.log(`   📝 ${demoActivityLogsData.length} Activity Logs (demo only)`)
    console.log(`   🔧 ${demoMaintenanceData.length} Maintenance Tasks (demo only)`)
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
