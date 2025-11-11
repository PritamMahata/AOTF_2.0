import { Shield } from "lucide-react"

export default function AdminLoginLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Shield className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading admin login...</p>
      </div>
    </div>
  )
}
