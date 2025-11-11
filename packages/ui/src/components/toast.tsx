"use client"

import * as React from "react"
import type { ToastProps, ToastActionElement } from "./toast.types"

export type { ToastProps, ToastActionElement }

const Toast = React.forwardRef<HTMLDivElement, ToastProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", variant = "default", title, description, action, ...props }, ref) => {
    const variants = {
      default: "bg-background border",
      destructive: "bg-destructive text-destructive-foreground border-destructive",
    }

    return (
      <div
        ref={ref}
        className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${variants[variant]} ${className}`}
        {...props}
      >
        <div className="grid gap-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
        {action}
      </div>
    )
  }
)
Toast.displayName = "Toast"

const ToastAction = ({ altText, onClick, children }: ToastActionElement) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-2"
      aria-label={altText}
    >
      {children}
    </button>
  )
}

const ToastClose = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none group-hover:opacity-100"
    >
      ✕
    </button>
  )
}

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`text-sm font-semibold ${className}`} {...props} />
  )
)
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div ref={ref} className={`text-sm opacity-90 ${className}`} {...props} />
  )
)
ToastDescription.displayName = "ToastDescription"

export type ToastActionProps = React.ComponentPropsWithoutRef<typeof ToastAction>

export { Toast, ToastAction, ToastClose, ToastTitle, ToastDescription }
