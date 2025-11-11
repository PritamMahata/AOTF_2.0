"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@aotf/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aotf/ui/components/card"
import { Input } from "@aotf/ui/components/input"
import { Label } from "@aotf/ui/components/label"
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@aotf/ui/components/alert"
import { signIn } from "next-auth/react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("admin-credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: "/admin/posts",
      })

      if (!result) {
        setError("Unexpected response from sign-in. Please try again.")
        return
      }

      if (result.error) {
        const message = result.error === "CredentialsSignin" ? "Invalid email or password" : result.error
        setError(message || "Login failed. Please check your credentials.")
        return
      }

      try {
        const verifyResponse = await fetch("/api/auth/admin/verify", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (verifyResponse.ok) {
          const data = await verifyResponse.json()
          if (data?.admin) {
            localStorage.setItem("userRole", "admin")
            localStorage.setItem("adminInfo", JSON.stringify({
              name: data.admin.name,
              email: data.admin.email,
              role: data.admin.role,
              permissions: data.admin.permissions,
            }))
          }
        }
      } catch {
        // Ignore verification failures here; guard will retry on navigation
      }

      router.push("/admin/posts")
    } catch (err) {
      console.error("Admin Login error:", err)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Admin Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Admin Panel</span>
          </div>
          <p className="text-sm text-muted-foreground">AOT Tuition Services</p>
        </div>

        {/* Admin Login Form */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>Sign in with your administrator credentials</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In as Admin"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
