'use client'

import { useState, useRef } from 'react'
import { Send, Plus, CheckSquare, StickyNote, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { cn } from '@/lib/utils'

interface QuickInputProps {
  onSubmit: (input: string, type: string) => void
  placeholder?: string
}

const suggestedActions = [
  { label: 'Add Task', type: 'task', icon: CheckSquare },
  { label: 'Create Note', type: 'note', icon: StickyNote },
  { label: 'Set Reminder', type: 'reminder', icon: Calendar },
  { label: 'Track Expense', type: 'expense', icon: DollarSign },
]

export function QuickInput({ 
  onSubmit, 
  placeholder = "What would you like to track today?" 
}: QuickInputProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { trackFeatureUsage } = useAdaptiveStore()

  const handleSubmit = async (e?: React.FormEvent, type = 'general') => {
    if (e) e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    trackFeatureUsage('quick-input', `submit_${type}`)
    
    try {
      await onSubmit(input.trim(), type)
      setInput('')
    } catch (error) {
      console.error('Failed to process input:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedAction = (type: string) => {
    if (input.trim()) {
      handleSubmit(undefined, type)
    } else {
      inputRef.current?.focus()
      trackFeatureUsage('quick-input', `focus_${type}`)
    }
  }

  const getTimeBasedPlaceholder = () => {
    const hour = new Date().getHours()
    
    if (hour < 12) {
      return "Good morning! What's on your agenda today?"
    } else if (hour < 17) {
      return "Good afternoon! What would you like to track?"
    } else {
      return "Good evening! How can I help you organize?"
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder || getTimeBasedPlaceholder()}
            className={cn(
              "h-14 pr-12 text-base grok-input",
              "border-2 border-border rounded-xl",
              "bg-background text-foreground",
              "placeholder:text-muted-foreground",
              "focus:border-primary focus:ring-2 focus:ring-primary/20"
            )}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "h-10 w-10 p-0 rounded-lg grok-button",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Suggested Actions */}
      <div className="flex flex-wrap justify-center gap-2">
        {suggestedActions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.type}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestedAction(action.type)}
              className={cn(
                "grok-button flex items-center space-x-2",
                "border-border hover:border-primary/30",
                "text-muted-foreground hover:text-foreground",
                "bg-transparent hover:bg-muted/50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{action.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Subtle hint text */}
      <p className="text-center text-xs text-muted-foreground">
        Type naturally - I'll understand what you want to track
      </p>
    </div>
  )
}