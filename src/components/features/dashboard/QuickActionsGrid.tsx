'use client'

import { Button } from '@/components/ui/button'
import {
  Calendar,
  Sparkles,
  Plus,
  BarChart3,
  Clock,
  Scissors,
  Shuffle,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  prompt: string
}

const quickActions: QuickAction[] = [
  {
    id: 'plan-day',
    label: 'Plan My Day',
    icon: <Calendar className="h-5 w-5" />,
    description: 'AI organizes your tasks optimally',
    prompt: 'Help me plan my day. Look at my tasks and suggest the best order to complete them based on priority and deadlines.'
  },
  {
    id: 'whats-next',
    label: "What's Next",
    icon: <Sparkles className="h-5 w-5" />,
    description: 'Get your next suggested task',
    prompt: 'Based on my current tasks, priorities, and the time of day, what should I work on next?'
  },
  {
    id: 'add-task',
    label: 'Add Task',
    icon: <Plus className="h-5 w-5" />,
    description: 'Create a new task quickly',
    prompt: 'I want to add a new task: '
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: <BarChart3 className="h-5 w-5" />,
    description: 'View productivity analytics',
    prompt: 'Show me insights about my tasks. What patterns do you see? Am I on track with my goals?'
  },
  {
    id: 'time-block',
    label: 'Time Block',
    icon: <Clock className="h-5 w-5" />,
    description: 'Create time-blocked schedule',
    prompt: 'Create a time-blocked schedule for my tasks today. Consider task duration and my typical productivity patterns.'
  },
  {
    id: 'break-down',
    label: 'Break Down',
    icon: <Scissors className="h-5 w-5" />,
    description: 'Split task into subtasks',
    prompt: 'Help me break down my complex tasks into smaller, manageable subtasks.'
  },
  {
    id: 'reschedule',
    label: 'Reschedule Smart',
    icon: <Shuffle className="h-5 w-5" />,
    description: 'AI-powered rescheduling',
    prompt: 'Look at my overdue and upcoming tasks. Help me reschedule them realistically.'
  },
  {
    id: 'delegate',
    label: 'Delegate',
    icon: <Users className="h-5 w-5" />,
    description: 'Suggest task assignments',
    prompt: 'Which of my tasks could be delegated to family members? Make suggestions.'
  }
]

interface QuickActionsGridProps {
  onActionClick: (action: QuickAction) => void
  className?: string
}

export function QuickActionsGrid({ onActionClick, className }: QuickActionsGridProps) {
  return (
    <div className={cn('p-4', className)}>
      <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            onClick={() => onActionClick(action)}
            className="h-auto flex flex-col items-start p-3 text-left hover:bg-primary/10 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1 text-primary group-hover:scale-110 transition-transform">
              {action.icon}
              <span className="text-xs font-semibold">{action.label}</span>
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
              {action.description}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
