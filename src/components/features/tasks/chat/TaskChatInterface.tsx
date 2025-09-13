'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TaskListSidebar } from './TaskListSidebar'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { TaskListModal } from './TaskListModal'
import { useTaskChat } from '@/hooks/useTaskChat'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'

interface TaskChatInterfaceProps {
  className?: string
}

export function TaskChatInterface({ className }: TaskChatInterfaceProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [hasStarted, setHasStarted] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedTaskList, setSelectedTaskList] = useState<any>(null)
  const [showTaskListModal, setShowTaskListModal] = useState(false)
  const [selectedTaskListId, setSelectedTaskListId] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  const {
    messages,
    sendMessage,
    loading,
    error,
    taskLists,
    createTaskList,
    updateTaskList,
    deleteTaskList,
    resetConversation
  } = useTaskChat()

  // Reset conversation state when component mounts (fresh start)
  useEffect(() => {
    setHasStarted(false)
    setInputValue('')
    setSelectedTaskList(null)
    setShowTaskListModal(false)
    setSelectedTaskListId(null)
    resetConversation()
  }, [resetConversation])

  // Reset modal state when task lists change (prevents auto-popup on AI creation)
  useEffect(() => {
    setSelectedTaskList(null)
    setShowTaskListModal(false)
    setSelectedTaskListId(null)
  }, [taskLists.length])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (message: string) => {
    if (!message.trim() || !user) return
    
    // Mark that conversation has started
    if (!hasStarted) {
      setHasStarted(true)
    }
    
    // Clear the input field immediately
    setInputValue('')
    
    await sendMessage(message.trim())
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  const handleTaskListSelect = (taskList: any) => {
    if (taskList) {
      setSelectedTaskList(taskList)
      setSelectedTaskListId(taskList.id)
      setShowTaskListModal(true)
    } else {
      setSelectedTaskList(null)
      setSelectedTaskListId(null)
      setShowTaskListModal(false)
    }
  }

  const handleCloseTaskListModal = () => {
    setShowTaskListModal(false)
    setSelectedTaskList(null)
    setSelectedTaskListId(null)
  }

  // Show centered input when there are no active messages (regardless of task lists)
  if (messages.length === 0) {
    return (
      <div className={cn("flex h-full", className)}>
        {/* Task List Sidebar */}
        <TaskListSidebar
          taskLists={taskLists}
          selectedTaskListId={selectedTaskListId}
          onTaskListSelect={handleTaskListSelect}
          onCreateNew={() => router.push('/tasks/new')}
          onTaskListDelete={deleteTaskList}
          className="flex-shrink-0"
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl">
              {/* Compact Instructions Above Input */}
              <div className="text-center mb-6">
                <p className="text-xs text-muted-foreground mb-2">
                  Create and manage tasks with natural language
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center text-[10px] text-muted-foreground">
                  {[
                    "Create shopping list",
                    "Plan morning routine",
                    "Organize by priority"
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleSubmit(example)}
                      className="px-2 py-0.5 text-[10px] bg-primary/10 hover:bg-primary/20 text-primary rounded-full border border-primary/20 transition-colors"
                      disabled={loading}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input - Centered in the middle */}
              <ChatInput
                value={inputValue}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                loading={loading}
                placeholder="Describe what tasks you want to create or manage..."
                centered={true}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If conversation has messages, show full chat interface with sidebar
  return (
    <div className={cn("flex h-full", className)}>
      {/* Task List Sidebar */}
      <TaskListSidebar
        taskLists={taskLists}
        selectedTaskListId={selectedTaskListId}
        onTaskListSelect={handleTaskListSelect}
        onCreateNew={() => router.push('/tasks/new')}
        onTaskListDelete={deleteTaskList}
        className="flex-shrink-0"
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Scrollable Chat area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              onTaskAction={(action, taskId, data) => {
                // Handle task actions
                switch (action) {
                  case 'create':
                    createTaskList(data.title, data.tasks)
                    break
                  case 'update':
                    updateTaskList(taskId, data)
                    break
                  case 'delete':
                    deleteTaskList(taskId)
                    break
                }
              }}
            />
          ))}
          
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              <span>AI is thinking...</span>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Bottom input field */}
        <div className="flex-shrink-0 border-t border-border p-4 bg-background/95 backdrop-blur-sm">
          <ChatInput
            value={inputValue}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            loading={loading}
            placeholder="Ask anything about your tasks..."
            centered={false}
          />
        </div>
      </div>

      {/* Task List Modal */}
      <TaskListModal
        taskList={selectedTaskList}
        isOpen={showTaskListModal}
        onClose={handleCloseTaskListModal}
        onTaskUpdate={(taskId, updates) => {
          // Update task in the selected task list
          if (selectedTaskList) {
            updateTaskList(selectedTaskList.id, {
              tasks: selectedTaskList.tasks.map((task: any) =>
                task.id === taskId ? { ...task, ...updates } : task
              )
            })
          }
        }}
        onTaskDelete={(taskId) => {
          // Remove task from the selected task list
          if (selectedTaskList) {
            updateTaskList(selectedTaskList.id, {
              tasks: selectedTaskList.tasks.filter((task: any) => task.id !== taskId)
            })
          }
        }}
        onTaskListDelete={(taskListId) => {
          deleteTaskList(taskListId)
        }}
      />
    </div>
  )
}
