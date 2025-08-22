'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Flag, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createDocument } from '@/lib/firebase-data'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'

interface TaskFormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  categoryId: string
}

interface AIEnhancement {
  subtasks: Array<{
    title: string
    selected: boolean
  }>
  scheduling: {
    estimatedDuration: string
    bestTimeOfDay: string
    suggestedDueDate: string
  }
  priority: {
    level: 'low' | 'medium' | 'high'
    reasoning: string
  }
  strategies: string[]
  risks: string[]
  category: string
}

export default function NewTaskPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()
  
  // Get current user's local date
  const getCurrentUserDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: getCurrentUserDate(), // Current user's local date as default
    categoryId: ''
  })
  
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiSuggestions, setAISuggestions] = useState<AIEnhancement | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (formData.dueDate) {
      const selectedDateString = formData.dueDate
      const todayString = getCurrentUserDate()
      
      if (selectedDateString < todayString) {
        newErrors.dueDate = 'Due date cannot be in the past'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateField = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAIEnhance = async () => {
    if (!formData.title.trim()) return
    
    setIsEnhancing(true)
    setShowAIPanel(true)
    
    try {
      const response = await fetch('/api/ai/tasks/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          context: {
            currentDescription: formData.description,
            currentPriority: formData.priority
          }
        })
      })
      
      if (response.ok) {
        const enhancement = await response.json()
        setAISuggestions(enhancement)
        trackFeatureUsage('tasks', 'ai_enhance')
      } else {
        console.error('Failed to enhance task')
      }
    } catch (error) {
      console.error('Error enhancing task:', error)
    } finally {
      setIsEnhancing(false)
    }
  }

  const applyAISuggestions = () => {
    if (!aiSuggestions) return
    
    // Apply description enhancement
    if (aiSuggestions.subtasks.length > 0) {
      const subtaskText = aiSuggestions.subtasks
        .filter(st => st.selected)
        .map(st => `• ${st.title}`)
        .join('\n')
      
      const enhancedDescription = formData.description
        ? `${formData.description}\n\nSubtasks:\n${subtaskText}`
        : `Subtasks:\n${subtaskText}`
      
      setFormData(prev => ({ ...prev, description: enhancedDescription }))
    }
    
    // Apply priority
    setFormData(prev => ({ ...prev, priority: aiSuggestions.priority.level }))
    
    // Apply due date if suggested
    if (aiSuggestions.scheduling.suggestedDueDate) {
      setFormData(prev => ({ ...prev, dueDate: aiSuggestions.scheduling.suggestedDueDate }))
    }
    
    // Apply category if suggested
    if (aiSuggestions.category) {
      setFormData(prev => ({ ...prev, categoryId: aiSuggestions.category }))
    }
    
    setShowAIPanel(false)
    trackFeatureUsage('tasks', 'ai_apply_suggestions')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user) return
    
    setIsCreating(true)
    
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        categoryId: formData.categoryId || undefined,
        completed: false
      }
      
      await createDocument('tasks', generateId(), taskData)
      trackFeatureUsage('tasks', 'create_new_page')
      
      // Success - redirect to tasks page
      router.push('/tasks')
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-orange-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/tasks')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Button>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Task</h1>
          <p className="text-muted-foreground">Start organizing your work efficiently</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Task Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Task Title *
                </Label>
                <div className="relative">
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="What needs to be done?"
                    className={`glass border-glass pr-20 ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {formData.title.trim() && (
                    <Button
                      type="button"
                      onClick={handleAIEnhance}
                      disabled={isEnhancing}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-3 text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                      size="sm"
                    >
                      {isEnhancing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      AI Enhance
                    </Button>
                  )}
                </div>
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description (optional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Add more details about this task..."
                  rows={4}
                  className="glass border-glass resize-none"
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => updateField('priority', value)}
                >
                  <SelectTrigger className="glass border-glass">
                    <SelectValue>
                      <span className={getPriorityColor(formData.priority)}>
                        {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <span className="text-green-500">Low</span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="text-orange-500">Medium</span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="text-red-500">High</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date (optional)
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateField('dueDate', e.target.value)}
                  className={`glass border-glass ${errors.dueDate ? 'border-red-500' : ''}`}
                  min={getCurrentUserDate()}
                />
                {errors.dueDate && (
                  <p className="text-xs text-red-500">{errors.dueDate}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/tasks')}
                  className="flex-1 glass border-glass hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!formData.title.trim() || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* AI Enhancement Panel */}
          {showAIPanel && (
            <div className="lg:block hidden">
              <div 
                className="glass rounded-xl p-6 border-4 border-sky-400 space-y-6"
                style={{
                  background: `linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.08) 100%)`,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.06'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='0' cy='0' r='4'/%3E%3Ccircle cx='60' cy='0' r='4'/%3E%3Ccircle cx='0' cy='60' r='4'/%3E%3Ccircle cx='60' cy='60' r='4'/%3E%3Ccircle cx='30' cy='0' r='2'/%3E%3Ccircle cx='0' cy='30' r='2'/%3E%3Ccircle cx='60' cy='30' r='2'/%3E%3Ccircle cx='30' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.08) 100%)`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-medium text-primary">AI Enhancement</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAIPanel(false)}
                    className="h-6 w-6 p-0 hover:bg-white/10"
                  >
                    ×
                  </Button>
                </div>

                {isEnhancing ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Analyzing task...</span>
                  </div>
                ) : aiSuggestions ? (
                  <>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Based on: "{formData.title}"
                      </p>

                      {/* Priority Suggestion */}
                      {aiSuggestions.priority && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            🎯 Suggested Priority: <span className={getPriorityColor(aiSuggestions.priority.level)}>
                              {aiSuggestions.priority.level.toUpperCase()}
                            </span>
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {aiSuggestions.priority.reasoning}
                          </p>
                        </div>
                      )}

                      {/* Subtasks */}
                      {aiSuggestions.subtasks.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">📋 Suggested Subtasks:</h4>
                          <div className="space-y-1">
                            {aiSuggestions.subtasks.map((subtask, index) => (
                              <div key={index} className="text-xs text-muted-foreground">
                                • {subtask.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Success Tips */}
                      {aiSuggestions.strategies.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">💡 Success Tips:</h4>
                          <div className="space-y-1">
                            {aiSuggestions.strategies.map((tip, index) => (
                              <div key={index} className="text-xs text-muted-foreground">
                                • {tip}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={applyAISuggestions}
                      className="w-full"
                    >
                      Apply Suggestions
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}