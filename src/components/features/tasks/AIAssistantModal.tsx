'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
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
  const [previewDismissed, setPreviewDismissed] = useState(false)
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const previewLists = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i]
      if (message.role === 'assistant' && message.taskLists && message.taskLists.length > 0) {
        return message.taskLists
      }
    }
    return []
  }, [messages])

  useEffect(() => {
    setPreviewDismissed(false)
    setSelectedPreviewIndex(0)
  }, [previewLists.length])

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
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm dark:bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed z-50 flex flex-col rounded-2xl border border-border shadow-2xl backdrop-blur',
          'bg-background/95 supports-[backdrop-filter]:bg-background/80',
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
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-muted/80 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 via-primary/20 to-primary/60">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Task Assistant</h3>
              <p className="text-xs text-muted-foreground">
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
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">AI Task Assistant</h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                I can help you create, organize, and manage tasks using natural language. Just tell me what you need to
                do!
              </p>
              <div className="grid w-full max-w-md grid-cols-1 gap-2">
                <div className="rounded-lg border border-border/40 bg-muted/50 p-3 text-left text-xs">
                  <span className="text-muted-foreground">Try:</span>
                  <span className="ml-2 text-foreground">"Add milk to shopping list"</span>
                </div>
                <div className="rounded-lg border border-border/40 bg-muted/50 p-3 text-left text-xs">
                  <span className="text-muted-foreground">Try:</span>
                  <span className="ml-2 text-foreground">"Create a workout plan for this week"</span>
                </div>
                <div className="rounded-lg border border-border/40 bg-muted/50 p-3 text-left text-xs">
                  <span className="text-muted-foreground">Try:</span>
                  <span className="ml-2 text-foreground">"Remind me to call dentist tomorrow"</span>
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
          <div className="flex-shrink-0 border-t border-destructive/20 bg-destructive/10 px-4 py-2">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {previewLists.length > 0 && !previewDismissed && onTaskAction && (
          <div className="flex-shrink-0 border-t border-border bg-muted/70 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Suggested tasks</p>
                <p className="text-xs text-muted-foreground">
                  Review and add them directly to your workspace.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {previewLists.length > 1 && (
                  <select
                    value={selectedPreviewIndex}
                    onChange={(e) => setSelectedPreviewIndex(Number(e.target.value))}
                    className="rounded-lg border border-border bg-background/90 px-2 py-1 text-xs text-foreground shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {previewLists.map((list: any, index: number) => (
                      <option key={list.title ?? index} value={index}>
                        {(list.title || 'List') + ` (${(list.tasks ?? []).length})`}
                      </option>
                    ))}
                  </select>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setPreviewDismissed(true)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
            {previewLists[selectedPreviewIndex] && (
              <div className="space-y-3">
                <div className="rounded-lg border border-border/60 bg-background/80 p-3">
                  <p className="mb-2 text-sm font-medium text-foreground">
                    {previewLists[selectedPreviewIndex].title || 'Untitled list'}
                  </p>
                  <ul className="space-y-2">
                    {(previewLists[selectedPreviewIndex].tasks || []).map((task: any, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <div>
                          <p className="font-medium text-foreground">{task.title}</p>
                          {task.description && (
                            <p className="text-[11px] text-muted-foreground">{task.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-8 px-4 text-xs"
                    onClick={() => {
                      onTaskAction('create', '', previewLists[selectedPreviewIndex])
                      setPreviewDismissed(true)
                    }}
                  >
                    Add to board
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      setPreviewDismissed(true)
                      if (previewLists[selectedPreviewIndex]?.tasks?.[0]?.title) {
                        setInputValue(
                          previewLists[selectedPreviewIndex].tasks.map((task: any) => task.title).join(', ')
                        )
                      }
                    }}
                  >
                    Edit first
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-border bg-muted/80 p-4 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
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
