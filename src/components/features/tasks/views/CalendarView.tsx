'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, Flag, MoreVertical, Edit2, CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDisplayDate, isOverdue, isDueSoon, normalizeDate } from '@/lib/utils/date'

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

interface CalendarViewProps {
  tasks: Task[]
  onTaskUpdate: (id: string, updates: Partial<Task>) => void
  onTaskDelete: (id: string) => void
  onTaskEdit: (task: Task) => void
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function CalendarView({ tasks, onTaskUpdate, onTaskDelete, onTaskEdit }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Generate calendar days
  const calendarDays = []
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevMonthDay = new Date(currentYear, currentMonth, -firstDayOfWeek + i + 1)
    calendarDays.push({ date: prevMonthDay, isCurrentMonth: false })
  }
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day)
    calendarDays.push({ date, isCurrentMonth: true })
  }
  
  // Add days from next month to fill grid
  const remainingCells = 42 - calendarDays.length // 6 rows × 7 days
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthDay = new Date(currentYear, currentMonth + 1, day)
    calendarDays.push({ date: nextMonthDay, isCurrentMonth: false })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateString = date.toDateString()
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = normalizeDate(task.dueDate)
      return taskDate && taskDate.toDateString() === dateString
    })
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isPastDate = (date: Date) => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return dateOnly < todayOnly
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-priority-high'
      case 'medium': return 'bg-priority-medium'  
      case 'low': return 'bg-priority-low'
      default: return 'bg-muted-foreground'
    }
  }

  const getTaskStatusColor = (task: Task) => {
    if (task.completed) return 'bg-muted text-muted-sophisticated line-through'
    if (isOverdue(task.dueDate, task.completed)) return 'bg-priority-high-bg text-priority-high border border-priority-high-border'
    if (isDueSoon(task.dueDate, task.completed)) return 'bg-priority-medium-bg text-priority-medium border border-priority-medium-border'
    return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/30'
  }

  return (
    <div className="space-y-8">
      {/* Calendar Header */}
      <div className="section-container rounded-grok-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-bold tracking-tight text-sophisticated">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <Button
              onClick={goToToday}
              size="sm"
              variant="outline"
              className="grok-button-enhanced card-elevated hover:bg-hover-bg transition-all duration-200 hover:scale-105"
            >
              📅 Today
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigateMonth('prev')}
              size="sm"
              variant="ghost"
              className="grok-button-enhanced h-10 w-10 p-0 hover:bg-hover-bg transition-all duration-200 hover:scale-105 elevation-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => navigateMonth('next')}
              size="sm"
              variant="ghost"
              className="grok-button-enhanced h-10 w-10 p-0 hover:bg-hover-bg transition-all duration-200 hover:scale-105 elevation-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-4 mb-6">
          {DAYS_OF_WEEK.map(day => (
            <div
              key={day}
              className="content-group rounded-grok p-4 text-center text-sm font-semibold tracking-wide text-sophisticated"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card-elevated rounded-grok-lg p-8">
        <div className="grid grid-cols-7 gap-4">
          {calendarDays.map((calendarDay, index) => {
            const dayTasks = getTasksForDate(calendarDay.date)
            const isCurrentDay = isToday(calendarDay.date)
            const isPast = isPastDate(calendarDay.date)
            
            return (
              <div
                key={index}
                className={cn(
                  "calendar-cell min-h-[160px] p-4 rounded-lg transition-all duration-200",
                  calendarDay.isCurrentMonth
                    ? isCurrentDay
                      ? 'bg-primary/10 border-primary/20'
                      : isPast
                      ? 'opacity-75'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    : 'opacity-60'
                )}
              >
                {/* Date Number */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={cn(
                      "text-base font-semibold transition-colors",
                      calendarDay.isCurrentMonth
                        ? isCurrentDay
                          ? 'text-primary font-bold text-lg'
                          : 'text-sophisticated'
                        : 'text-muted-sophisticated'
                    )}
                  >
                    {calendarDay.date.getDate()}
                  </span>
                  
                  {/* Task count indicator */}
                  {dayTasks.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold px-2 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {dayTasks.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tasks for this day */}
                <div className="space-y-3">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "group relative text-xs p-3 rounded-lg border-l-2 cursor-pointer",
                        "task-card",
                        task.priority === 'high' && 'border-l-red-500',
                        task.priority === 'medium' && 'border-l-orange-500',
                        task.priority === 'low' && 'border-l-green-500',
                        !task.priority && 'border-l-gray-300',
                        task.completed && 'opacity-60'
                      )}
                      onClick={() => onTaskEdit(task)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={cn(
                          "text-sophisticated text-sm font-medium leading-tight line-clamp-2 flex-1",
                          task.completed && 'line-through opacity-60'
                        )}>
                          {task.title}
                        </span>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="grok-button-enhanced h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-hover-bg hover:scale-105 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="grok-popover border-grok space-y-1 p-2">
                            <DropdownMenuItem 
                              onClick={() => onTaskEdit(task)}
                              className="gap-2 py-2 px-2 transition-all duration-200 hover:bg-hover-bg rounded-grok"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span className="font-medium text-xs">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onTaskUpdate(task.id, { completed: !task.completed })}
                              className="gap-2 py-2 px-2 transition-all duration-200 hover:bg-hover-bg rounded-grok"
                            >
                              {task.completed ? (
                                <Circle className="h-3.5 w-3.5" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              <span className="font-medium text-xs">
                                {task.completed ? 'Pending' : 'Complete'}
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onTaskDelete(task.id)}
                              className="gap-2 py-2 px-2 text-priority-high hover:bg-priority-high-bg transition-all duration-200 rounded-grok"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="font-medium text-xs">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {/* Priority indicator */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full transition-colors",
                            getPriorityColor(task.priority)
                          )} />
                          <Flag className={cn(
                            "h-3 w-3 transition-colors",
                            task.priority === 'high' && 'text-priority-high',
                            task.priority === 'medium' && 'text-priority-medium',
                            task.priority === 'low' && 'text-priority-low',
                            !task.priority && 'text-muted-foreground'
                          )} />
                        </div>
                        
                        {(isOverdue(task.dueDate, task.completed) || isDueSoon(task.dueDate, task.completed)) && (
                          <Clock className={cn(
                            "h-3 w-3 transition-colors",
                            isOverdue(task.dueDate, task.completed) ? 'text-priority-high' : 'text-priority-medium'
                          )} />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Show more indicator */}
                  {dayTasks.length > 2 && (
                    <div className="text-xs font-medium text-center py-2.5 px-3 bg-muted/80 text-muted-sophisticated rounded-grok border border-border/40 hover:bg-muted transition-colors cursor-pointer">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="section-container rounded-grok-lg p-8">
        <h4 className="text-xl font-semibold text-sophisticated mb-6 flex items-center gap-3">
          📅 <span>Calendar Guide</span>
        </h4>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-foreground mb-3">Date Indicators</h5>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm font-medium text-muted-sophisticated">
                <div className="w-4 h-4 rounded-grok border-2 border-primary bg-primary/20 elevation-sm"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-sophisticated">
                <div className="w-4 h-4 rounded-grok bg-muted/80 border border-border"></div>
                <span>Past dates</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-sophisticated">
                <div className="w-4 h-4 rounded-grok bg-priority-high-bg border border-priority-high-border"></div>
                <span>Overdue tasks</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h5 className="text-sm font-semibold text-foreground mb-3">Priority Colors</h5>
            <div className="flex items-center gap-6 text-sm font-medium text-muted-sophisticated">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-priority-high elevation-sm"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-priority-medium elevation-sm"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-priority-low elevation-sm"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}