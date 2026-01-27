"use client"

import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { useRouter } from "next/navigation"
import { Loader2, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DemoAutoLoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loginStatus, setLoginStatus] = useState<"initializing" | "logging-in" | "error">("initializing")
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    async function autoLogin() {
      // If already authenticated, redirect to demo dashboard
      if (status === "authenticated") {
        router.push("/demo")
        return
      }

      // If still checking session, wait
      if (status === "loading") {
        return
      }

      // Demo credentials (these should match a demo user in your database)
      const demoEmail = "demo@theboyshostel.com"
      const demoPassword = "demo123456"

      setLoginStatus("logging-in")

      try {
        const result = await signIn("credentials", {
          email: demoEmail,
          password: demoPassword,
          subdomain: "demo",
          redirect: false,
        })

        if (result?.error) {
          setLoginStatus("error")
          setError(
            "Demo login failed. The demo account may not be set up yet. Please contact support or try registering a new hostel."
          )
        } else {
          // Login successful, redirect to demo dashboard
          window.location.href = "http://demo.localhost:3000"
        }
      } catch (err) {
        setLoginStatus("error")
        setError("An unexpected error occurred during demo login")
      }
    }

    autoLogin()
  }, [status, router, mounted])

  // Don't render anything until mounted (prevents SSR issues)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (loginStatus === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-danger/10">
                <Building2 className="h-8 w-8 text-danger" />
              </div>
              <div>
                <CardTitle className="text-danger">Demo Login Failed</CardTitle>
                <CardDescription>Unable to access demo account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-y-2">
              <a
                href="/"
                className="block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Go to Home
              </a>
              <a
                href="/#register"
                className="block w-full text-center py-2 px-4 border border-border rounded-md hover:bg-muted"
              >
                Register Your Hostel
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10 animate-pulse">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle>Demo Mode</CardTitle>
              <CardDescription>Setting up your demo experience...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">
              {loginStatus === "initializing" ? "Initializing..." : "Logging you in..."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
