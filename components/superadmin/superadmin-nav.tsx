"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Building2, FileCheck, Users, BarChart3, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export function SuperAdminNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/superadmin", label: "Dashboard", icon: Building2, exact: true },
    { href: "/superadmin/requests", label: "Registration Requests", icon: FileCheck },
    { href: "/superadmin/tenants", label: "Manage Tenants", icon: Users },
    { href: "/superadmin/analytics", label: "Analytics", icon: BarChart3 },
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/superadmin" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">Super Admin</span>
            </Link>
            
            <div className="flex gap-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname?.startsWith(item.href)
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "flex items-center gap-2",
                        isActive && "bg-secondary"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
