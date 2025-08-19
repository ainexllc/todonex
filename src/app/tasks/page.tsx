'use client'

import { useState, useEffect } from 'react'
import { Plus, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskList } from '@/components/features/tasks/task-list'
import { TaskForm } from '@/components/features/tasks/task-form'
import { TaskFilters } from '@/components/features/tasks/task-filters'
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

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  categoryId?: string
  familyId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export default function TasksPage() {
  const { user } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [online, setOnline] = useState(isOnline())
  const [filters, setFilters] = useState({
    status: 'all', // all, pending, completed
    priority: 'all', // all, low, medium, high
    search: ''
  })

  // Track feature usage
  useEffect(() => {
    trackFeatureUsage('tasks', 'view')
  }, [trackFeatureUsage])

  // Subscribe to network changes
  useEffect(() => {
    const unsubscribe = onNetworkChange(setOnline)
    return unsubscribe
  }, [])

  // Subscribe to tasks
  useEffect(() => {
    if (!user) return
    
    const unsubscribe = subscribeToUserDocuments<Task>('tasks', (newTasks) => {
      setTasks(newTasks)
    }, 'updatedAt')
    
    return unsubscribe
  }, [user])

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'familyId' | 'createdBy'>) => {
    if (!user || !online) return

    try {
      await createDocument<Task>('tasks', generateId(), {
        ...taskData,
        completed: false
      })
      
      setShowForm(false)
      trackFeatureUsage('tasks', 'create')
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    if (!online) return
    
    try {
      await updateDocument('tasks', id, updates)
      
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

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
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

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Manage your family's tasks and to-dos
            {!online && (
              <span className="flex items-center gap-1 text-amber-600">
                <WifiOff className="h-3 w-3" />
                Offline
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={!online}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-primary">{taskStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-green-500">{taskStats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-500">{taskStats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-2xl font-bold text-red-500">{taskStats.highPriority}</div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <TaskFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Task List */}
      <TaskList 
        tasks={filteredTasks}
        onToggleComplete={(id, completed) => handleUpdateTask(id, { completed })}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        emptyMessage="No tasks yet. Create your first task to get started!"
      />

      {/* Task Form Modal */}
      {showForm && (
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