"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AdminAuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verify admin authentication with backend
        const response = await fetch('/api/auth/admin/verify', {
          method: 'GET',
          credentials: 'include', // Include cookies
        })

        const data = await response.json()        
        if (response.ok && data.success) {
          setIsAuthorized(true)
          // Update localStorage with admin info including permissions
          localStorage.setItem("userRole", "admin")
          localStorage.setItem("adminInfo", JSON.stringify({
            name: data.admin.name,
            email: data.admin.email,
            role: data.admin.role,
            permissions: data.admin.permissions,
          }))
        } else {
          // Clear any stale data
          localStorage.removeItem("userRole")
          localStorage.removeItem("adminInfo")
          router.push("/admin/login")
        }
      } catch (error) {
        console.error('Admin auth verification error:', error)
        localStorage.removeItem("userRole")
        localStorage.removeItem("adminInfo")
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
