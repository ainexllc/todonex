'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Calendar, X, ChevronDown, ChevronUp, CheckCircle, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, startOfDay, isSameDay, subDays, isToday, isYesterday, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { getUserDocuments } from '@/lib/firebase-data'

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  completedAt?: Date
  category?: string
  listTitle?: string
}

interface TaskList {
  id: string
  title: string
  tasks: Task[]
}

interface DayGroup {
  date: Date
  dateString: string
  tasks: Task[]
  isExpanded: boolean
}

interface TaskCompletedProps {
  onClose: () => void
  className?: string
}

export function TaskCompleted({ onClose, className }: TaskCompletedProps) {
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalTasks, setTotalTasks] = useState(0)

  useEffect(() => {
    loadCompletedTasks()
  }, [])

  const loadCompletedTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load all task lists from Firebase
      const taskLists = await getUserDocuments<TaskList>('taskLists', 'updatedAt')

      if (!taskLists || taskLists.length === 0) {
        setDayGroups([])
        setTotalTasks(0)
        return
      }

      // Extract all completed tasks and flatten them
      const allCompletedTasks: Task[] = []

      taskLists.forEach(list => {
        // Safety checks for list data
        if (!list || !list.title) {
          return
        }


        const completedTasks = (list.tasks || [])
          .filter(task => {
            // Filter out invalid tasks and require completion date
            if (!task || typeof task.completed !== 'boolean') {
              return false
            }

            const hasCompletionDate = task.completedAt != null

            return task.completed && hasCompletionDate
          })
          .map(task => {
            try {
              // Robust date handling with error recovery
              let completedAtDate: Date

              if (task.completedAt instanceof Date) {
                completedAtDate = task.completedAt
              } else if (typeof task.completedAt === 'string') {
                // Handle ISO string dates from Firebase
                completedAtDate = parseISO(task.completedAt)

                // Validate the parsed date
                if (isNaN(completedAtDate.getTime())) {
                  completedAtDate = new Date() // Fallback to now
                }
              } else {
                completedAtDate = new Date() // Fallback to now
              }

              return {
                ...task,
                listTitle: list.title || 'Unknown List',
                completedAt: completedAtDate
              }
            } catch (dateError) {
              void dateError
              return {
                ...task,
                listTitle: list.title || 'Unknown List',
                completedAt: new Date() // Safe fallback
              }
            }
          })

        allCompletedTasks.push(...completedTasks)
      })

      // Group tasks by local date (timezone-aware)
      const groups: Map<string, Task[]> = new Map()
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

      allCompletedTasks.forEach(task => {
        if (!task.completedAt) {
          return
        }

        try {
          // Convert UTC date to user's local timezone for proper day grouping
          const localDate = toZonedTime(task.completedAt, userTimezone)

          // Validate the converted date
          if (isNaN(localDate.getTime())) {
            return
          }

          // Use local date string for grouping (ensures proper day boundaries)
          const dayKey = localDate.toLocaleDateString('en-CA') // YYYY-MM-DD format

          if (!groups.has(dayKey)) {
            groups.set(dayKey, [])
          }
          groups.get(dayKey)!.push(task)
        } catch (timezoneError) {
          void timezoneError
          // Fallback to simple date grouping
          const fallbackKey = task.completedAt.toLocaleDateString('en-CA')
          if (!groups.has(fallbackKey)) {
            groups.set(fallbackKey, [])
          }
          groups.get(fallbackKey)!.push(task)
        }
      })

      // Convert to array and sort by date (most recent first)
      const sortedGroups: DayGroup[] = Array.from(groups.entries())
        .map(([dateString, tasks]) => {
          // Create date object from YYYY-MM-DD string in local timezone
          const localDate = new Date(dateString + 'T00:00:00')

          return {
            date: localDate,
            dateString,
            tasks: tasks.sort((a, b) => {
              // Sort by completion time within each day (most recent first)
              const timeA = a.completedAt ? a.completedAt.getTime() : 0
              const timeB = b.completedAt ? b.completedAt.getTime() : 0
              return timeB - timeA
            }),
            isExpanded: true // Start with today and yesterday expanded, others collapsed
          }
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map((group, index) => ({
          ...group,
          isExpanded: index < 2 // Only expand first 2 days (today and yesterday)
        }))


      setDayGroups(sortedGroups)
      setTotalTasks(allCompletedTasks.length)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load completed tasks')
      setDayGroups([])
      setTotalTasks(0)
    } finally {
      setLoading(false)
    }
  }

  const toggleDayExpanded = (index: number) => {
    setDayGroups(prev => prev.map((group, i) =>
      i === index ? { ...group, isExpanded: !group.isExpanded } : group
    ))
  }

  const getDateLabel = (date: Date) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    const diffTime = today.getTime() - targetDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays <= 7) {
      return format(date, 'EEEE') // Monday, Tuesday, etc.
    }
    if (diffDays <= 365) {
      return format(date, 'MMM d') // Jan 15, Feb 3, etc.
    }

    return format(date, 'MMM d, yyyy') // Jan 15, 2023
  }

  const getTotalCompleted = () => {
    return totalTasks || dayGroups.reduce((total, group) => total + group.tasks.length, 0)
  }

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/50", className)}>
      <Card className="w-full max-w-4xl h-[85vh] bg-gray-900 border-gray-800 flex flex-col">
        {/* Header - More Compact */}
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <h2 className="text-[15px] font-semibold text-white">Completed Tasks</h2>
              <p className="text-[11px] text-gray-400">
                {getTotalCompleted()} tasks completed across {dayGroups.length} days
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content - Compact Padding */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin h-5 w-5 border-2 border-gray-600 border-t-transparent rounded-full mb-3" />
              <p className="text-[11px] text-gray-500">Loading completed tasks...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <X className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-[12px] text-red-400 mb-1">Error loading tasks</p>
              <p className="text-[10px] text-gray-500 mb-3">{error}</p>
              <button
                onClick={loadCompletedTasks}
                className="text-[11px] text-blue-400 hover:text-blue-300 underline"
              >
                Try again
              </button>
            </div>
          ) : dayGroups.length === 0 ? (
            <div className="text-center py-8">
              <CheckSquare className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-[12px] text-gray-400">No completed tasks yet</p>
              <p className="text-[11px] text-gray-500 mt-1">
                Completed tasks will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayGroups.map((group, index) => (
                <div key={group.dateString} className="border border-gray-800/60 rounded-md overflow-hidden">
                  {/* Day Header - More Compact */}
                  <button
                    onClick={() => toggleDayExpanded(index)}
                    className="w-full px-3 py-2 bg-gray-900/40 hover:bg-gray-900/60 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <span className="text-[12px] font-medium text-white">
                        {getDateLabel(group.date)}
                      </span>
                      <span className="text-[11px] text-gray-400 bg-gray-800/50 px-1.5 py-0.5 rounded">
                        {group.tasks.length}
                      </span>
                    </div>
                    {group.isExpanded ? (
                      <ChevronUp className="h-3 w-3 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    )}
                  </button>

                  {/* Tasks for this day - Ultra Compact */}
                  {group.isExpanded && (
                    <div className="p-3 space-y-1.5">
                      {group.tasks.map((task, taskIndex) => (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-start gap-2.5 p-2 rounded-md transition-colors",
                            taskIndex % 2 === 0 ? "bg-gray-900/20" : "bg-gray-900/40"
                          )}
                        >
                          <CheckSquare className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-gray-300 line-through leading-tight">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                                {task.description}
                              </p>
                            )}
                            {task.listTitle && (
                              <span className="inline-flex items-center gap-1 mt-0.5">
                                <span className="text-[9px] text-gray-500">from</span>
                                <span className="text-[9px] text-blue-400 bg-blue-900/20 px-1 py-0.5 rounded">
                                  {task.listTitle}
                                </span>
                              </span>
                            )}
                          </div>
                          {task.completedAt && (
                            <span className="text-[10px] text-gray-500 flex-shrink-0 bg-gray-800/50 px-1.5 py-0.5 rounded">
                              {format(task.completedAt, 'h:mm a')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
