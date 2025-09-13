'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (message: string) => void
  loading: boolean
  placeholder: string
  centered?: boolean
}

export function ChatInput({ 
  value, 
  onChange, 
  onSubmit, 
  loading, 
  placeholder,
  centered = false 
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !loading) {
        onSubmit(value)
      }
    }
  }

  const handleSubmit = () => {
    if (value.trim() && !loading) {
      onSubmit(value)
    }
  }

  const showSendButton = value.trim().length > 0

  return (
    <div className={cn(
      "relative w-full transition-all duration-300",
      centered ? "max-w-2xl mx-auto" : ""
    )}>
      <div className={cn(
        "relative rounded-3xl overflow-hidden",
        "bg-gray-800 dark:bg-gray-800",
        "transition-all duration-200",
        isFocused ? "ring-2 ring-gray-600" : "",
        centered ? "shadow-xl border border-gray-700" : "border border-gray-700"
      )}>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={loading}
          className={cn(
            "w-full resize-none border-0 shadow-none focus-visible:ring-0",
            "min-h-[52px] max-h-[120px]",
            "px-5 py-4 pr-14",
            "text-sm text-white placeholder:text-gray-400",
            "bg-transparent"
          )}
          rows={1}
        />
        
        {/* Send button - appears when user types */}
        {showSendButton && (
          <Button
            onClick={handleSubmit}
            disabled={loading || !value.trim()}
            size="sm"
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              "h-9 w-9 p-0 rounded-full",
              "bg-green-600 hover:bg-green-700 text-white",
              "transition-all duration-200",
              "animate-in fade-in-0 zoom-in-95"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      
      {/* Character hint for centered state */}
      {centered && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      )}
    </div>
  )
}
