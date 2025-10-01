'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChatInput } from './chat/ChatInput'
import { ChatMessage } from './chat/ChatMessage'
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  taskLists?: any[]
  suggestions?: string[]
}

interface CompactAIChatProps {
  messages: Message[]
  onSendMessage: (message: string) => Promise<void>
  loading: boolean
  error: string | null
  collapsed?: boolean
  onToggleCollapse?: () => void
  onTaskAction?: (action: string, taskId: string, data: any) => void
  className?: string
}

export function CompactAIChat({
  messages,
  onSendMessage,
  loading,
  error,
  collapsed = false,
  onToggleCollapse,
  onTaskAction,
  className
}: CompactAIChatProps) {
  const [inputValue, setInputValue] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (message: string) => {
    if (!message.trim() || loading) return

    setInputValue('')
    await onSendMessage(message.trim())
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  if (collapsed) {
    return (
      <div className={cn('flex items-center justify-between px-4 py-2 bg-gray-950/95 border-t border-gray-800', className)}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Assistant</span>
          {messages.length > 0 && (
            <Badge className="ml-2">{messages.length} messages</Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleCollapse}
          className="h-8"
        >
          <ChevronUp className="h-4 w-4" />
          <span className="ml-2">Expand</span>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full bg-gray-950/95 border-t border-gray-800', className)}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-1.5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-xs font-semibold">AI Assistant</h3>
          {messages.length > 0 && (
            <span className="text-xs text-gray-500">({messages.length})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                // Clear conversation
                if (window.confirm('Clear conversation history?')) {
                  // This would need to be passed as a prop
                }
              }}
              className="h-6 text-xs px-2"
            >
              <X className="h-3 w-3 mr-0.5" />
              Clear
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
            className="h-6 px-2"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages Area - scrollable middle section */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-4">
            <Sparkles className="h-8 w-8 text-primary/50 mb-2" />
            <p className="text-xs font-medium text-gray-300">Chat with AI to create tasks</p>
            <p className="text-xs text-gray-500 mt-1 max-w-md">
              Try: "Add buy milk and eggs to my shopping list" or "Plan my day tomorrow"
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                onTaskAction={onTaskAction}
                onSendMessage={onSendMessage}
              />
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin h-3 w-3 border-1.5 border-primary border-t-transparent rounded-full" />
                <span className="text-xs">AI is thinking...</span>
              </div>
            )}

            {error && (
              <div className="p-1.5 bg-red-900/20 border border-red-800 rounded-sm">
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Input Area - always visible at bottom */}
      <div className="flex-shrink-0 p-2 border-t border-gray-800 bg-gray-950">
        <ChatInput
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          loading={loading}
          placeholder="Ask AI to create or manage tasks..."
          centered={false}
        />
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('px-1.5 py-0.5 text-[10px] bg-primary/20 text-primary rounded', className)}>
      {children}
    </span>
  )
}
