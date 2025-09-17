'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Calendar, X, ChevronDown, ChevronUp, Archive as ArchiveIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, startOfDay, isSameDay, subDays, isToday, isYesterday } from 'date-fns'
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

interface TaskArchiveProps {
  onClose: () => void
  className?: string
}

export function TaskArchive({ onClose, className }: TaskArchiveProps) {
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompletedTasks()
  }, [])

  const loadCompletedTasks = async () => {
    try {
      setLoading(true)

      // Load all task lists from Firebase
      const taskLists = await getUserDocuments<TaskList>('taskLists', 'updatedAt')

      // Extract all completed tasks and flatten them
      const allCompletedTasks: Task[] = []

      taskLists.forEach(list => {
        const completedTasks = (list.tasks || [])
          .filter(task => task.completed)
          .map(task => ({
            ...task,
            listTitle: list.title,
            // Use completedAt if available, otherwise use today
            completedAt: task.completedAt || new Date()
          }))
        allCompletedTasks.push(...completedTasks)
      })

      // Group tasks by day
      const groups: Map<string, Task[]> = new Map()

      allCompletedTasks.forEach(task => {
        const taskDate = task.completedAt ? new Date(task.completedAt) : new Date()
        const dayKey = format(startOfDay(taskDate), 'yyyy-MM-dd')

        if (!groups.has(dayKey)) {
          groups.set(dayKey, [])
        }
        groups.get(dayKey)!.push(task)
      })

      // Convert to array and sort by date (most recent first)
      const sortedGroups: DayGroup[] = Array.from(groups.entries())
        .map(([dateString, tasks]) => ({
          date: new Date(dateString),
          dateString,
          tasks: tasks.sort((a, b) => {
            const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0
            const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0
            return dateB - dateA
          }),
          isExpanded: true // Start with all days expanded
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime())

      setDayGroups(sortedGroups)
    } catch (error) {
      console.error('Failed to load completed tasks:', error)
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
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'

    // If within last week, show day name
    const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (daysAgo <= 7) {
      return format(date, 'EEEE')
    }

    // Otherwise show full date
    return format(date, 'MMM d, yyyy')
  }

  const getTotalCompleted = () => {
    return dayGroups.reduce((total, group) => total + group.tasks.length, 0)
  }

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/50", className)}>
      <Card className="w-full max-w-3xl h-[80vh] bg-gray-900 border-gray-800 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArchiveIcon className="h-5 w-5 text-gray-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Task Archive</h2>
              <p className="text-[13px] text-gray-400">
                {getTotalCompleted()} completed tasks
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-gray-600 border-t-transparent rounded-full" />
            </div>
          ) : dayGroups.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-[13px] text-gray-400">No completed tasks yet</p>
              <p className="text-[13px] text-gray-500 mt-1">
                Completed tasks will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dayGroups.map((group, index) => (
                <div key={group.dateString} className="border border-gray-800 rounded-lg overflow-hidden">
                  {/* Day Header */}
                  <button
                    onClick={() => toggleDayExpanded(index)}
                    className="w-full px-4 py-3 bg-gray-900/50 hover:bg-gray-900/70 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-[13px] font-medium text-white">
                        {getDateLabel(group.date)}
                      </span>
                      <span className="text-[13px] text-gray-400">
                        {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {group.isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  {/* Tasks for this day */}
                  {group.isExpanded && (
                    <div className="p-4 space-y-2">
                      {group.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 p-2 rounded-lg bg-gray-900/30"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-gray-300 line-through">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-[13px] text-gray-500 mt-0.5">
                                {task.description}
                              </p>
                            )}
                            {task.listTitle && (
                              <span className="inline-flex items-center gap-1 mt-1">
                                <span className="text-[11px] text-gray-500">from</span>
                                <span className="text-[11px] text-blue-400">{task.listTitle}</span>
                              </span>
                            )}
                          </div>
                          {task.completedAt && (
                            <span className="text-[11px] text-gray-500 flex-shrink-0">
                              {format(new Date(task.completedAt), 'h:mm a')}
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