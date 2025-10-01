'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TaskCard, Task } from '../dashboard/TaskCard'
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Flag,
  List as ListIcon,
  Tag as TagIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isToday, isTomorrow, isThisWeek, isPast, startOfDay } from 'date-fns'

interface TaskList {
  id: string
  title: string
  tasks: Task[]
  category?: string
  createdAt: Date
}

interface TasksViewProps {
  taskLists: TaskList[]
  selectedListId?: string | null
  onTaskUpdate?: (taskId: string, listId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string, listId: string) => void
  onTaskToggle?: (taskId: string, listId: string, completed: boolean) => void
  className?: string
}

type ViewFilter = 'all' | 'today' | 'week' | 'overdue'

export function TasksView({
  taskLists,
  selectedListId,
  onTaskUpdate,
  onTaskDelete,
  onTaskToggle,
  className
}: TasksViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Flatten all tasks from all lists
  const allTasks = useMemo(() => {
    let lists = taskLists

    // Filter by selected list if one is selected
    if (selectedListId) {
      lists = taskLists.filter(list => list.id === selectedListId)
    }

    return lists.flatMap(list =>
      list.tasks.map(task => ({
        ...task,
        listId: list.id,
        listTitle: list.title
      }))
    )
  }, [taskLists, selectedListId])

  // Get all unique tags from all tasks
  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set<string>()
    allTasks.forEach(task => {
      task.tags?.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  }, [allTasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = allTasks

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(task => !task.completed)
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(task =>
        task.tags?.some(tag => selectedTags.includes(tag))
      )
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.listTitle?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by view
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

    // Sort: overdue first, then by due date, then by creation
    return filtered.sort((a, b) => {
      // Completed tasks go to bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      // Overdue tasks first
      const aOverdue = a.dueDate && isPast(new Date(a.dueDate)) && !isToday(new Date(a.dueDate))
      const bOverdue = b.dueDate && isPast(new Date(b.dueDate)) && !isToday(new Date(b.dueDate))
      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1
      }

      // Then by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1

      return 0
    })
  }, [allTasks, showCompleted, searchQuery, viewFilter, selectedTags])

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

  // Get current context info
  const currentContext = useMemo(() => {
    if (selectedListId) {
      const list = taskLists.find(l => l.id === selectedListId)
      return {
        title: list?.title || 'List',
        icon: <ListIcon className="h-5 w-5" />,
        type: 'list' as const
      }
    }

    switch (viewFilter) {
      case 'today':
        return { title: 'Today', icon: <Calendar className="h-5 w-5" />, type: 'view' as const }
      case 'week':
        return { title: 'This Week', icon: <Clock className="h-5 w-5" />, type: 'view' as const }
      case 'overdue':
        return { title: 'Overdue', icon: <Flag className="h-5 w-5 text-red-400" />, type: 'view' as const }
      default:
        return { title: 'All Tasks', icon: <ListIcon className="h-5 w-5" />, type: 'view' as const }
    }
  }, [selectedListId, viewFilter, taskLists])

  return (
    <div className={cn('flex flex-col h-full bg-gray-900', className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-gray-950/50">
        {/* Context Title - Big and Prominent */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="text-primary">
              {currentContext.icon}
            </div>
            <div>
              <h1 className="text-sm font-bold">{currentContext.title}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {stats.total} active {stats.total === 1 ? 'task' : 'tasks'}
                {stats.today > 0 && ` • ${stats.today} due today`}
                {stats.overdue > 0 && ` • ${stats.overdue} overdue`}
              </p>
            </div>
          </div>
          {/* Stats Badges */}
          <div className="flex items-center gap-1.5">
            {stats.overdue > 0 && (
              <Badge variant="outline" className="text-xs text-red-400 border-red-500 font-semibold px-1.5 py-0.5">
                {stats.overdue} overdue
              </Badge>
            )}
            {stats.today > 0 && (
              <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-500 font-semibold px-1.5 py-0.5">
                {stats.today} today
              </Badge>
            )}
            <Badge variant="outline" className="text-xs text-green-400 border-green-500 font-semibold px-1.5 py-0.5">
              {stats.completed} done
            </Badge>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 p-2">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="h-7 pl-7 text-xs"
            />
          </div>

          {/* View Filter Buttons */}
          <div className="flex gap-1">
            {viewFilters.map(({ value, label, icon }) => (
              <Button
                key={value}
                size="sm"
                variant={viewFilter === value ? 'default' : 'outline'}
                onClick={() => setViewFilter(value)}
                className="h-7 text-xs px-2"
              >
                {icon}
                <span className="ml-1">{label}</span>
              </Button>
            ))}
          </div>

          {/* Show Completed Toggle */}
          <Button
            size="sm"
            variant={showCompleted ? 'default' : 'outline'}
            onClick={() => setShowCompleted(!showCompleted)}
            className="h-7 text-xs px-2"
          >
            {showCompleted ? 'Hide' : 'Show'} Done
          </Button>
        </div>

        {/* Tag Filter Section */}
        {allUniqueTags.length > 0 && (
          <div className="px-2 pb-2 border-t border-gray-800 pt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <TagIcon className="h-3 w-3 text-gray-500 flex-shrink-0" />
              <span className="text-xs text-gray-500">Filter by tag:</span>
              {allUniqueTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs px-1.5 py-0.5 hover:scale-105 transition-transform"
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag)
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    )
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-gray-500 hover:text-gray-300 underline ml-1"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Calendar className="h-12 w-12 text-gray-600 mb-3" />
            <p className="text-xs font-medium text-gray-400">No tasks found</p>
            <p className="text-xs text-gray-500 mt-1.5">
              {searchQuery
                ? 'Try a different search term'
                : selectedListId
                ? 'This list is empty'
                : 'Create tasks using AI chat below'}
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={(_, completed) => handleTaskToggle(task, completed)}
              onUpdate={(_, updates) => handleTaskUpdate(task, updates)}
              onDelete={() => handleTaskDelete(task)}
            />
          ))
        )}
      </div>
    </div>
  )
}
