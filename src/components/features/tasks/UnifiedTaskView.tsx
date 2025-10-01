'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { TaskCard, Task } from '../dashboard/TaskCard'
import {
  Search,
  Calendar,
  Clock,
  Flag,
  List as ListIcon,
  ChevronDown,
  ChevronRight,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isToday, isTomorrow, isThisWeek, isPast } from 'date-fns'

interface TaskList {
  id: string
  title: string
  tasks: Task[]
  category?: string
  createdAt: Date
}

interface UnifiedTaskViewProps {
  taskLists: TaskList[]
  onTaskUpdate?: (taskId: string, listId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string, listId: string) => void
  onTaskToggle?: (taskId: string, listId: string, completed: boolean) => void
  onTaskListDelete?: (taskListId: string) => void
  className?: string
}

type ViewFilter = 'all' | 'today' | 'week' | 'overdue'

export function UnifiedTaskView({
  taskLists,
  onTaskUpdate,
  onTaskDelete,
  onTaskToggle,
  onTaskListDelete,
  className
}: UnifiedTaskViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set(taskLists.map(l => l.id)))

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

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = allTasks

    if (!showCompleted) {
      filtered = filtered.filter(task => !task.completed)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.listTitle?.toLowerCase().includes(query) ||
        task.category?.toLowerCase().includes(query)
      )
    }

    if (viewFilter !== 'all') {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return viewFilter === 'all'
        const dueDate = new Date(task.dueDate)

        switch (viewFilter) {
          case 'today':
            return isToday(dueDate)
          case 'week':
            return isThisWeek(dueDate) || isToday(dueDate)
          case 'overdue':
            return isPast(dueDate) && !isToday(dueDate) && !task.completed
          default:
            return true
        }
      })
    }

    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      const aOverdue = a.dueDate && isPast(new Date(a.dueDate)) && !isToday(new Date(a.dueDate))
      const bOverdue = b.dueDate && isPast(new Date(b.dueDate)) && !isToday(new Date(b.dueDate))
      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1

      return 0
    })
  }, [allTasks, showCompleted, searchQuery, viewFilter])

  // Group tasks by list
  const tasksByList = useMemo(() => {
    const grouped = new Map<string, typeof filteredTasks>()
    filteredTasks.forEach(task => {
      if (!grouped.has(task.listId)) {
        grouped.set(task.listId, [])
      }
      grouped.get(task.listId)!.push(task)
    })
    return grouped
  }, [filteredTasks])

  // Calculate stats
  const stats = useMemo(() => {
    const total = allTasks.filter(t => !t.completed).length
    const today = allTasks.filter(t => !t.completed && t.dueDate && isToday(new Date(t.dueDate))).length
    const overdue = allTasks.filter(t =>
      !t.completed && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))
    ).length
    const completed = allTasks.filter(t => t.completed).length

    return { total, today, overdue, completed }
  }, [allTasks])

  const viewFilters: { value: ViewFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <ListIcon className="h-3.5 w-3.5" /> },
    { value: 'today', label: 'Today', icon: <Calendar className="h-3.5 w-3.5" /> },
    { value: 'week', label: 'This Week', icon: <Clock className="h-3.5 w-3.5" /> },
    { value: 'overdue', label: 'Overdue', icon: <Flag className="h-3.5 w-3.5" /> },
  ]

  const handleTaskUpdate = (task: any, updates: Partial<Task>) => {
    onTaskUpdate?.(task.id, task.listId, updates)
  }

  const handleTaskDelete = (task: any) => {
    onTaskDelete?.(task.id, task.listId)
  }

  const handleTaskToggle = (task: any, completed: boolean) => {
    onTaskToggle?.(task.id, task.listId, completed)
  }

  const toggleListExpanded = (listId: string) => {
    const newExpanded = new Set(expandedLists)
    if (newExpanded.has(listId)) {
      newExpanded.delete(listId)
    } else {
      newExpanded.add(listId)
    }
    setExpandedLists(newExpanded)
  }

  return (
    <div className={cn('flex flex-col h-full bg-gray-900', className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-gray-950/50">
        {/* Stats Row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div>
            <h1 className="text-lg font-bold">My Tasks</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {stats.total} active {stats.total === 1 ? 'task' : 'tasks'}
              {stats.today > 0 && ` • ${stats.today} due today`}
              {stats.overdue > 0 && ` • ${stats.overdue} overdue`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {stats.overdue > 0 && (
              <Badge variant="outline" className="text-xs text-red-400 border-red-500 font-semibold">
                {stats.overdue} overdue
              </Badge>
            )}
            {stats.today > 0 && (
              <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500 font-semibold">
                {stats.today} today
              </Badge>
            )}
            <Badge variant="outline" className="text-xs text-green-400 border-green-500 font-semibold">
              {stats.completed} done
            </Badge>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 p-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="h-8 pl-8 text-xs"
            />
          </div>

          <div className="flex gap-1">
            {viewFilters.map(({ value, label, icon }) => (
              <Button
                key={value}
                size="sm"
                variant={viewFilter === value ? 'default' : 'outline'}
                onClick={() => setViewFilter(value)}
                className="h-8 text-xs px-2"
              >
                {icon}
                <span className="ml-1">{label}</span>
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            variant={showCompleted ? 'default' : 'outline'}
            onClick={() => setShowCompleted(!showCompleted)}
            className="h-8 text-xs px-3"
          >
            {showCompleted ? 'Hide' : 'Show'} Done
          </Button>
        </div>
      </div>

      {/* Tasks List - Grouped by List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {taskLists.map(list => {
          const listTasks = tasksByList.get(list.id) || []
          if (listTasks.length === 0 && (searchQuery || viewFilter !== 'all')) {
            return null // Hide empty lists when filtering
          }

          const isExpanded = expandedLists.has(list.id)

          return (
            <Card key={list.id} className="border-gray-700/50">
              {/* List Header */}
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800/30 transition-colors"
                onClick={() => toggleListExpanded(list.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  <ListIcon className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">{list.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {listTasks.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`Delete "${list.title}" list?`)) {
                      onTaskListDelete?.(list.id)
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </Button>
              </div>

              {/* List Tasks */}
              {isExpanded && listTasks.length > 0 && (
                <div className="px-3 pb-3 space-y-2">
                  {listTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={(_, completed) => handleTaskToggle(task, completed)}
                      onUpdate={(_, updates) => handleTaskUpdate(task, updates)}
                      onDelete={() => handleTaskDelete(task)}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {isExpanded && listTasks.length === 0 && (
                <div className="px-3 pb-3 text-center py-8">
                  <p className="text-xs text-gray-500">No tasks in this list</p>
                </div>
              )}
            </Card>
          )
        })}

        {/* Overall Empty State */}
        {taskLists.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <ListIcon className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Task Lists Yet</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Create your first task list using the AI assistant below
            </p>
          </div>
        )}

        {/* No Results State */}
        {taskLists.length > 0 && filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Search className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
            <p className="text-sm text-gray-400">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
