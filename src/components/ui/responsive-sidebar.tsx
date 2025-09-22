'use client'

import { ReactNode } from 'react'
import { ResizableSidebar } from './resizable-sidebar'
import { MobileDrawer } from './mobile-drawer'
import { useIsMobile } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

interface ResponsiveSidebarProps {
  children: ReactNode
  isOpen?: boolean
  onClose?: () => void
  isCollapsed?: boolean
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  storageKey?: string
  className?: string
}

export function ResponsiveSidebar({
  children,
  isOpen = false,
  onClose,
  isCollapsed = false,
  defaultWidth = 300,
  minWidth = 200,
  maxWidth = 500,
  storageKey = 'sidebar-width',
  className
}: ResponsiveSidebarProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <MobileDrawer
        isOpen={isOpen}
        onClose={onClose || (() => {})}
        className={className}
      >
        {children}
      </MobileDrawer>
    )
  }

  // Desktop: Use resizable sidebar
  return (
    <ResizableSidebar
      defaultWidth={isCollapsed ? 50 : defaultWidth}
      minWidth={isCollapsed ? 50 : minWidth}
      maxWidth={isCollapsed ? 50 : maxWidth}
      storageKey={storageKey}
      className={cn(
        'h-full bg-gray-950 border-r border-gray-800',
        className
      )}
    >
      {children}
    </ResizableSidebar>
  )
}