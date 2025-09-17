'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResizableSidebarProps {
  children: ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  storageKey?: string
  className?: string
}

export function ResizableSidebar({
  children,
  defaultWidth = 300,
  minWidth = 200,
  maxWidth = 500,
  storageKey = 'sidebar-width',
  className
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  // Load saved width from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem(storageKey)
    if (savedWidth) {
      const parsed = parseInt(savedWidth, 10)
      if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
        setWidth(parsed)
      }
    }
  }, [storageKey, minWidth, maxWidth])

  // Save width to localStorage when it changes
  useEffect(() => {
    if (!isResizing) {
      localStorage.setItem(storageKey, width.toString())
    }
  }, [width, isResizing, storageKey])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = e.clientX - startXRef.current
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidthRef.current + deltaX)
      )
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, minWidth, maxWidth])

  return (
    <div
      ref={sidebarRef}
      className={cn('relative flex-shrink-0', className)}
      style={{ width: `${width}px` }}
    >
      {children}

      {/* Resize Handle */}
      <div
        className={cn(
          'absolute top-0 right-0 w-1 h-full cursor-ew-resize group',
          'hover:bg-blue-500/20 transition-colors',
          isResizing && 'bg-blue-500/30'
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Visual indicator on hover/drag */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 right-0 w-0.5 h-12',
            'bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-full',
            isResizing && 'opacity-100 bg-blue-500'
          )}
        />
      </div>
    </div>
  )
}