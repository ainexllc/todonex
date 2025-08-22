'use client'

import { useState, useMemo } from 'react'
import { Sun, Plus, Clock, Flag, CheckCircle2, Circle, MoreVertical, Calendar, Target, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDisplayDate, isOverdue, isDueSoon, normalizeDate, getCurrentUserDate } from '@/lib/utils/date'

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

interface MyDayViewProps {
  tasks: Task[]
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
  onTaskDelete: (id: string) => void
  onTaskEdit: (task: Task) => void
}

export function MyDayView({ tasks, onTaskUpdate, onTaskDelete, onTaskEdit }: MyDayViewProps) {
  const [focusMode, setFocusMode] = useState(false)
  
  const today = new Date()
  const todayString = getCurrentUserDate()

  // Categorize today's tasks
  const todaysTasks = useMemo(() => {
    const overdue = tasks.filter(task => 
      !task.completed && isOverdue(task.dueDate, task.completed)
    )
    
    const dueToday = tasks.filter(task => {
      if (!task.dueDate || task.completed) return false
      const taskDate = normalizeDate(task.dueDate)
      return taskDate && taskDate.toDateString() === today.toDateString()
    })
    
    const dueSoon = tasks.filter(task => 
      !task.completed && 
      !dueToday.includes(task) && 
      !overdue.includes(task) && 
      isDueSoon(task.dueDate, task.completed)
    )
    
    const highPriority = tasks.filter(task => 
      !task.completed && 
      task.priority === 'high' && 
      !overdue.includes(task) && 
      !dueToday.includes(task) && 
      !dueSoon.includes(task)
    )
    
    const completed = tasks.filter(task => 
      task.completed && 
      task.dueDate && 
      normalizeDate(task.dueDate)?.toDateString() === today.toDateString()
    )

    return {
      overdue,
      dueToday,
      dueSoon,
      highPriority,
      completed,
      total: overdue.length + dueToday.length + dueSoon.length + highPriority.length
    }
  }, [tasks, today])


  const getProgressPercentage = () => {
    if (todaysTasks.total === 0) return 0
    return Math.round((todaysTasks.completed.length / (todaysTasks.total + todaysTasks.completed.length)) * 100)
  }

  const TaskCard = ({ task, section }: { task: Task, section: string }) => (
    <div className={cn(
      "task-card rounded-lg border-l-3 p-4",
      section === 'overdue' && 'border-l-red-500',
      section === 'dueToday' && 'border-l-blue-500',
      section === 'dueSoon' && 'border-l-orange-500',
      section === 'highPriority' && 'border-l-purple-500',
      section === 'completed' && 'border-l-green-500',
      section === 'focus' && 'border-l-primary bg-primary-foreground/5',
      task.completed && 'opacity-60'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Completion Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="grok-button-enhanced h-8 w-8 p-0 mt-0.5 hover:bg-hover-bg transition-all duration-200 hover:scale-105"
            onClick={() => onTaskUpdate(task.id, { completed: !task.completed })}
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5 text-priority-low transition-colors" />
            ) : (
              <Circle className="h-5 w-5 text-muted-sophisticated hover:text-primary transition-colors" />
            )}
          </Button>

          {/* Task Content */}
          <div className="flex-1 min-w-0 space-y-3">
            <h4 className={cn(
              "text-sophisticated text-lg font-medium leading-tight transition-colors",
              task.completed && 'line-through text-muted-sophisticated opacity-75'
            )}>
              {task.title}
            </h4>
            
            {task.description && (
              <div className="content-group rounded-grok p-4">
                <p className="text-sm leading-relaxed text-muted-sophisticated line-clamp-3">
                  {task.description}
                </p>
              </div>
            )}

            {/* Task Meta */}
            <div className="flex items-center gap-4 text-sm">
              {/* Priority */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full border font-semibold tracking-wide transition-all duration-200 hover:scale-105",
                task.priority === 'high' && 'priority-high',
                task.priority === 'medium' && 'priority-medium',
                task.priority === 'low' && 'priority-low',
                !task.priority && 'bg-muted border-border text-muted-sophisticated'
              )}>
                <Flag className="h-3.5 w-3.5" />
                <span className="capitalize">{task.priority}</span>
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full border font-semibold tracking-wide transition-all duration-200",
                  section === 'overdue' && 'priority-high',
                  section === 'dueToday' && 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-800/30 dark:text-blue-400',
                  section === 'dueSoon' && 'priority-medium',
                  !['overdue', 'dueToday', 'dueSoon'].includes(section) && 'bg-muted border-border text-muted-sophisticated'
                )}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDisplayDate(task.dueDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="grok-button-enhanced h-8 w-8 p-0 hover:bg-hover-bg transition-all duration-200 hover:scale-105"
            >
              <MoreVertical className="h-4 w-4" />
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
    </div>
  )

  const TaskSection = ({ 
    title, 
    tasks: sectionTasks, 
    icon: Icon, 
    color, 
    section,
    description 
  }: { 
    title: string
    tasks: Task[]
    icon: any
    color: string
    section: string
    description: string
  }) => {
    if (sectionTasks.length === 0) return null

    return (
      <div className="section-container rounded-grok-lg p-8 space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-border/20">
          <div className="p-3 rounded-grok bg-muted/50 border border-border/40">
            <Icon className={cn("h-6 w-6 transition-colors", color)} />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className={cn("text-xl font-semibold transition-colors", color)}>
              {title}
            </h3>
            <p className="text-sm font-medium text-muted-sophisticated">
              {description} • {sectionTasks.length} {sectionTasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {sectionTasks.map(task => (
            <TaskCard key={task.id} task={task} section={section} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="card-elevated rounded-grok-xl p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-grok-lg bg-yellow-500/20 border border-yellow-500/30 elevation-sm">
              <Sun className="h-10 w-10 text-yellow-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight text-sophisticated">My Day</h2>
              <p className="text-base leading-relaxed text-muted-sophisticated">
                {today.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant={focusMode ? 'default' : 'outline'}
              size="lg"
              onClick={() => setFocusMode(!focusMode)}
              className="grok-button-enhanced card-elevated hover:bg-hover-bg transition-all duration-200 hover:scale-105"
            >
              <Target className="h-5 w-5 mr-2" />
              <span className="font-semibold">Focus Mode</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="content-group rounded-grok-lg p-6 space-y-4">
          <div className="flex items-center justify-between text-base">
            <span className="font-medium text-muted-sophisticated">Today's Progress</span>
            <span className="font-semibold text-sophisticated">
              {todaysTasks.completed.length} of {todaysTasks.total + todaysTasks.completed.length} completed
            </span>
          </div>
          <div className="w-full bg-muted/80 border border-border rounded-grok-lg h-4 overflow-hidden">
            <div
              className="grok-progress-bar h-full transition-all duration-500 elevation-sm"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <div className="text-center text-base font-semibold text-sophisticated">
            {getProgressPercentage()}% Complete 🎆
          </div>
        </div>
      </div>

      {/* Focus Mode */}
      {focusMode && todaysTasks.total > 0 && (
        <div className="card-glass rounded-grok-xl p-8 border-2 border-primary/40 elevation-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 p-3 rounded-grok-lg bg-primary/10 border border-primary/30 elevation-sm mb-4">
              <Target className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold text-primary">
                Focus Zone
              </h3>
            </div>
            <p className="text-base text-muted-sophisticated">
              Complete this priority task with full concentration
            </p>
          </div>
          <div className="max-w-lg mx-auto mb-6">
            <TaskCard 
              task={todaysTasks.overdue[0] || todaysTasks.dueToday[0] || todaysTasks.dueSoon[0] || todaysTasks.highPriority[0]}
              section="focus"
            />
          </div>
          <div className="text-center content-group rounded-grok p-4">
            <p className="text-sm leading-relaxed text-muted-sophisticated">
              🏆 <strong>Pro Tip:</strong> Complete this task before moving to the next one for maximum productivity and better focus.
            </p>
          </div>
        </div>
      )}

      {/* Task Sections */}
      {!focusMode && (
        <div className="space-y-8">
          <TaskSection
            title="Overdue"
            tasks={todaysTasks.overdue}
            icon={Clock}
            color="text-priority-high"
            section="overdue"
            description="Past due date"
          />

          <TaskSection
            title="Due Today"
            tasks={todaysTasks.dueToday}
            icon={Calendar}
            color="text-blue-600 dark:text-blue-400"
            section="dueToday"
            description="Must complete today"
          />

          <TaskSection
            title="Due Soon"
            tasks={todaysTasks.dueSoon}
            icon={Clock}
            color="text-priority-medium"
            section="dueSoon"
            description="Due within 24 hours"
          />

          <TaskSection
            title="High Priority"
            tasks={todaysTasks.highPriority}
            icon={Flag}
            color="text-purple-600 dark:text-purple-400"
            section="highPriority"
            description="Important tasks"
          />

          <TaskSection
            title="Completed Today"
            tasks={todaysTasks.completed}
            icon={CheckCircle2}
            color="text-priority-low"
            section="completed"
            description="Great job!"
          />
        </div>
      )}

      {/* Empty State */}
      {todaysTasks.total === 0 && todaysTasks.completed.length === 0 && (
        <div className="section-container rounded-grok-xl p-16 text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-grok-lg bg-priority-low-bg border border-priority-low-border flex items-center justify-center elevation-md">
            <Sun className="h-12 w-12 text-priority-low" />
          </div>
          <h3 className="text-2xl font-bold text-sophisticated mb-4">
            All Clear! 🎆
          </h3>
          <p className="text-base leading-relaxed text-muted-sophisticated mb-8 max-w-md mx-auto">
            You have no tasks for today. Perfect time to relax, plan ahead, or explore new opportunities!
          </p>
          <Button 
            variant="outline" 
            size="lg"
            className="grok-button-enhanced card-elevated hover:bg-hover-bg transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="font-semibold">Add Your First Task</span>
          </Button>
        </div>
      )}

      {/* Productivity Tips */}
      <div className="section-container rounded-grok-lg p-8">
        <h4 className="text-xl font-semibold text-sophisticated mb-6 flex items-center gap-3">
          💡 <span>Daily Productivity Guide</span>
        </h4>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="content-group rounded-grok p-5 space-y-2">
            <strong className="text-sophisticated block text-sm">Start with Overdue</strong>
            <span className="text-xs leading-relaxed text-muted-sophisticated">
              Tackle overdue tasks first to clear your backlog and reduce stress
            </span>
          </div>
          <div className="content-group rounded-grok p-5 space-y-2">
            <strong className="text-sophisticated block text-sm">Use Focus Mode</strong>
            <span className="text-xs leading-relaxed text-muted-sophisticated">
              Work on one task at a time for better concentration and quality
            </span>
          </div>
          <div className="content-group rounded-grok p-5 space-y-2">
            <strong className="text-sophisticated block text-sm">Celebrate Progress</strong>
            <span className="text-xs leading-relaxed text-muted-sophisticated">
              Each completed task brings you closer to achieving your goals
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}