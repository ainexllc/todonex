'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TaskListSidebar } from './TaskListSidebar'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { TaskListView } from './TaskListView'
import { TaskCompleted } from './TaskCompleted'
import { ResizableSidebar } from '@/components/ui/resizable-sidebar'
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
  const [showInlineTaskList, setShowInlineTaskList] = useState(false)
  const [selectedTaskListId, setSelectedTaskListId] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Load collapsed state from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed')
      return saved === 'true'
    }
    return false
  })
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
    resetConversation,
    reloadTaskLists
  } = useTaskChat()

  // Reset conversation state when component mounts (fresh start)
  useEffect(() => {
    setHasStarted(false)
    setInputValue('')
    setSelectedTaskList(null)
    setShowInlineTaskList(false)
    setSelectedTaskListId(null)
    resetConversation()
  }, [resetConversation])

  // Reset modal state when task lists change (prevents auto-popup on AI creation)
  useEffect(() => {
    setSelectedTaskList(null)
    setShowInlineTaskList(false)
    setSelectedTaskListId(null)
  }, [taskLists.length])

  // Sync selectedTaskList with taskLists when modal is open
  useEffect(() => {
    if (showInlineTaskList && selectedTaskListId) {
      const currentList = taskLists.find(list => list.id === selectedTaskListId)
      if (currentList) {
        // Update selectedTaskList if the data has changed
        if (JSON.stringify(currentList) !== JSON.stringify(selectedTaskList)) {
          setSelectedTaskList(currentList)
        }
      } else {
        // If the selected list no longer exists (was deleted), close modal
        setShowInlineTaskList(false)
        setSelectedTaskList(null)
        setSelectedTaskListId(null)
      }
    }
  }, [taskLists, selectedTaskListId, showInlineTaskList, selectedTaskList])

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
      setShowInlineTaskList(true)
    } else {
      setSelectedTaskList(null)
      setSelectedTaskListId(null)
      setShowInlineTaskList(false)
    }
  }

  const handleCloseTaskList = () => {
    setShowInlineTaskList(false)
    setSelectedTaskList(null)
    setSelectedTaskListId(null)
  }

  const handleDeleteTaskList = async (taskListId: string) => {
    // If the deleted list is currently selected, close the modal
    if (selectedTaskListId === taskListId) {
      setShowInlineTaskList(false)
      setSelectedTaskList(null)
      setSelectedTaskListId(null)
    }
    await deleteTaskList(taskListId)
  }

  const handleCompletedClick = () => {
    setShowCompleted(true)
  }

  const handleCompletedClose = () => {
    setShowCompleted(false)
  }

  const handleSidebarCollapse = () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', newState.toString())
    }
  }

  // Show centered input when there are no active messages (regardless of task lists)
  if (messages.length === 0) {
    return (
      <div className={cn("flex h-full", className)}>
        {/* Task List Sidebar */}
        <ResizableSidebar
          defaultWidth={isSidebarCollapsed ? 50 : 200}
          minWidth={isSidebarCollapsed ? 50 : 200}
          maxWidth={isSidebarCollapsed ? 50 : 400}
          storageKey="task-sidebar-width"
        >
          <TaskListSidebar
            taskLists={taskLists}
            selectedTaskListId={selectedTaskListId}
            onTaskListSelect={handleTaskListSelect}
            onTaskListDelete={handleDeleteTaskList}
            onTaskListRename={async (taskListId, newTitle) => {
              await updateTaskList(taskListId, { title: newTitle })
              // Update local state if this is the selected task list
              if (selectedTaskList && selectedTaskList.id === taskListId) {
                setSelectedTaskList({ ...selectedTaskList, title: newTitle })
              }
            }}
            onRefresh={reloadTaskLists}
            onCompletedClick={handleCompletedClick}
            onCollapse={handleSidebarCollapse}
            isCollapsed={isSidebarCollapsed}
            className="h-full"
          />
        </ResizableSidebar>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-900 chat-content-area">
          <div className="flex-1 flex flex-col p-4">
            {/* Show selected task list inline at top */}
            {showInlineTaskList && selectedTaskList && (
              <TaskListView
                taskList={selectedTaskList}
                onClose={handleCloseTaskList}
                onTaskUpdate={async (taskId, updates) => {
                  // Update task in the selected task list
                  if (selectedTaskList) {
                    // First update local state immediately for responsive UI
                    let updatedTasks = selectedTaskList.tasks.map((task: any) =>
                      task.id === taskId ? { ...task, ...updates } : task
                    )

                    // Auto-remove completed tasks from active list (but keep in Firebase for history)
                    if (updates.completed === true) {
                      console.log('TaskChatInterface: Auto-removing completed task from active view:', taskId)
                      updatedTasks = updatedTasks.filter((task: any) => task.id !== taskId)
                    }

                    setSelectedTaskList({ ...selectedTaskList, tasks: updatedTasks })

                    // Prepare ALL tasks for Firebase (including the completed one for history)
                    const allTasksForFirebase = selectedTaskList.tasks.map((task: any) => {
                      const taskToSave = task.id === taskId ? { ...task, ...updates } : task
                      const firebaseTask: any = {
                        ...taskToSave,
                        completedAt: taskToSave.completedAt ? new Date(taskToSave.completedAt).toISOString() : null
                      }
                      // Only add dueDate if it exists (Firebase doesn't accept undefined)
                      if (taskToSave.dueDate) {
                        firebaseTask.dueDate = new Date(taskToSave.dueDate).toISOString()
                      }
                      return firebaseTask
                    })

                    // Save all tasks to Firebase (including completed ones for history)
                    await updateTaskList(selectedTaskList.id, { tasks: allTasksForFirebase })
                  }
                }}
                onTaskDelete={async (taskId) => {
                  // Remove task from the selected task list
                  if (selectedTaskList) {
                    // First update local state immediately for responsive UI
                    const updatedTasks = selectedTaskList.tasks.filter((task: any) => task.id !== taskId)
                    setSelectedTaskList({ ...selectedTaskList, tasks: updatedTasks })

                    // Prepare tasks for Firebase (convert Date objects to ISO strings)
                    const tasksForFirebase = updatedTasks.map((task: any) => {
                      const firebaseTask: any = {
                        ...task,
                        completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null
                      }
                      // Only add dueDate if it exists (Firebase doesn't accept undefined)
                      if (task.dueDate) {
                        firebaseTask.dueDate = new Date(task.dueDate).toISOString()
                      }
                      return firebaseTask
                    })

                    // Then update Firebase
                    await updateTaskList(selectedTaskList.id, { tasks: tasksForFirebase })
                  }
                }}
                onTaskListDelete={async (taskListId) => {
                  await deleteTaskList(taskListId)
                }}
                onTaskListRename={async (taskListId, newTitle) => {
                  // Update the title in Firebase
                  await updateTaskList(taskListId, { title: newTitle })
                  // Update local state
                  if (selectedTaskList && selectedTaskList.id === taskListId) {
                    setSelectedTaskList({ ...selectedTaskList, title: newTitle })
                  }
                }}
              />
            )}

            {/* Centered content when no list is selected */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-2xl">
                {/* Compact Instructions Above Input */}
                <div className="text-center mb-4">
                  <p className="text-[13px] text-gray-400 mb-2">
                    Create and manage tasks with natural language
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center text-[13px] text-gray-400">
                    {[
                      "Set daily goals",
                      "Plan morning routine",
                      "Organize by priority"
                    ].map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleSubmit(example)}
                        className="px-2 py-1 text-[13px] bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 rounded-full border border-gray-700 transition-colors"
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

        {/* Completed Tasks Modal */}
        {showCompleted && (
          <TaskCompleted onClose={handleCompletedClose} />
        )}
      </div>
    )
  }

  // If conversation has messages, show full chat interface with sidebar
  return (
    <div className={cn("flex h-full", className)}>
      {/* Task List Sidebar */}
      <ResizableSidebar
        defaultWidth={isSidebarCollapsed ? 50 : 200}
        minWidth={isSidebarCollapsed ? 50 : 200}
        maxWidth={isSidebarCollapsed ? 50 : 400}
        storageKey="task-sidebar-width"
      >
        <TaskListSidebar
          taskLists={taskLists}
          selectedTaskListId={selectedTaskListId}
          onTaskListSelect={handleTaskListSelect}
          onTaskListDelete={handleDeleteTaskList}
          onTaskListRename={async (taskListId, newTitle) => {
            await updateTaskList(taskListId, { title: newTitle })
            // Update local state if this is the selected task list
            if (selectedTaskList && selectedTaskList.id === taskListId) {
              setSelectedTaskList({ ...selectedTaskList, title: newTitle })
            }
          }}
          onCompletedClick={handleCompletedClick}
          onCollapse={handleSidebarCollapse}
          isCollapsed={isSidebarCollapsed}
          className="h-full"
        />
      </ResizableSidebar>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900 chat-content-area">
        {/* Scrollable Chat area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {/* Show selected task list inline */}
          {showInlineTaskList && selectedTaskList && (
            <TaskListView
              taskList={selectedTaskList}
              onClose={handleCloseTaskList}
              onTaskUpdate={async (taskId, updates) => {
                console.log('TaskChatInterface: Received task update for', taskId, 'with updates:', updates)
                // Update task in the selected task list
                if (selectedTaskList) {
                  // First update local state immediately for responsive UI
                  let updatedTasks = selectedTaskList.tasks.map((task: any) =>
                    task.id === taskId ? { ...task, ...updates } : task
                  )

                  // Auto-remove completed tasks from active list (but keep in Firebase for history)
                  if (updates.completed === true) {
                    console.log('TaskChatInterface: Auto-removing completed task from active view:', taskId)
                    updatedTasks = updatedTasks.filter((task: any) => task.id !== taskId)
                  }

                  console.log('TaskChatInterface: Updated tasks before Firebase:', updatedTasks)
                  setSelectedTaskList({ ...selectedTaskList, tasks: updatedTasks })

                  // Prepare ALL tasks for Firebase (including the completed one for history)
                  const allTasksForFirebase = selectedTaskList.tasks.map((task: any) => {
                    const taskToSave = task.id === taskId ? { ...task, ...updates } : task
                    const firebaseTask: any = {
                      ...taskToSave,
                      completedAt: taskToSave.completedAt ? new Date(taskToSave.completedAt).toISOString() : null
                    }
                    // Only add dueDate if it exists (Firebase doesn't accept undefined)
                    if (taskToSave.dueDate) {
                      firebaseTask.dueDate = new Date(taskToSave.dueDate).toISOString()
                    }
                    return firebaseTask
                  })
                  console.log('TaskChatInterface: Tasks prepared for Firebase:', allTasksForFirebase)

                  // Save all tasks to Firebase (including completed ones for history)
                  await updateTaskList(selectedTaskList.id, { tasks: allTasksForFirebase })
                  console.log('TaskChatInterface: Firebase update completed')
                }
              }}
              onTaskDelete={async (taskId) => {
                // Remove task from the selected task list
                if (selectedTaskList) {
                  // First update local state immediately for responsive UI
                  const updatedTasks = selectedTaskList.tasks.filter((task: any) => task.id !== taskId)
                  setSelectedTaskList({ ...selectedTaskList, tasks: updatedTasks })

                  // Prepare tasks for Firebase (convert Date objects to ISO strings)
                  const tasksForFirebase = updatedTasks.map((task: any) => {
                    const firebaseTask: any = {
                      ...task,
                      completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null
                    }
                    // Only add dueDate if it exists (Firebase doesn't accept undefined)
                    if (task.dueDate) {
                      firebaseTask.dueDate = new Date(task.dueDate).toISOString()
                    }
                    return firebaseTask
                  })
                  console.log('TaskChatInterface: Tasks prepared for Firebase:', tasksForFirebase)

                  // Then update Firebase
                  await updateTaskList(selectedTaskList.id, { tasks: tasksForFirebase })
                  console.log('TaskChatInterface: Firebase update completed')
                }
              }}
              onTaskListDelete={async (taskListId) => {
                await deleteTaskList(taskListId)
              }}
              onTaskListRename={async (taskListId, newTitle) => {
                // Update the title in Firebase
                await updateTaskList(taskListId, { title: newTitle })
                // Update local state
                if (selectedTaskList && selectedTaskList.id === taskListId) {
                  setSelectedTaskList({ ...selectedTaskList, title: newTitle })
                }
              }}
            />
          )}

          {/* Chat messages */}
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              onTaskAction={async (action, taskId, data) => {
                console.log('TaskChatInterface: Handling task action:', action, 'with data:', data)

                // Handle task actions
                switch (action) {
                  case 'create':
                    await createTaskList(data.title, data.tasks)
                    break
                  case 'update':
                    await updateTaskList(taskId, data)
                    break
                  case 'delete':
                    await deleteTaskList(taskId)
                    break
                  case 'toggle':
                    // Toggle task completion
                    if (selectedTaskList && taskId) {
                      const updatedTasks = selectedTaskList.tasks.map(task =>
                        task.id === taskId ? { ...task, ...data } : task
                      )
                      setSelectedTaskList({ ...selectedTaskList, tasks: updatedTasks })

                      // Update Firebase
                      const tasksForFirebase = updatedTasks.map((task: any) => {
                        const firebaseTask: any = {
                          ...task,
                          completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null
                        }
                        if (task.dueDate) {
                          firebaseTask.dueDate = new Date(task.dueDate).toISOString()
                        }
                        return firebaseTask
                      })
                      await updateTaskList(selectedTaskList.id, { tasks: tasksForFirebase })
                    }
                    break
                  case 'create_list':
                    // Create a new task list with the specified name
                    console.log('Creating new task list:', data)
                    await createTaskList(data, [])
                    break
                  case 'add_tasks':
                    // Parse tasks from the data string and add to current list
                    if (selectedTaskList && data) {
                      console.log('Adding tasks to current list:', data)
                      // Simple parsing - split by commas or newlines
                      const taskTitles = data.split(/[,\n]/).map((title: string) => title.trim()).filter(Boolean)
                      const newTasks = taskTitles.map((title: string) => ({
                        id: `task-${Date.now()}-${Math.random()}`,
                        title,
                        completed: false,
                        priority: 'medium' as const
                      }))

                      const updatedTasks = [...selectedTaskList.tasks, ...newTasks]
                      setSelectedTaskList({ ...selectedTaskList, tasks: updatedTasks })

                      // Update Firebase
                      const tasksForFirebase = updatedTasks.map((task: any) => {
                        const firebaseTask: any = {
                          ...task,
                          completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null
                        }
                        if (task.dueDate) {
                          firebaseTask.dueDate = new Date(task.dueDate).toISOString()
                        }
                        return firebaseTask
                      })
                      await updateTaskList(selectedTaskList.id, { tasks: tasksForFirebase })
                    }
                    break
                  case 'mark_complete':
                    // Mark tasks as complete based on title match
                    if (selectedTaskList && data) {
                      console.log('Marking tasks complete:', data)
                      const updatedTasks = selectedTaskList.tasks.map(task => {
                        if (task.title.toLowerCase().includes(data.toLowerCase())) {
                          return { ...task, completed: true, completedAt: new Date() }
                        }
                        return task
                      })
                      setSelectedTaskList({ ...selectedTaskList, tasks: updatedTasks })

                      // Update Firebase
                      const tasksForFirebase = updatedTasks.map((task: any) => {
                        const firebaseTask: any = {
                          ...task,
                          completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null
                        }
                        if (task.dueDate) {
                          firebaseTask.dueDate = new Date(task.dueDate).toISOString()
                        }
                        return firebaseTask
                      })
                      await updateTaskList(selectedTaskList.id, { tasks: tasksForFirebase })
                    }
                    break
                  case 'delete_task':
                    // Delete tasks based on title match
                    if (selectedTaskList && data) {
                      console.log('Deleting tasks:', data)
                      const updatedTasks = selectedTaskList.tasks.filter(task =>
                        !task.title.toLowerCase().includes(data.toLowerCase())
                      )
                      setSelectedTaskList({ ...selectedTaskList, tasks: updatedTasks })

                      // Update Firebase
                      const tasksForFirebase = updatedTasks.map((task: any) => {
                        const firebaseTask: any = {
                          ...task,
                          completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null
                        }
                        if (task.dueDate) {
                          firebaseTask.dueDate = new Date(task.dueDate).toISOString()
                        }
                        return firebaseTask
                      })
                      await updateTaskList(selectedTaskList.id, { tasks: tasksForFirebase })
                    }
                    break
                  case 'suggestion':
                    // Handle suggestion clicks - simulate user input
                    setInputValue(data)
                    await handleSubmit(data)
                    break
                  default:
                    console.warn('Unknown task action:', action)
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
            <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-[13px] text-red-300">{error}</p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom input field */}
        <div className="flex-shrink-0 border-t border-gray-800 p-4 bg-gray-950/95 backdrop-blur-sm">
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

      {/* Completed Tasks Modal */}
      {showCompleted && (
        <TaskCompleted onClose={handleCompletedClose} />
      )}
    </div>
  )
}
