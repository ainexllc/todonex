'use client'

import { useState } from 'react'
import { Plus, MoreVertical, Clock, Flag, Edit2, Circle, CheckCircle2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDisplayDate, isOverdue, isDueSoon } from '@/lib/utils/date'

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

interface KanbanViewProps {
  tasks: Task[]
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
  onTaskDelete: (id: string) => void
  onTaskEdit: (task: Task) => void
}

type ColumnType = 'todo' | 'in-progress' | 'done'

interface KanbanColumn {
  id: ColumnType
  title: string
  description: string
  color: string
  bgColor: string
  limit?: number
}

const COLUMNS: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    description: 'Tasks ready to start',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50/50 border-blue-200/50 dark:bg-blue-950/20 dark:border-blue-800/30',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    description: 'Currently working on',
    color: 'text-priority-medium',
    bgColor: 'bg-priority-medium-bg border-priority-medium-border',
    limit: 3, // WIP limit
  },
  {
    id: 'done',
    title: 'Done',
    description: 'Completed tasks',
    color: 'text-priority-low',
    bgColor: 'bg-priority-low-bg border-priority-low-border',
  },
]

export function KanbanView({ tasks, onTaskUpdate, onTaskDelete, onTaskEdit }: KanbanViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  // Categorize tasks based on completion and progress status
  const getTaskColumn = (task: Task): ColumnType => {
    if (task.completed) return 'done'
    
    // Check if task has a description with "in progress" indicators
    const description = task.description?.toLowerCase() || ''
    const hasProgressIndicators = description.includes('working on') || 
                                 description.includes('in progress') || 
                                 description.includes('started')
    
    // High priority tasks that are overdue or due soon could be considered "in progress"
    const isUrgent = task.priority === 'high' && (
      isOverdue(task.dueDate, task.completed) || 
      isDueSoon(task.dueDate, task.completed)
    )
    
    return (hasProgressIndicators || isUrgent) ? 'in-progress' : 'todo'
  }

  const getColumnTasks = (columnId: ColumnType) => {
    return tasks.filter(task => getTaskColumn(task) === columnId)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-priority-high bg-priority-high-bg'
      case 'medium': return 'border-l-priority-medium bg-priority-medium-bg'
      case 'low': return 'border-l-priority-low bg-priority-low-bg'
      default: return 'border-l-muted-foreground bg-muted'
    }
  }

  const getDateStatus = (task: Task) => {
    if (!task.dueDate) return null
    
    if (isOverdue(task.dueDate, task.completed)) {
      return { text: 'Overdue', color: 'text-priority-high bg-priority-high-bg border border-priority-high-border' }
    }
    
    if (isDueSoon(task.dueDate, task.completed)) {
      return { text: 'Due Soon', color: 'text-priority-medium bg-priority-medium-bg border border-priority-medium-border' }
    }
    
    return { text: formatDisplayDate(task.dueDate), color: 'text-muted-sophisticated bg-muted border border-border' }
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetColumn: ColumnType) => {
    e.preventDefault()
    
    if (!draggedTask) return
    
    const currentColumn = getTaskColumn(draggedTask)
    if (currentColumn === targetColumn) return
    
    // Update task based on column
    const updates: Partial<Task> = {}
    
    if (targetColumn === 'done') {
      updates.completed = true
    } else if (currentColumn === 'done' && targetColumn !== 'done') {
      updates.completed = false
    }
    
    // Update description to reflect status
    if (targetColumn === 'in-progress' && !draggedTask.description?.toLowerCase().includes('in progress')) {
      updates.description = draggedTask.description 
        ? `${draggedTask.description}\n\n🔄 In Progress`
        : '🔄 In Progress'
    }
    
    onTaskUpdate(draggedTask.id, updates)
    setDraggedTask(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
  }

  return (
    <div className="space-y-8">
      {/* Kanban Board */}
      <div className="grid lg:grid-cols-3 gap-8 min-h-[600px]">
        {COLUMNS.map((column) => {
          const columnTasks = getColumnTasks(column.id)
          const isOverLimit = column.limit && columnTasks.length > column.limit
          
          return (
            <div
              key={column.id}
              className={cn(
                "kanban-column rounded-grok-lg transition-all duration-300",
                draggedTask && getTaskColumn(draggedTask) !== column.id && [
                  "border-dashed border-primary/50 bg-primary/5 scale-105",
                  "shadow-lg shadow-primary/10"
                ]
              )}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="p-6 border-b border-border/20 bg-gradient-to-r from-transparent via-muted/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className={cn(
                      "text-xl font-semibold transition-colors tracking-tight",
                      column.color
                    )}>
                      {column.title}
                    </h3>
                    <p className="text-xs font-medium tracking-wide text-muted-sophisticated leading-relaxed">
                      {column.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-semibold px-3 py-2 rounded-full transition-all duration-200 border",
                      isOverLimit 
                        ? 'bg-priority-high-bg text-priority-high border-priority-high-border shadow-sm' 
                        : 'bg-muted/80 text-muted-sophisticated border-border/40 hover:bg-muted'
                    )}>
                      {columnTasks.length}
                      {column.limit && `/${column.limit}`}
                    </span>
                  </div>
                </div>
                
                {isOverLimit && (
                  <div className="mt-4 text-xs font-medium text-priority-high bg-priority-high-bg px-4 py-3 rounded-grok border border-priority-high-border shadow-sm">
                    ⚠️ Over WIP limit! Consider moving tasks to completion.
                  </div>
                )}
              </div>

              {/* Tasks */}
              <div className="p-6 space-y-4 min-h-[500px]">
                {columnTasks.map((task) => {
                  const dateStatus = getDateStatus(task)
                  
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "kanban-task rounded-grok border-l-4 p-5 cursor-move transition-all duration-250",
                        "hover:shadow-md hover:-translate-y-0.5",
                        task.priority === 'high' && 'border-l-priority-high',
                        task.priority === 'medium' && 'border-l-priority-medium', 
                        task.priority === 'low' && 'border-l-priority-low',
                        !task.priority && 'border-l-muted-foreground',
                        draggedTask?.id === task.id && 'opacity-50 scale-95 shadow-none'
                      )}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h4 className="text-sophisticated text-base font-medium leading-tight line-clamp-2 flex-1">
                          {task.title}
                        </h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="grok-button-enhanced h-8 w-8 p-0 hover:bg-hover-bg transition-all duration-200 hover:scale-105 flex-shrink-0"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="grok-popover border-grok space-y-1 p-2">
                            <DropdownMenuItem 
                              onClick={() => onTaskEdit(task)}
                              className="gap-3 py-3 px-3 transition-all duration-200 hover:bg-hover-bg rounded-grok"
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="font-medium">Edit Task</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onTaskUpdate(task.id, { completed: !task.completed })}
                              className="gap-3 py-3 px-3 transition-all duration-200 hover:bg-hover-bg rounded-grok"
                            >
                              {task.completed ? (
                                <Circle className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              <span className="font-medium">
                                Mark as {task.completed ? 'Incomplete' : 'Complete'}
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onTaskDelete(task.id)}
                              className="gap-3 py-3 px-3 text-priority-high hover:bg-priority-high-bg transition-all duration-200 rounded-grok"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="font-medium">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Task Description */}
                      {task.description && (
                        <div className="content-group rounded-grok p-3 mb-4">
                          <p className="text-xs leading-relaxed text-muted-sophisticated line-clamp-3">
                            {task.description}
                          </p>
                        </div>
                      )}

                      {/* Task Meta */}
                      <div className="flex items-center justify-between gap-3">
                        {/* Priority */}
                        <div className="flex items-center gap-1.5">
                          <Flag className={cn(
                            "h-3.5 w-3.5 transition-colors",
                            task.priority === 'high' && 'text-priority-high',
                            task.priority === 'medium' && 'text-priority-medium',
                            task.priority === 'low' && 'text-priority-low',
                            !task.priority && 'text-muted-foreground'
                          )} />
                          <span className="text-xs font-semibold tracking-wide text-muted-sophisticated capitalize">
                            {task.priority}
                          </span>
                        </div>

                        {/* Due Date */}
                        {dateStatus && (
                          <div className={cn(
                            "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold transition-colors border",
                            dateStatus.color
                          )}>
                            <Clock className="h-3 w-3" />
                            <span className="tracking-wide">{dateStatus.text}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Empty State */}
                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6 transition-all duration-200 hover:bg-muted">
                      <Plus className="h-8 w-8 text-muted-sophisticated" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-muted-sophisticated mb-2">
                      {column.id === 'todo' && 'No tasks to start'}
                      {column.id === 'in-progress' && 'No tasks in progress'}
                      {column.id === 'done' && 'No completed tasks'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drag tasks here to update their status
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Kanban Tips */}
      <div className="section-container rounded-grok-lg p-8">
        <h4 className="text-xl font-semibold text-sophisticated mb-6 flex items-center gap-3">
          💡 <span>Kanban Tips</span>
        </h4>
        <div className="grid md:grid-cols-3 gap-8 text-sm font-medium text-muted-sophisticated">
          <div className="content-group rounded-grok p-5 space-y-2">
            <strong className="text-foreground block">Drag & Drop</strong>
            <span className="text-xs leading-relaxed">
              Move tasks between columns to update their status
            </span>
          </div>
          <div className="content-group rounded-grok p-5 space-y-2">
            <strong className="text-foreground block">WIP Limits</strong>
            <span className="text-xs leading-relaxed">
              Keep "In Progress" tasks under 3 for better focus
            </span>
          </div>
          <div className="content-group rounded-grok p-5 space-y-2">
            <strong className="text-foreground block">Visual Cues</strong>
            <span className="text-xs leading-relaxed">
              Colors indicate priority, badges show due dates
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}