'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { QuickActionsGrid } from './QuickActionsGrid'
import { ChatMessage } from '../tasks/chat/ChatMessage'
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIContext {
  viewMode: string
  visibleTaskCount: number
  selectedTaskCount: number
  activeListId: string | null
}

interface AIAssistantPanelProps {
  collapsed: boolean
  onToggleCollapse: () => void
  messages: Message[]
  onSendMessage: (message: string, context?: AIContext) => Promise<void>
  loading: boolean
  error: string | null
  context?: AIContext
  className?: string
}

export function AIAssistantPanel({
  collapsed,
  onToggleCollapse,
  messages,
  onSendMessage,
  loading,
  error,
  context,
  className
}: AIAssistantPanelProps) {
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || loading) return

    const message = inputValue.trim()
    setInputValue('')

    await onSendMessage(message, context)
  }

  const handleQuickAction = async (action: any) => {
    await onSendMessage(action.prompt, context)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (collapsed) {
    return (
      <div className={cn(
        'w-12 bg-gray-900 border-l border-gray-800 flex flex-col items-center py-4 gap-4',
        className
      )}>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
          title="Expand AI Assistant"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 flex items-center writing-vertical-rl transform rotate-180">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Sparkles className="h-4 w-4" />
            <span>AI Assistant</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'flex flex-col bg-gray-900 border-l border-gray-800 h-full',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">AI Assistant</h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleCollapse}
          className="h-7 w-7 p-0"
          title="Collapse"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Context Info */}
      {context && messages.length > 0 && (
        <div className="px-3 py-2 bg-gray-800/30 border-b border-gray-800">
          <div className="text-[10px] text-gray-400 space-y-0.5">
            <div>View: <span className="text-gray-300 capitalize">{context.viewMode}</span></div>
            {context.visibleTaskCount > 0 && (
              <div>Visible: <span className="text-gray-300">{context.visibleTaskCount} tasks</span></div>
            )}
            {context.selectedTaskCount > 0 && (
              <div>Selected: <span className="text-primary">{context.selectedTaskCount} tasks</span></div>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col">
            {/* Welcome Message */}
            <div className="p-4 space-y-2">
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Hi! I'm your AI assistant. I can help you manage tasks, plan your day, and stay organized.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex-1 overflow-y-auto">
              <QuickActionsGrid onActionClick={handleQuickAction} />
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div ref={scrollRef} className="p-3 space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={cn(
                  'flex gap-2',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  {message.role === 'assistant' && (
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    'rounded-lg px-3 py-2 max-w-[85%]',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-800 text-gray-100'
                  )}>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <span className="text-[10px] opacity-60 mt-1 block">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {message.role === 'user' && (
                    <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 text-[10px]">
                      You
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  </div>
                  <div className="bg-gray-800 rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1 h-9 text-xs"
            disabled={loading}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!inputValue.trim() || loading}
            className="h-9 w-9 p-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>

        {messages.length === 0 && (
          <p className="text-[10px] text-gray-500 mt-2">
            Tip: I can see what tasks you're viewing and help you manage them
          </p>
        )}
      </div>
    </div>
  )
}
