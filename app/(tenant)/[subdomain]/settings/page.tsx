"use client"

import { useSession } from "next-auth/react"
import { useTenant } from "@/lib/tenant-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileTab } from "@/components/settings/profile-tab"
import { BrandingTab } from "@/components/settings/branding-tab"
import { LocalizationTab } from "@/components/settings/localization-tab"
import { SecurityTab } from "@/components/settings/security-tab"
import { Settings, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { tenant, isLoading } = useTenant()
  const router = useRouter()

  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN"

  if (isLoading || !tenant) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Settings className="h-6 w-6" />
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your hostel configuration and preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {isAdmin && <TabsTrigger value="branding">Branding</TabsTrigger>}
            {isAdmin && (
              <TabsTrigger value="localization">Localization</TabsTrigger>
            )}
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab tenant={tenant} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="branding">
              <BrandingTab tenant={tenant} />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="localization">
              <LocalizationTab tenant={tenant} />
            </TabsContent>
          )}

          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
