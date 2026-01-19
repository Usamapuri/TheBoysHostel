"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Grid3X3, Users, Receipt, Wrench } from "lucide-react"

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "rooms", label: "Rooms", icon: Grid3X3 },
    { id: "students", label: "Students", icon: Users },
    { id: "finance", label: "Finance", icon: Receipt },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
  ]

  return (
    <nav className="border-b border-border bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto py-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  )
}
