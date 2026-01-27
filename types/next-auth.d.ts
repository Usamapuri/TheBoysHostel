import { UserRole } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      tenantId: string | null
      subdomain?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: UserRole
    tenantId: string | null
    subdomain?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    tenantId: string | null
    subdomain?: string
  }
}
