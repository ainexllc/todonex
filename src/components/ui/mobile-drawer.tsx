'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  width?: string | number
}

export function MobileDrawer({
  isOpen,
  onClose,
  children,
  className,
  width = 220
}: MobileDrawerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [translateX, setTranslateX] = useState(-100)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      // First make visible, then animate
      setIsVisible(true)
      requestAnimationFrame(() => {
        setTranslateX(0)
      })
    } else {
      // Animate out, then hide
      setTranslateX(-100)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300) // Match transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
    currentXRef.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    currentXRef.current = e.touches[0].clientX
    const diff = currentXRef.current - startXRef.current

    // Only allow dragging to the left (closing gesture)
    if (diff < 0) {
      const percentage = Math.max(-100, (diff / window.innerWidth) * 100)
      setTranslateX(percentage)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const diff = currentXRef.current - startXRef.current
    const threshold = -50 // Swipe more than 50px to close

    if (diff < threshold) {
      onClose()
    } else {
      // Snap back to open position
      setTranslateX(0)
    }
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 bg-gray-950 border-r border-gray-800/70",
          "transition-transform duration-300 ease-out",
          "shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col",
          "h-full max-h-full overflow-hidden",
          className
        )}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          transform: `translateX(${translateX}%)`,
          transition: isDragging ? 'none' : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Edge gradient for depth */}
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-black/20 pointer-events-none" />

        {/* Swipe indicator */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-16 bg-gray-600/50 rounded-full transition-all hover:bg-gray-500/60 hover:w-1.5" />

        {children}
      </div>
    </>
  )
}