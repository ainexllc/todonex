'use client'

import { Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskCard, type Task } from '../../dashboard/TaskCard'
import { cn } from '@/lib/utils'
import { getIconComponent } from '@/lib/utils/icon-matcher'
import { getListColor } from '@/lib/utils/list-colors'
import type { TaskList } from '@/types/task'

interface GridViewProps {
  taskLists: TaskList[]
  onTaskUpdate?: (taskId: string, listId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string, listId: string) => void
  onTaskToggle?: (taskId: string, listId: string, completed: boolean) => void
  onListCustomize?: (taskList: TaskList) => void
  className?: string
}

export function GridView({
  taskLists,
  onTaskUpdate,
  onTaskDelete,
  onTaskToggle,
  onListCustomize,
  className
}: GridViewProps) {
  return (
    <div className={cn('p-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {taskLists.map((list) => {
          const IconComponent = getIconComponent(list.icon || 'List')
          const colorTheme = getListColor(list.color)
          const incompleteTasks = list.tasks.filter(t => !t.completed)
          const completedTasks = list.tasks.filter(t => t.completed)

          return (
            <Card
              key={list.id}
              className="border-gray-700/50 overflow-hidden flex flex-col h-[400px]"
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
                  <h3 className={cn('font-semibold text-sm truncate', colorTheme.text)}>
                    {list.title}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onListCustomize?.(list)}
                >
                  <Settings className={cn('h-3.5 w-3.5', colorTheme.text)} />
                </Button>
              </div>

              {/* Stats */}
              <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-800">
                <Badge variant="secondary" className="text-xs">
                  {incompleteTasks.length} active
                </Badge>
                {completedTasks.length > 0 && (
                  <Badge variant="outline" className="text-xs text-green-400 border-green-500">
                    {completedTasks.length} done
                  </Badge>
                )}
              </div>

              {/* Task List (Compact Mode) - Scrollable */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {incompleteTasks.length > 0 ? (
                  incompleteTasks.slice(0, 10).map((task) => (
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
                  <div className="text-center py-8 text-xs text-gray-500">
                    No active tasks
                  </div>
                )}
              </div>

              {/* Footer - More indicator */}
              {incompleteTasks.length > 10 && (
                <div className="px-3 py-2 border-t border-gray-800 text-center text-xs text-gray-500">
                  +{incompleteTasks.length - 10} more tasks
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {taskLists.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <p className="text-sm text-gray-400">No task lists yet</p>
        </div>
      )}
    </div>
  )
}
