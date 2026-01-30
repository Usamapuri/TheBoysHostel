"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { registerHostel, checkSubdomainAvailability } from "@/lib/auth-actions"
import { Loader2, Check, X } from "lucide-react"

export function RegisterHostelForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [subdomainStatus, setSubdomainStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  
  const [formData, setFormData] = useState({
    hostelName: "",
    subdomain: "",
    adminName: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubdomainChange = async (value: string) => {
    const cleanSubdomain = value.toLowerCase().replace(/[^a-z0-9-]/g, "")
    setFormData({ ...formData, subdomain: cleanSubdomain })
    
    if (cleanSubdomain.length >= 3) {
      setSubdomainStatus("checking")
      const isAvailable = await checkSubdomainAvailability(cleanSubdomain)
      setSubdomainStatus(isAvailable ? "available" : "taken")
    } else {
      setSubdomainStatus("idle")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    try {
      const result = await registerHostel({
        hostelName: formData.hostelName,
        subdomain: formData.subdomain,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        password: formData.password,
      })

      if (result.success && result.subdomain) {
        // Registration request successful - pending approval
        alert(
          `🎉 Thank you for registering!\n\n` +
          `Your registration request has been submitted successfully.\n\n` +
          `📧 You will receive an email at ${formData.adminEmail} once a super admin reviews and approves your request.\n\n` +
          `⏳ This usually takes 24-48 hours.\n\n` +
          `Subdomain reserved: ${result.subdomain}.yourdomain.com`
        )
        
        // Redirect to home page
        router.push('/')
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground">Register Your Hostel</CardTitle>
        <CardDescription className="text-muted-foreground">
          Create your hostel management account in minutes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hostel Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Hostel Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="hostelName">Hostel Name</Label>
              <Input
                id="hostelName"
                type="text"
                placeholder="e.g., The Boys Hostel"
                value={formData.hostelName}
                onChange={(e) => setFormData({ ...formData, hostelName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    id="subdomain"
                    type="text"
                    placeholder="e.g., myshostel"
                    value={formData.subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    required
                    disabled={isLoading}
                    className="flex-1"
                  />
                  {subdomainStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {subdomainStatus === "available" && <Check className="h-4 w-4 text-success" />}
                  {subdomainStatus === "taken" && <X className="h-4 w-4 text-danger" />}
                </div>
                <span className="text-muted-foreground">.yourdomain.com</span>
              </div>
              {subdomainStatus === "available" && (
                <p className="text-sm text-success">✓ This subdomain is available</p>
              )}
              {subdomainStatus === "taken" && (
                <p className="text-sm text-danger">✗ This subdomain is already taken</p>
              )}
            </div>
          </div>

          {/* Admin Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Admin Account</h3>
            
            <div className="space-y-2">
              <Label htmlFor="adminName">Your Name</Label>
              <Input
                id="adminName"
                type="text"
                placeholder="John Doe"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email Address</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@example.com"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/20 border border-danger/30 text-danger text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || subdomainStatus === "taken" || subdomainStatus === "checking"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating your hostel...
              </>
            ) : (
              "Create Hostel Account"
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <a href="/demo" className="text-primary hover:underline">
              Try the demo
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
