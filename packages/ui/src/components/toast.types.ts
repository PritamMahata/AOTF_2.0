export interface ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
}

export interface ToastActionElement {
  altText: string
  onClick: () => void
  children: React.ReactNode
}
