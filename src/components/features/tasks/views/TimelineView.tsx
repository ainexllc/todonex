'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from '../../dashboard/TaskCard'
import { Calendar, Clock, AlertCircle, Inbox } from 'lucide-react'
import { format, isToday, isTomorrow, isThisWeek, isPast, startOfDay } from 'date-fns'
import type { Task, TaskList } from '@/types/task'
import { cn } from '@/lib/utils'

interface TimelineViewProps {
  taskLists: TaskList[]
  onTaskUpdate?: (taskId: string, listId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string, listId: string) => void
  onTaskToggle?: (taskId: string, listId: string, completed: boolean) => void
  className?: string
}

interface TaskWithList extends Task {
  listId: string
  listTitle: string
}

type TimelineBucket = {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  tasks: TaskWithList[]
}

export function TimelineView({
  taskLists,
  onTaskUpdate,
  onTaskDelete,
  onTaskToggle,
  className
}: TimelineViewProps) {
  // Flatten all tasks with their list info
  const allTasks = useMemo(() => {
    return taskLists.flatMap(list =>
      list.tasks.map(task => ({
        ...task,
        listId: list.id,
        listTitle: list.title
      }))
    )
  }, [taskLists])

  // Organize tasks into timeline buckets
  const timelineBuckets = useMemo((): TimelineBucket[] => {
    const overdue: TaskWithList[] = []
    const today: TaskWithList[] = []
    const tomorrow: TaskWithList[] = []
    const thisWeek: TaskWithList[] = []
    const future: TaskWithList[] = []
    const noDate: TaskWithList[] = []

    allTasks.forEach(task => {
      if (!task.dueDate) {
        noDate.push(task)
        return
      }

      const dueDate = new Date(task.dueDate)
      const now = new Date()

      if (isPast(dueDate) && !isToday(dueDate) && !task.completed) {
        overdue.push(task)
      } else if (isToday(dueDate)) {
        today.push(task)
      } else if (isTomorrow(dueDate)) {
        tomorrow.push(task)
      } else if (isThisWeek(dueDate)) {
        thisWeek.push(task)
      } else {
        future.push(task)
      }
    })

    // Sort tasks within each bucket by due date
    const sortByDueDate = (a: TaskWithList, b: TaskWithList) => {
      if (!a.dueDate || !b.dueDate) return 0
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }

    overdue.sort(sortByDueDate)
    today.sort(sortByDueDate)
    tomorrow.sort(sortByDueDate)
    thisWeek.sort(sortByDueDate)
    future.sort(sortByDueDate)

    return [
      {
        id: 'overdue',
        title: 'Overdue',
        icon: <AlertCircle className="h-4 w-4" />,
        color: 'text-red-400 border-red-500',
        tasks: overdue
      },
      {
        id: 'today',
        title: 'Today',
        icon: <Calendar className="h-4 w-4" />,
        color: 'text-yellow-400 border-yellow-500',
        tasks: today
      },
      {
        id: 'tomorrow',
        title: 'Tomorrow',
        icon: <Clock className="h-4 w-4" />,
        color: 'text-blue-400 border-blue-500',
        tasks: tomorrow
      },
      {
        id: 'thisWeek',
        title: 'This Week',
        icon: <Calendar className="h-4 w-4" />,
        color: 'text-green-400 border-green-500',
        tasks: thisWeek
      },
      {
        id: 'future',
        title: 'Future',
        icon: <Calendar className="h-4 w-4" />,
        color: 'text-purple-400 border-purple-500',
        tasks: future
      },
      {
        id: 'noDate',
        title: 'No Due Date',
        icon: <Inbox className="h-4 w-4" />,
        color: 'text-gray-400 border-gray-500',
        tasks: noDate
      }
    ].filter(bucket => bucket.tasks.length > 0) // Only show non-empty buckets
  }, [allTasks])

  const handleTaskUpdate = (task: TaskWithList, updates: Partial<Task>) => {
    onTaskUpdate?.(task.id, task.listId, updates)
  }

  const handleTaskDelete = (task: TaskWithList) => {
    onTaskDelete?.(task.id, task.listId)
  }

  const handleTaskToggle = (task: TaskWithList, completed: boolean) => {
    onTaskToggle?.(task.id, task.listId, completed)
  }

  return (
    <div className={cn('p-4 space-y-6 overflow-y-auto', className)}>
      {timelineBuckets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
          <p className="text-sm text-muted-foreground">
            Create tasks with due dates to see them in the timeline
          </p>
        </div>
      ) : (
        timelineBuckets.map(bucket => (
          <div key={bucket.id} className="space-y-3">
            {/* Bucket Header */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={cn('p-1.5 rounded-md border', bucket.color)}>
                  {bucket.icon}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  {bucket.title}
                </h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {bucket.tasks.length}
              </Badge>
            </div>

            {/* Timeline Tasks */}
            <div className="pl-10 space-y-2 relative">
              {/* Vertical timeline line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-[2px] bg-border" />

              {bucket.tasks.map((task, index) => (
                <div key={task.id} className="relative">
                  {/* Timeline dot */}
                  <div className={cn(
                    'absolute -left-[30px] top-3 w-2 h-2 rounded-full border-2',
                    bucket.color,
                    'bg-background'
                  )} />

                  {/* Task Card */}
                  <Card className="border-border">
                    <div className="p-3">
                      {/* Date header for task */}
                      {task.dueDate && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(task.dueDate), 'EEEE, MMM d, yyyy')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {task.listTitle}
                          </Badge>
                        </div>
                      )}

                      <TaskCard
                        task={task}
                        onToggleComplete={(_, completed) => handleTaskToggle(task, completed)}
                        onUpdate={(_, updates) => handleTaskUpdate(task, updates)}
                        onDelete={() => handleTaskDelete(task)}
                      />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
