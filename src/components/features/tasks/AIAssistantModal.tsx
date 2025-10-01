'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChatInput } from './chat/ChatInput'
import { ChatMessage } from './chat/ChatMessage'
import {
  X,
  Sparkles,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  taskLists?: any[]
  suggestions?: string[]
}

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  messages: Message[]
  onSendMessage: (message: string) => Promise<void>
  loading: boolean
  error: string | null
  onTaskAction?: (action: string, taskId: string, data: any) => void
}

export function AIAssistantModal({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  loading,
  error,
  onTaskAction
}: AIAssistantModalProps) {
  const [inputValue, setInputValue] = useState('')
  const [isMaximized, setIsMaximized] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSubmit = async (message: string) => {
    if (!message.trim() || loading) return

    setInputValue('')
    await onSendMessage(message.trim())
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col',
          'transition-all duration-300',
          isMaximized
            ? 'inset-4'
            : 'bottom-6 right-6 w-[500px] h-[600px]'
        )}
        style={{
          maxWidth: isMaximized ? 'none' : '90vw',
          maxHeight: isMaximized ? 'none' : '90vh'
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950/95">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AI Task Assistant</h3>
              <p className="text-xs text-gray-500">
                Natural language task management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMaximized(!isMaximized)}
              className="h-8 w-8 p-0"
            >
              {isMaximized ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Task Assistant</h3>
              <p className="text-sm text-gray-400 max-w-sm mb-6">
                I can help you create, organize, and manage tasks using natural language.
                Just tell me what you need to do!
              </p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                <div className="text-xs text-left p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <span className="text-gray-500">Try:</span>
                  <span className="ml-2 text-gray-300">"Add milk to shopping list"</span>
                </div>
                <div className="text-xs text-left p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <span className="text-gray-500">Try:</span>
                  <span className="ml-2 text-gray-300">"Create a workout plan for this week"</span>
                </div>
                <div className="text-xs text-left p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <span className="text-gray-500">Try:</span>
                  <span className="ml-2 text-gray-300">"Remind me to call dentist tomorrow"</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex-shrink-0 px-4 py-2 bg-red-500/10 border-t border-red-500/20">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0 p-4 border-t border-gray-800 bg-gray-950/95">
          <ChatInput
            value={inputValue}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            loading={loading}
            placeholder="Ask me to create tasks, lists, or manage your todos..."
          />
        </div>
      </div>
    </>
  )
}
