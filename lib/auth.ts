import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        subdomain: { label: "Subdomain", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenant: true },
        })

        if (!user) {
          throw new Error("Invalid credentials")
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValidPassword) {
          throw new Error("Invalid credentials")
        }

        // CRUCIAL: Tenant-aware authentication logic
        if (credentials.subdomain) {
          // If user is NOT a superadmin, they must match the subdomain's tenant
          if (user.role !== UserRole.SUPERADMIN) {
            // Get tenant for this subdomain
            const tenant = await prisma.tenant.findUnique({
              where: { subdomain: credentials.subdomain },
            })

            if (!tenant) {
              throw new Error("Tenant not found")
            }

            // Check if tenant is active
            if (!tenant.isActive) {
              throw new Error("This hostel account has been disabled")
            }

            // Check if user's tenantId matches the subdomain's tenant
            if (user.tenantId !== tenant.id) {
              throw new Error("You don't have access to this hostel")
            }
          }
          // Superadmins can log in to any subdomain
        }

        // Return user data for session
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          subdomain: user.tenant?.subdomain || credentials.subdomain,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login", // Will be overridden per subdomain
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.tenantId = (user as any).tenantId
        token.subdomain = (user as any).subdomain
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).role = token.role
        (session.user as any).tenantId = token.tenantId
        (session.user as any).subdomain = token.subdomain
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
