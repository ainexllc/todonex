'use client'

import { useState, useEffect } from 'react'
import { CheckSquare, Plus, CheckCircle2, Circle, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { subscribeToUserDocuments, updateDocument, isOnline } from '@/lib/firebase-data'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { cn } from '@/lib/utils'

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

export function TasksWidget() {
  const { user } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    
    const unsubscribe = subscribeToUserDocuments<Task>('tasks', (allTasks) => {
      // Show only pending tasks, limit to 5 most recent
      const pendingTasks = allTasks
        .filter(task => !task.completed)
        .slice(0, 5)
      
      setTasks(pendingTasks)
      setLoading(false)
    }, 'updatedAt')
    
    return unsubscribe
  }, [user])

  const toggleTask = async (taskId: string, completed: boolean) => {
    if (!isOnline()) return
    
    try {
      await updateDocument('tasks', taskId, { completed })
      trackFeatureUsage('tasks', completed ? 'complete' : 'uncomplete')
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-orange-500' 
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date()
  }

  const isDueSoon = (task: Task) => {
    if (!task.dueDate) return false
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return new Date(task.dueDate) <= tomorrow
  }

  const formatDueDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date)
    }
  }

  if (loading) {
    return (
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium flex items-center">
            <CheckSquare className="h-4 w-4 mr-2" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base font-medium flex items-center">
            <CheckSquare className="h-4 w-4 mr-2" />
            Tasks
          </CardTitle>
          <Link href="/tasks">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/10"
              onClick={() => trackFeatureUsage('tasks', 'navigate')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="h-10 w-10 mx-auto mb-2 rounded-lg glass flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">No pending tasks</p>
            <Link href="/tasks">
              <Button 
                size="sm" 
                variant="outline" 
                className="glass border-glass hover:bg-white/5"
                onClick={() => trackFeatureUsage('tasks', 'navigate')}
              >
                Create Task
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium flex items-center">
          <CheckSquare className="h-4 w-4 mr-2" />
          Tasks
          <span className="ml-2 text-xs text-muted-foreground">
            ({tasks.length} pending)
          </span>
        </CardTitle>
        <Link href="/tasks">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10"
            onClick={() => trackFeatureUsage('tasks', 'navigate')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.map((task) => {
            const overdue = isOverdue(task)
            const dueSoon = isDueSoon(task)
            
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors",
                  overdue && "bg-red-500/10",
                  dueSoon && !overdue && "bg-orange-500/10"
                )}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-white/10"
                  onClick={() => toggleTask(task.id, !task.completed)}
                >
                  <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </Button>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{task.title}</p>
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      <span className={cn(
                        "text-muted-foreground",
                        overdue && "text-red-500",
                        dueSoon && !overdue && "text-orange-500"
                      )}>
                        {formatDueDate(new Date(task.dueDate))}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className={cn(
                  "h-2 w-2 rounded-full flex-shrink-0",
                  task.priority === 'high' && "bg-red-500",
                  task.priority === 'medium' && "bg-orange-500",
                  task.priority === 'low' && "bg-green-500"
                )} />
              </div>
            )
          })}
        </div>
        
        <div className="mt-3 pt-3 border-t border-glass/50">
          <Link href="/tasks">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full hover:bg-white/10"
              onClick={() => trackFeatureUsage('tasks', 'navigate')}
            >
              View All Tasks
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}