"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import {
  getData,
  addLocation as addLocationAction,
  updateLocation as updateLocationAction,
  deleteLocation as deleteLocationAction,
  addRoom as addRoomAction,
  updateRoom as updateRoomAction,
  deleteRoom as deleteRoomAction,
  addStudent as addStudentAction,
  updateStudent as updateStudentAction,
  deleteStudent as deleteStudentAction,
  checkInStudent as checkInStudentAction,
  assignStudentToBed as assignStudentToBedAction,
  transferStudent as transferStudentAction,
  generateMonthlyBills as generateMonthlyBillsAction,
  markAsPaid as markAsPaidAction,
  addOneOffCharge as addOneOffChargeAction,
  updateRentAmount as updateRentAmountAction,
  addExpense as addExpenseAction,
  deleteExpense as deleteExpenseAction,
  addActivityLog as addActivityLogAction,
  addMaintenanceTask as addMaintenanceTaskAction,
  updateMaintenanceTask as updateMaintenanceTaskAction,
  deleteMaintenanceTask as deleteMaintenanceTaskAction,
  completeMaintenanceTask as completeMaintenanceTaskAction,
  calculateKPIs,
  type HostelData,
  type Student,
  type ActivityLog,
  type MaintenanceTask,
} from "@/lib/actions"

