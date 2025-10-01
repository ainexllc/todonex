'use client'

import { useMemo } from 'react'
import { Settings, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskCard, type Task } from '../../dashboard/TaskCard'
import { cn } from '@/lib/utils'
import { getIconComponent } from '@/lib/utils/icon-matcher'
import { getListColor } from '@/lib/utils/list-colors'
import { toAllCaps } from '@/lib/utils/text-formatter'
import type { TaskList } from '@/types/task'

interface MasonryViewProps {
  taskLists: TaskList[]
  onTaskUpdate?: (taskId: string, listId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string, listId: string) => void
  onTaskToggle?: (taskId: string, listId: string, completed: boolean) => void
  onListCustomize?: (taskList: TaskList) => void
  onListDelete?: (taskListId: string) => void
  onListReorder?: (listId: string, direction: 'up' | 'down') => void
  className?: string
}

export function MasonryView({
  taskLists,
  onTaskUpdate,
  onTaskDelete,
  onTaskToggle,
  onListCustomize,
  onListDelete,
  onListReorder,
  className
}: MasonryViewProps) {
  // Distribute lists across 5 columns in a balanced way
  const columns = useMemo(() => {
    const columnCount = 5
    const cols: TaskList[][] = Array.from({ length: columnCount }, () => [])

    // Sort by task count to balance distribution
    const sortedLists = [...taskLists].sort((a, b) => b.tasks.length - a.tasks.length)

    // Distribute lists to columns with least tasks first (balancing algorithm)
    sortedLists.forEach((list) => {
      const columnTaskCounts = cols.map(col =>
        col.reduce((sum, l) => sum + l.tasks.length, 0)
      )
      const minColumnIndex = columnTaskCounts.indexOf(Math.min(...columnTaskCounts))
      cols[minColumnIndex].push(list)
    })

    return cols
  }, [taskLists])

  return (
    <div className={cn('p-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            {column.map((list) => {
              const IconComponent = getIconComponent(list.icon || 'List')
              const colorTheme = getListColor(list.color)
              const incompleteTasks = list.tasks.filter(t => !t.completed)
              const completedTasks = list.tasks.filter(t => t.completed)

              return (
                <Card
                  key={list.id}
                  className="border-border overflow-hidden flex flex-col"
                >
                  {/* Header with color theme */}
                  <div
                    className={cn(
                      'px-3 py-2.5 border-b-2 flex items-center justify-between',
                      colorTheme.bg,
                      colorTheme.border
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {IconComponent && (
                        <IconComponent className={cn('h-4 w-4 flex-shrink-0', colorTheme.text)} />
                      )}
                      <h3 className={cn('font-semibold text-[17px] truncate', colorTheme.text)}>
                        {toAllCaps(list.title)}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onListReorder?.(list.id, 'up')}
                        title="Move up"
                      >
                        <ChevronUp className={cn('h-3.5 w-3.5', colorTheme.text)} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onListReorder?.(list.id, 'down')}
                        title="Move down"
                      >
                        <ChevronDown className={cn('h-3.5 w-3.5', colorTheme.text)} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onListCustomize?.(list)}
                        title="Customize list"
                      >
                        <Settings className={cn('h-3.5 w-3.5', colorTheme.text)} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          if (window.confirm(`Delete "${list.title}" list?`)) {
                            onListDelete?.(list.id)
                          }
                        }}
                        title="Delete list"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  {completedTasks.length > 0 && (
                    <div className="px-3 py-2 flex items-center gap-2 border-b border-border">
                      <Badge variant="outline" className="text-xs text-green-400 border-green-500">
                        {completedTasks.length} done
                      </Badge>
                    </div>
                  )}

                  {/* Task List - All tasks visible */}
                  <div className="p-2 space-y-1">
                    {incompleteTasks.length > 0 ? (
                      incompleteTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          compact={true}
                          onToggleComplete={(_, completed) =>
                            onTaskToggle?.(task.id, list.id, completed)
                          }
                          onUpdate={(_, updates) => onTaskUpdate?.(task.id, list.id, updates)}
                          onDelete={() => onTaskDelete?.(task.id, list.id)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-xs text-muted-foreground">
                        No active tasks
                      </div>
                    )}

                    {/* Show completed tasks if any */}
                    {completedTasks.length > 0 && (
                      <>
                        <div className="pt-2 pb-1 text-xs text-muted-foreground font-medium">
                          Completed ({completedTasks.length})
                        </div>
                        {completedTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            compact={true}
                            onToggleComplete={(_, completed) =>
                              onTaskToggle?.(task.id, list.id, completed)
                            }
                            onUpdate={(_, updates) => onTaskUpdate?.(task.id, list.id, updates)}
                            onDelete={() => onTaskDelete?.(task.id, list.id)}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {taskLists.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <p className="text-sm text-muted-foreground">No task lists yet</p>
        </div>
      )}
    </div>
  )
}
