'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Loader2, Wand2, ListTodo } from 'lucide-react'
import { useTaskAI } from '@/lib/ai/hooks'
import { useAIFeature } from '@/lib/ai/context'

interface TaskAIInputProps {
  onTaskCreated?: (task: any) => void
  onTasksCreated?: (tasks: any[]) => void
  existingTasks?: any[]
  className?: string
}

export function TaskAIInput({ 
  onTaskCreated, 
  onTasksCreated, 
  existingTasks = [],
  className 
}: TaskAIInputProps) {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'single' | 'batch'>('single')
  const { createTask, breakdownTask, loading, error } = useTaskAI()
  const { canUseAI, hasReachedLimit, remainingRequests } = useAIFeature('tasks')

  const handleSingleTask = async () => {
    if (!input.trim() || !canUseAI) return

    try {
      const task = await createTask(input, { existingTasks: existingTasks.slice(-5) })
      onTaskCreated?.(task)
      setInput('')
    } catch (error) {
      void error
    }
  }

  const handleBatchTasks = async () => {
    if (!input.trim() || !canUseAI) return

    try {
      const tasks = await breakdownTask(input)
      onTasksCreated?.(tasks)
      setInput('')
    } catch (error) {
      void error
    }
  }

  const handleSubmit = () => {
    if (mode === 'single') {
      handleSingleTask()
    } else {
      handleBatchTasks()
    }
  }

  if (!canUseAI) {
    return (
      <div 
        className="glass rounded-xl p-4 text-center relative overflow-hidden border border-slate-200/30"
        style={{
          background: `linear-gradient(135deg, rgba(71, 85, 105, 0.03) 0%, rgba(51, 65, 85, 0.05) 100%)`,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236b7280' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='0' cy='0' r='4'/%3E%3Ccircle cx='60' cy='0' r='4'/%3E%3Ccircle cx='0' cy='60' r='4'/%3E%3Ccircle cx='60' cy='60' r='4'/%3E%3Ccircle cx='30' cy='0' r='2'/%3E%3Ccircle cx='0' cy='30' r='2'/%3E%3Ccircle cx='60' cy='30' r='2'/%3E%3Ccircle cx='30' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), linear-gradient(135deg, rgba(71, 85, 105, 0.03) 0%, rgba(51, 65, 85, 0.05) 100%)`
        }}
      >
        <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          AI Task Assistant is currently unavailable
        </p>
      </div>
    )
  }

  if (hasReachedLimit) {
    return (
      <div 
        className="glass rounded-xl p-4 text-center border border-amber-200/50 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(245, 158, 11, 0.04) 0%, rgba(217, 119, 6, 0.06) 100%)`,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='0' cy='0' r='4'/%3E%3Ccircle cx='60' cy='0' r='4'/%3E%3Ccircle cx='0' cy='60' r='4'/%3E%3Ccircle cx='60' cy='60' r='4'/%3E%3Ccircle cx='30' cy='0' r='2'/%3E%3Ccircle cx='0' cy='30' r='2'/%3E%3Ccircle cx='60' cy='30' r='2'/%3E%3Ccircle cx='30' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), linear-gradient(135deg, rgba(245, 158, 11, 0.04) 0%, rgba(217, 119, 6, 0.06) 100%)`
        }}
      >
        <Sparkles className="h-8 w-8 mx-auto mb-2 text-amber-600" />
        <p className="text-sm text-amber-700">
          Daily AI usage limit reached. Resets tomorrow.
        </p>
      </div>
    )
  }

  return (
    <div 
      className={`glass rounded-xl p-4 space-y-4 relative overflow-hidden border-4 border-sky-400 ${className}`}
      style={{
        background: `linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.08) 100%)`,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.06'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='0' cy='0' r='4'/%3E%3Ccircle cx='60' cy='0' r='4'/%3E%3Ccircle cx='0' cy='60' r='4'/%3E%3Ccircle cx='60' cy='60' r='4'/%3E%3Ccircle cx='30' cy='0' r='2'/%3E%3Ccircle cx='0' cy='30' r='2'/%3E%3Ccircle cx='60' cy='30' r='2'/%3E%3Ccircle cx='30' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.08) 100%)`
      }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="font-medium text-primary">AI Task Assistant</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {remainingRequests} requests remaining today
        </span>
      </div>

        <div className="flex gap-2">
          <Button
            variant={mode === 'single' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('single')}
            className="h-8"
          >
            <Wand2 className="h-3 w-3 mr-1" />
            Single Task
          </Button>
          <Button
            variant={mode === 'batch' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('batch')}
            className="h-8"
          >
            <ListTodo className="h-3 w-3 mr-1" />
            Multiple Tasks
          </Button>
        </div>

        <div className="space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'single'
                ? 'Describe a task... (e.g., "Buy groceries tomorrow at 5pm")'
                : 'Describe what you need to accomplish... (e.g., "Plan a birthday party for next weekend")'
            }
            className="min-h-[80px] resize-none border-primary/20 focus-visible:ring-primary/30"
            maxLength={mode === 'single' ? 500 : 1000}
            disabled={loading}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {input.length}/{mode === 'single' ? 500 : 1000} characters
            </span>

            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-2" />
                  {mode === 'single' ? 'Create Task' : 'Generate Tasks'}
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        )}

        {mode === 'single' ? (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Examples:</strong></p>
            <p>• "Call the dentist to schedule a checkup next week"</p>
            <p>• "Buy ingredients for pasta dinner tomorrow"</p>
            <p>• "Review quarterly budget by Friday"</p>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Examples:</strong></p>
            <p>• "Organize a team lunch for next Friday"</p>
            <p>• "Prepare for vacation next month"</p>
            <p>• "Launch new product marketing campaign"</p>
          </div>
        )}
    </div>
  )
}
