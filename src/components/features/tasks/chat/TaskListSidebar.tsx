'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ListTodo, Trash2, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  category?: string
}

interface TaskList {
  id: string
  title: string
  tasks: Task[]
  category?: string
  createdAt: Date
}

interface TaskListSidebarProps {
  taskLists: TaskList[]
  selectedTaskListId: string | null
  onTaskListSelect: (taskList: TaskList | null) => void
  onCreateNew: () => void
  onTaskListDelete: (taskListId: string) => void
  className?: string
}

export function TaskListSidebar({ 
  taskLists, 
  selectedTaskListId,
  onTaskListSelect,
  onCreateNew,
  onTaskListDelete,
  className 
}: TaskListSidebarProps) {
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300'
    }
  }

  const handleTaskListClick = (taskList: TaskList) => {
    if (selectedTaskListId === taskList.id) {
      // If clicking the same list, deselect it
      onTaskListSelect(null)
    } else {
      // Select the clicked list
      onTaskListSelect(taskList)
    }
  }

  const handleDeleteTaskList = (e: React.MouseEvent, taskList: TaskList) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete "${taskList.title}"? This action cannot be undone.`)) {
      onTaskListDelete(taskList.id)
    }
  }

  const pendingTasks = taskLists.reduce((total, list) => 
    total + list.tasks.filter(task => !task.completed).length, 0
  )
  const completedTasks = taskLists.reduce((total, list) => 
    total + list.tasks.filter(task => task.completed).length, 0
  )

  return (
    <div className={cn("w-80 bg-background border-r border-border flex flex-col", className)}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Task Lists</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateNew}
            className="h-8 w-8 p-0 hover:bg-muted/50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="font-semibold text-foreground">{pendingTasks}</div>
            <div className="text-muted-foreground">Pending</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="font-semibold text-green-600">{completedTasks}</div>
            <div className="text-muted-foreground">Completed</div>
          </div>
        </div>
      </div>

      {/* Task Lists */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {taskLists.length === 0 ? (
          <div className="text-center py-8">
            <ListTodo className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">No task lists yet</p>
            <Button
              onClick={onCreateNew}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First List
            </Button>
          </div>
        ) : (
          <>
            {taskLists.map((taskList) => {
              const pendingCount = taskList.tasks.filter(task => !task.completed).length
              const completedCount = taskList.tasks.filter(task => task.completed).length
              const isSelected = selectedTaskListId === taskList.id
              
              return (
                <Card
                  key={taskList.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    isSelected 
                      ? "ring-2 ring-primary bg-primary/5" 
                      : "hover:bg-muted/30"
                  )}
                  onClick={() => handleTaskListClick(taskList)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">
                          {taskList.title}
                        </CardTitle>
                        {taskList.category && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {taskList.category}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteTaskList(e, taskList)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-opacity"
                        title="Delete task list"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {/* Task counts */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{taskList.tasks.length} tasks</span>
                        <div className="flex gap-2">
                          {pendingCount > 0 && (
                            <span className="text-orange-600">{pendingCount} pending</span>
                          )}
                          {completedCount > 0 && (
                            <span className="text-green-600">{completedCount} done</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Recent tasks preview */}
                      {taskList.tasks.length > 0 && (
                        <div className="space-y-1">
                          {taskList.tasks.slice(0, 2).map((task) => (
                            <div 
                              key={task.id}
                              className="flex items-center gap-2 text-xs"
                            >
                              <div className={cn(
                                "h-2 w-2 rounded-full",
                                task.completed ? "bg-green-500" : "bg-orange-500"
                              )} />
                              <span className={cn(
                                "truncate",
                                task.completed && "line-through text-muted-foreground"
                              )}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                          {taskList.tasks.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{taskList.tasks.length - 2} more tasks
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Created date */}
                      <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                        Created {format(taskList.createdAt, 'MMM d')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={onCreateNew}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task List
        </Button>
      </div>
    </div>
  )
}
