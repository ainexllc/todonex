'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingAIButtonProps {
  onClick: () => void
  hasUnreadMessages?: boolean
  messageCount?: number
  className?: string
}

export function FloatingAIButton({
  onClick,
  hasUnreadMessages = false,
  messageCount = 0,
  className
}: FloatingAIButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'group relative',
        'flex items-center justify-center',
        'h-16 w-16 rounded-full',
        'bg-gradient-to-br from-primary to-primary/80',
        'shadow-lg hover:shadow-2xl',
        'transition-all duration-300 ease-out',
        'hover:scale-110 active:scale-95',
        'border-2 border-primary/20',
        className
      )}
      aria-label="Open AI Assistant"
    >
      {/* Pulsing ring animation */}
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />

      {/* Main icon */}
      <Sparkles className="h-8 w-8 text-white relative z-10 animate-pulse" />

      {/* Message count badge */}
      {messageCount > 0 && (
        <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-900">
          {messageCount > 9 ? '9+' : messageCount}
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        AI Assistant
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800" />
      </div>
    </button>
  )
}
