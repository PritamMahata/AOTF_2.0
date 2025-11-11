"use client"

import type React from "react"

import { Button } from "@aotf/ui/components/button"
import { Card, CardContent } from "@aotf/ui/components/card"
import { cn } from "@aotf/lib"

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
}

interface SidebarNavProps {
  items: NavItem[]
  activeItem?: string
  onItemClick?: (itemId: string) => void
  className?: string
}

export function SidebarNav({ items, activeItem, onItemClick, className }: SidebarNavProps) {
  const handleItemClick = (item: NavItem) => {
    if (item.onClick) {
      item.onClick()
    } else if (onItemClick) {
      onItemClick(item.id)
    } else if (item.href) {
      window.location.href = item.href
    }
  }

  return (
    <Card className={cn("lg:block", className)}>
      <CardContent className="p-4">
        <nav className="space-y-2">
          {items.map((item) => (
            <Button
              key={item.id}
              variant={activeItem === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleItemClick(item)}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}
