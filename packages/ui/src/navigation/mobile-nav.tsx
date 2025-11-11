"use client"

import type React from "react"

import { Button } from "@aotf/ui/components/button"

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
}

interface MobileNavProps {
  items: NavItem[]
  activeItem?: string
  onItemClick?: (itemId: string) => void
}

export function MobileNav({ items, activeItem, onItemClick }: MobileNavProps) {
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
  )
}
