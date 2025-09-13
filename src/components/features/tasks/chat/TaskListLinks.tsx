'use client'

import { Button } from '@/components/ui/button'
import { Plus, ListTodo } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskList {
  id: string
  title: string
  taskCount: number
  createdAt: Date
}

interface TaskListLinksProps {
  taskLists: TaskList[]
  onCreateNew: () => void
  onTaskListClick?: (taskList: TaskList) => void
}

export function TaskListLinks({ taskLists, onCreateNew, onTaskListClick }: TaskListLinksProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground mr-2">Task Lists:</span>
      
      {taskLists.map((list) => (
        <Button
          key={list.id}
          variant="ghost"
          size="sm"
          onClick={() => onTaskListClick?.(list)}
          className={cn(
            "h-8 text-xs px-3 py-1",
            "hover:bg-muted/50 hover:text-foreground",
            "transition-colors duration-200 cursor-pointer"
          )}
        >
          <ListTodo className="h-3 w-3 mr-1" />
          {list.title}
          <span className="ml-1 text-muted-foreground">({list.taskCount})</span>
        </Button>
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onCreateNew}
        className={cn(
          "h-8 text-xs px-3 py-1",
          "hover:bg-muted/50 hover:text-foreground",
          "transition-colors duration-200"
        )}
      >
        <Plus className="h-3 w-3 mr-1" />
        New List
      </Button>
    </div>
  )
}
