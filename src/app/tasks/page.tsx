'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, WifiOff, Sparkles, ChevronDown, ChevronUp, Target, Zap, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskList } from '@/components/features/tasks/task-list'
import { TaskForm } from '@/components/features/tasks/task-form'
import { TaskFilters } from '@/components/features/tasks/task-filters'
import { TaskAIInput } from '@/components/ai/task-ai-input'
import { TaskDetailPanel } from '@/components/features/tasks/task-detail-panel'
import { AIStatusIndicator } from '@/lib/ai/context'
import { ViewSwitcher, TaskView, useViewSwitcherShortcuts } from '@/components/features/tasks/views/ViewSwitcher'
import { MyDayView } from '@/components/features/tasks/views/MyDayView'
import { 
  createDocument, 
  updateDocument, 
  deleteDocument,
  subscribeToUserDocuments,
  isOnline,
  onNetworkChange 
} from '@/lib/firebase-data'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { cn } from '@/lib/utils'

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  categoryId?: string
  subtasks?: Subtask[]
  familyId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export default function TasksPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [online, setOnline] = useState(isOnline())
  const [isDesktop, setIsDesktop] = useState(false)
  const [currentView, setCurrentView] = useState<TaskView>(() => {
    // Load saved view preference from localStorage
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('tasks-view-preference')
      if (savedView && ['list', 'my-day'].includes(savedView)) {
        return savedView as TaskView
      }
    }
    return 'list'
  })
  const [filters, setFilters] = useState({
    status: 'all', // all, pending, completed
    priority: 'all', // all, low, medium, high
    search: ''
  })

  // Track feature usage
  useEffect(() => {
    trackFeatureUsage('tasks', 'view')
  }, [trackFeatureUsage])

  // Setup keyboard shortcuts for view switching
  useViewSwitcherShortcuts(currentView, setCurrentView, ['list', 'my-day'])

  // View change handler with tracking and persistence
  const handleViewChange = (view: TaskView) => {
    setCurrentView(view)
    trackFeatureUsage('tasks', `view_${view}`)
    
    // Save view preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasks-view-preference', view)
    }
  }

  // Subscribe to network changes
  useEffect(() => {
    const unsubscribe = onNetworkChange(setOnline)
    return unsubscribe
  }, [])

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    // Set initial value
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Subscribe to tasks
  useEffect(() => {
    if (!user) return
    
    const unsubscribe = subscribeToUserDocuments<Task>('tasks', (newTasks) => {
      setTasks(newTasks)
    }, 'updatedAt')
    
    return unsubscribe
  }, [user])

  // Auto-cleanup completed tasks after 12 hours
  useEffect(() => {
    if (!user || !online) return

    const cleanupCompletedTasks = async () => {
      const now = new Date()
      const twelveHoursAgo = new Date(now.getTime() - (12 * 60 * 60 * 1000)) // 12 hours in milliseconds

      // Find completed tasks older than 12 hours
      const tasksToDelete = tasks.filter(task => {
        if (!task.completed) return false
        
        // Check if task was completed more than 12 hours ago
        const completedTime = new Date(task.updatedAt)
        return completedTime < twelveHoursAgo
      })

      // Delete old completed tasks
      for (const task of tasksToDelete) {
        try {
          await deleteDocument('tasks', task.id)
          console.log(`Auto-removed completed task: ${task.title}`)
        } catch (error) {
          console.error('Failed to auto-remove completed task:', error)
        }
      }

      if (tasksToDelete.length > 0) {
        trackFeatureUsage('tasks', 'auto_cleanup')
      }
    }

    // Run cleanup immediately
    cleanupCompletedTasks()

    // Set up interval to run cleanup every hour
    const cleanupInterval = setInterval(cleanupCompletedTasks, 60 * 60 * 1000) // 1 hour

    return () => clearInterval(cleanupInterval)
  }, [tasks, user, online, trackFeatureUsage])

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'familyId' | 'createdBy'>) => {
    if (!user || !online) return

    try {
      // Clean the task data to remove undefined values
      const cleanTaskData: any = {
        title: taskData.title || '',
        priority: taskData.priority || 'medium',
        completed: false
      }

      // Only add optional fields if they have valid values
      if (taskData.description && taskData.description.trim()) {
        cleanTaskData.description = taskData.description.trim()
      }
      if (taskData.dueDate) {
        cleanTaskData.dueDate = taskData.dueDate
      }
      if (taskData.categoryId) {
        cleanTaskData.categoryId = taskData.categoryId
      }
      if (taskData.subtasks && taskData.subtasks.length > 0) {
        cleanTaskData.subtasks = taskData.subtasks
      }

      await createDocument<Task>('tasks', generateId(), cleanTaskData)
      
      setShowForm(false)
      trackFeatureUsage('tasks', 'create')
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    if (!online) return
    
    try {
      // Always update the updatedAt timestamp
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date()
      }
      
      await updateDocument('tasks', id, updatesWithTimestamp)
      
      if (updates.completed !== undefined) {
        trackFeatureUsage('tasks', updates.completed ? 'complete' : 'uncomplete')
      } else {
        trackFeatureUsage('tasks', 'update')
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!online) return
    
    try {
      await deleteDocument('tasks', id)
      trackFeatureUsage('tasks', 'delete')
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const handleAITaskCreated = async (aiTask: any) => {
    if (!user || !online) return

    try {
      const taskData: any = {
        title: aiTask.title || aiTask.name || 'New Task',
        priority: aiTask.priority || 'medium',
        completed: false,
      }

      // Only add optional fields if they have valid, non-undefined values
      if (aiTask.description && aiTask.description.trim() !== '') {
        taskData.description = aiTask.description
      }
      
      if (aiTask.suggestedDueDate) {
        taskData.dueDate = new Date(aiTask.suggestedDueDate)
      }
      
      if (aiTask.category && aiTask.category.trim() !== '') {
        taskData.categoryId = aiTask.category
      }

      await createDocument<Task>('tasks', generateId(), taskData)
      trackFeatureUsage('tasks', 'ai_create')
    } catch (error) {
      console.error('Failed to create AI task:', error)
    }
  }

  const handleAITasksCreated = async (aiTasks: any[]) => {
    if (!user || !online || !Array.isArray(aiTasks)) return

    try {
      // Create tasks in batch
      const createPromises = aiTasks.slice(0, 10).map(aiTask => {
        const taskData: any = {
          title: aiTask.title || aiTask.name || 'New Task',
          priority: aiTask.priority || 'medium',
          completed: false,
        }

        // Only add optional fields if they have valid, non-undefined values
        if (aiTask.description && aiTask.description.trim() !== '') {
          taskData.description = aiTask.description
        }
        
        if (aiTask.suggestedDueDate) {
          taskData.dueDate = new Date(aiTask.suggestedDueDate)
        }
        
        if (aiTask.category && aiTask.category.trim() !== '') {
          taskData.categoryId = aiTask.category
        }

        return createDocument<Task>('tasks', generateId(), taskData)
      })

      await Promise.all(createPromises)
      trackFeatureUsage('tasks', 'ai_batch_create')
    } catch (error) {
      console.error('Failed to create AI tasks:', error)
    }
  }

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task)
  }

  const handleEditTask = (task: Task) => {
    // On mobile or when no split view, use modal
    if (!isDesktop) {
      setEditingTask(task)
      setShowForm(true)
    } else {
      // On desktop, show in split view and also select
      setSelectedTask(task)
      setEditingTask(task)
      setShowForm(true)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  const handleCloseDetailPanel = () => {
    setSelectedTask(null)
  }

  // Helper functions for task organization
  const getTodaysTasks = () => {
    const today = new Date()
    return tasks.filter(task => {
      if (task.completed) return false
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate)
        return dueDate.toDateString() === today.toDateString()
      }
      return task.priority === 'high' // Include high priority tasks without due dates
    })
  }

  const getUpcomingTasks = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    return tasks.filter(task => {
      if (task.completed) return false
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate)
        return dueDate >= tomorrow && dueDate <= nextWeek
      }
      return false
    })
  }

  const getOverdueTasks = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return tasks.filter(task => {
      if (task.completed) return false
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < today
      }
      return false
    })
  }

  // Filter and sort tasks based on current filters
  const filteredTasks = tasks
    .filter(task => {
      // Status filter
      if (filters.status === 'pending' && task.completed) return false
      if (filters.status === 'completed' && !task.completed) return false
      
      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false
      
      // Search filter
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      // First sort by completion status: incomplete tasks first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      
      // For tasks with same completion status, sort by updated time (most recent first)
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  // Task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: getOverdueTasks().length,
    today: getTodaysTasks().length,
    upcoming: getUpcomingTasks().length
  }


  // Show welcome page when no tasks exist
  if (tasks.length === 0) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tasks</h1>
            <p className="text-sm text-muted-foreground">Get started by creating your first task</p>
          </div>
          <Button 
            onClick={() => router.push('/tasks/new')}
            className="grok-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add new
          </Button>
        </div>

        {/* AI Task Assistant Section - Streamlined */}
        <div className="glass rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">AI Task Assistant</h2>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                Smart Creation
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Create tasks naturally using AI. Describe what you want to accomplish, and I'll help organize it into actionable tasks with priorities and due dates.
            </p>

            {/* AI Input */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <TaskAIInput
                onTaskCreated={handleAITaskCreated}
                onTasksCreated={handleAITasksCreated}
                existingTasks={tasks}
              />
            </div>

            {/* Quick Start Examples */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Single Task Examples:</p>
                <div className="space-y-1">
                  <div className="px-3 py-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    "Schedule quarterly review meeting"
                  </div>
                  <div className="px-3 py-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    "Update project documentation"
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Multi-Task Examples:</p>
                <div className="space-y-1">
                  <div className="px-3 py-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    "Plan product launch campaign"
                  </div>
                  <div className="px-3 py-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    "Set up new employee onboarding"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Welcome to Tasks</h2>
            <p className="text-muted-foreground">
              Organize your tasks efficiently with AI assistance. Create tasks naturally, set priorities, and track your progress.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="space-y-4">
              <h3 className="font-semibold">Key Features</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>AI-powered task creation from natural language</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Multiple views: List and My Day focus</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Set priorities and due dates with smart suggestions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Track completion status and progress</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">AI-Enhanced</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Break down complex projects into subtasks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Instant task enhancement and suggestions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Smart priority and scheduling recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span>Real-time sync across all your devices</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-4">
            <AIStatusIndicator />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Main Content Area */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        selectedTask && isDesktop ? "mr-96" : ""
      )}>
        <div 
          className="max-w-[50rem] px-5 pt-20 @sm:pt-18 mx-auto w-full flex flex-col h-full pb-4 transition-all duration-300" 
          style={{ maskImage: 'linear-gradient(black 85%, transparent 100%)' }}
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-foreground flex gap-2 items-center">
                  <CheckCircle2 className="h-5 w-5" />
                  Tasks
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  {taskStats.pending} pending, {taskStats.completed} completed
                  {!online && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => setShowForm(true)} disabled={!online} className="h-9 text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>


            {/* Today's Focus Section */}
            {getTodaysTasks().length > 0 && (
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-5 w-5 text-primary" />
                  <h2 className="text-sm font-semibold">Today's Focus</h2>
                  <span className="text-xs text-muted-foreground">
                    {getTodaysTasks().length} task{getTodaysTasks().length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {getTodaysTasks().slice(0, 3).map((task, index) => (
                    <div 
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background cursor-pointer transition-all duration-250 hover:shadow-lg hover:-translate-y-1"
                      onClick={() => handleSelectTask(task)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdateTask(task.id, { completed: !task.completed })
                        }}
                        className="flex-shrink-0"
                      >
                        <CheckCircle2 className={cn(
                          "h-4 w-4 transition-colors",
                          task.completed ? "text-green-600" : "text-muted-foreground hover:text-primary"
                        )} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate task-title">{task.title}</p>
                        {task.description && (
                          <p className="text-muted-foreground truncate task-description">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {task.priority === 'high' && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded">High</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* View Switcher */}
            <div className="border-b border-border">
              <div className="flex items-center justify-between">
                <ViewSwitcher
                  currentView={currentView}
                  onViewChange={handleViewChange}
                  availableViews={['list', 'my-day']}
                />
                
                <TaskFilters 
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
            </div>

            {/* Task Views */}
            <div className="flex flex-col gap-4">
              {currentView === 'list' && (
                <TaskList 
                  tasks={filteredTasks}
                  selectedTaskId={selectedTask?.id}
                  onTaskUpdate={handleUpdateTask}
                  onTaskDelete={handleDeleteTask}
                  onTaskEdit={handleEditTask}
                  onTaskSelect={handleSelectTask}
                />
              )}
              
              {currentView === 'my-day' && (
                <MyDayView
                  tasks={filteredTasks}
                  onTaskUpdate={handleUpdateTask}
                  onTaskDelete={handleDeleteTask}
                  onTaskEdit={handleEditTask}
                />
              )}
            </div>

            {/* Empty State for Filtered Results */}
            {tasks.length > 0 && filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <div className="h-16 w-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold mb-2">No tasks match your filters</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ status: 'all', priority: 'all', search: '' })}
                  className="h-7 text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Panel - Desktop Only */}
      {selectedTask && isDesktop && (
        <div className="fixed right-0 top-0 bottom-0 w-96 z-40">
          <TaskDetailPanel
            task={selectedTask}
            onTaskUpdate={handleUpdateTask}
            onTaskDelete={handleDeleteTask}
            onTaskEdit={handleEditTask}
            onClose={handleCloseDetailPanel}
          />
        </div>
      )}

      {/* Task Form Modal - Mobile or when editing */}
      {showForm && (!isDesktop || !selectedTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? 
            (data) => handleUpdateTask(editingTask.id, data) : 
            handleCreateTask
          }
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}