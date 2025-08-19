'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckSquare, Plus, Calendar, Clock } from 'lucide-react'
import { useAdaptiveStore } from '@/store/adaptive-store'

interface TodayTasksWidgetProps {
  size?: 'small' | 'medium' | 'large'
  settings?: Record<string, any>
}

// Mock data for demonstration
const mockTasks = [
  {
    id: '1',
    title: 'Review quarterly budget',
    priority: 'high' as const,
    dueTime: '2:00 PM',
    completed: false
  },
  {
    id: '2', 
    title: 'Grocery shopping for dinner',
    priority: 'medium' as const,
    dueTime: '4:00 PM',
    completed: false
  },
  {
    id: '3',
    title: 'Call mom',
    priority: 'low' as const,
    dueTime: 'Evening',
    completed: true
  }
]

export function TodayTasksWidget({ size = 'medium' }: TodayTasksWidgetProps) {
  const { trackFeatureUsage } = useAdaptiveStore()

  const handleTaskClick = (taskId: string) => {
    trackFeatureUsage('tasks', 'toggle-complete')
  }

  const handleAddTask = () => {
    trackFeatureUsage('tasks', 'add-from-dashboard')
  }

  const pendingTasks = mockTasks.filter(task => !task.completed)
  const completedTasks = mockTasks.filter(task => task.completed)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'  
      case 'low': return 'text-green-500 bg-green-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  return (
    <Card glass className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
      
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span>Today's Tasks</span>
          </CardTitle>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        
        {pendingTasks.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {pendingTasks.length} pending • {completedTasks.length} completed
          </p>
        )}
      </CardHeader>

      <CardContent className="relative">
        {mockTasks.length === 0 ? (
          // Empty state
          <div className="text-center py-6 space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">No tasks for today</h4>
              <p className="text-sm text-muted-foreground">
                Add a task to get started with your daily planning
              </p>
            </div>
            <Button size="sm" onClick={handleAddTask}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Pending Tasks */}
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 dark:hover:bg-black/5 adaptive-transition cursor-pointer"
                onClick={() => handleTaskClick(task.id)}
              >
                <div className="h-4 w-4 rounded border-2 border-muted-foreground hover:border-primary adaptive-transition" />
                
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{task.title}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{task.dueTime}</span>
                    <span className={`px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Completed Tasks (collapsed) */}
            {completedTasks.length > 0 && (
              <div className="pt-2 border-t border-glass/50">
                <details className="group">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    {completedTasks.length} completed task{completedTasks.length !== 1 ? 's' : ''}
                  </summary>
                  <div className="mt-2 space-y-2">
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center space-x-3 p-2 rounded-lg opacity-60"
                      >
                        <div className="h-4 w-4 rounded bg-primary border-2 border-primary flex items-center justify-center">
                          <CheckSquare className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm line-through">{task.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {/* Add Task Button */}
            <div className="pt-3 border-t border-glass/50">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full hover:bg-white/10 dark:hover:bg-black/10"
                onClick={handleAddTask}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}