export function useHostelData() {
  const [data, setData] = useState<HostelData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [kpis, setKpis] = useState<{
    occupancyRate: number
    totalCollected: number
    totalOutstanding: number
    totalExpenses: number
    netProfit: number
    pendingMaintenance: number
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  const loadData = useCallback(async () => {
    try {
      const [hostelData, kpiData] = await Promise.all([
        getData(),
        calculateKPIs(),
      ])
      setData(hostelData)
      setKpis(kpiData)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [loadData])

  const refresh = useCallback(() => {
    startTransition(() => {
      loadData()
    })
  }, [loadData])

  const handleCheckIn = useCallback(
    async (bedId: string, roomId: string, name: string, phone: string) => {
      startTransition(async () => {
        await checkInStudentAction(bedId, roomId, name, phone)
        await loadData()
      })
    },
    [loadData],
  )

  const handleGenerateBills = useCallback(async () => {
    startTransition(async () => {
      await generateMonthlyBillsAction()
      await loadData()
    })
  }, [loadData])

  const handleMarkAsPaid = useCallback(
    async (transactionId: string) => {
      startTransition(async () => {
        await markAsPaidAction(transactionId)
        await loadData()
      })
    },
    [loadData],
  )

  const handleAddStudent = useCallback(
    async (studentData: {
      name: string
      phone: string
      email?: string
      roomId?: string
      bedId?: string
      checkInDate: string
      emergencyContact?: { name: string; phone: string; relation: string }
      address?: string
    }) => {
      startTransition(async () => {
        await addStudentAction(studentData)
        await loadData()
      })
    },
    [loadData],
  )

  const handleUpdateStudent = useCallback(
    async (studentId: string, updates: Partial<Student>) => {
      startTransition(async () => {
        await updateStudentAction(studentId, updates)
        await loadData()
      })
    },
    [loadData],
  )

  const handleDeleteStudent = useCallback(
    async (studentId: string) => {
      startTransition(async () => {
        await deleteStudentAction(studentId)
        await loadData()
      })
    },
    [loadData],
  )

  const handleAddActivityLog = useCallback(
    async (log: Omit<ActivityLog, "id">) => {
      startTransition(async () => {
        await addActivityLogAction(log)
        await loadData()
      })
    },
    [loadData],
  )

  const handleAddRoom = useCallback(
    async (roomData: {
      roomNumber: string
      floor: number
      capacity: number
      type: "AC" | "Non-AC"
      locationId: string
    }) => {
      startTransition(async () => {
        await addRoomAction(roomData)
        await loadData()
      })
    },
    [loadData],
  )

  const handleUpdateRoom = useCallback(
    async (roomId: string, updates: Partial<{ roomNumber: string; floor: number; capacity: number; type: "AC" | "Non-AC"; locationId: string }>) => {
      startTransition(async () => {
        await updateRoomAction(roomId, updates)
        await loadData()
      })
    },
    [loadData],
  )

  const handleDeleteRoom = useCallback(
    async (roomId: string) => {
      let result = { success: false, error: "Unknown error" }
      await new Promise<void>((resolve) => {
        startTransition(async () => {
          result = await deleteRoomAction(roomId)
          await loadData()
          resolve()
        })
      })
      return result
    },
    [loadData],
  )

  const handleTransferStudent = useCallback(
    async (studentId: string, newBedId: string, newRoomId: string) => {
      startTransition(async () => {
        await transferStudentAction(studentId, newBedId, newRoomId)
        await loadData()
      })
    },
    [loadData],
  )

  const handleAddExpense = useCallback(
    async (expenseData: {
      date: string
      month: string
      category: "Utility" | "Maintenance" | "Salary" | "Other"
      amount: number
      description: string
    }) => {
      startTransition(async () => {
        await addExpenseAction(expenseData)
        await loadData()
      })
    },
    [loadData],
  )

  const handleDeleteExpense = useCallback(
    async (expenseId: string) => {
      startTransition(async () => {
        await deleteExpenseAction(expenseId)
        await loadData()
      })
    },
    [loadData],
  )

  const handleAddOneOffCharge = useCallback(
    async (studentId: string, type: "Penalty" | "Damage", amount: number, description: string) => {
      startTransition(async () => {
        await addOneOffChargeAction(studentId, type, amount, description)
        await loadData()
      })
    },
    [loadData],
  )

  const handleUpdateRent = useCallback(
    async (transactionId: string, newAmount: number) => {
      startTransition(async () => {
        await updateRentAmountAction(transactionId, newAmount)
        await loadData()
      })
    },
    [loadData],
  )

  const handleAddMaintenanceTask = useCallback(
    async (taskData: {
      roomId: string
      roomNumber: string
      title: string
      description: string
      category: "Plumbing" | "Electrical" | "Furniture" | "Internet" | "Other"
      priority: "Low" | "Medium" | "High"
    }) => {
      startTransition(async () => {
        await addMaintenanceTaskAction(taskData)
        await loadData()
      })
    },
    [loadData],
  )

  const handleUpdateMaintenanceTask = useCallback(
    async (taskId: string, updates: Partial<Omit<MaintenanceTask, "id" | "roomNumber">>) => {
      startTransition(async () => {
        await updateMaintenanceTaskAction(taskId, updates)
        await loadData()
      })
    },
    [loadData],
  )

  const handleDeleteMaintenanceTask = useCallback(
    async (taskId: string) => {
      startTransition(async () => {
        await deleteMaintenanceTaskAction(taskId)
        await loadData()
      })
    },
    [loadData],
  )

  const handleCompleteMaintenanceTask = useCallback(
    async (taskId: string, cost?: number) => {
      startTransition(async () => {
        await completeMaintenanceTaskAction(taskId, cost)
        await loadData()
      })
    },
    [loadData],
  )

  const handleAddLocation = useCallback(
    async (name: string) => {
      startTransition(async () => {
        await addLocationAction(name)
        await loadData()
      })
    },
    [loadData],
  )

  const handleUpdateLocation = useCallback(
    async (locationId: string, name: string) => {
      startTransition(async () => {
        await updateLocationAction(locationId, name)
        await loadData()
      })
    },
    [loadData],
  )

  const handleDeleteLocation = useCallback(
    async (locationId: string): Promise<{ success: boolean; error?: string }> => {
      let result = { success: false, error: "Unknown error" }
      await new Promise<void>((resolve) => {
        startTransition(async () => {
          result = await deleteLocationAction(locationId)
          await loadData()
          resolve()
        })
      })
      return result
    },
    [loadData],
  )

  const handleAssignStudent = useCallback(
    async (studentId: string, bedId: string, roomId: string) => {
      startTransition(async () => {
        await assignStudentToBedAction(studentId, bedId, roomId)
        await loadData()
      })
    },
    [loadData],
  )

  return {
    data,
    isLoading: !mounted || isLoading || isPending,
    kpis,
    refresh,
    handleCheckIn,
    handleGenerateBills,
    handleMarkAsPaid,
    handleAddStudent,
    handleUpdateStudent,
    handleDeleteStudent,
    handleAddActivityLog,
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
  }
}
