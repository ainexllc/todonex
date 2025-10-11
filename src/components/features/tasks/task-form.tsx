'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Flag, Sparkles, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { TaskEnhancementCard } from '@/components/ai/task-enhancement-card'
import { TaskEnhancement, EnhancedTaskData } from '@/types/ai'
import { parseNaturalLanguage, formatDateForInput } from '@/lib/ai/natural-language-parser'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  categoryId?: string
  subtasks?: Subtask[]
  // Recurring task fields
  isRecurring?: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'custom'
  recurringInterval?: number
  recurringEndDate?: Date
}

interface TaskFormProps {
  task?: Task | null
  onSubmit: (taskData: any) => void
  onClose: () => void
}

export function TaskForm({ task, onSubmit, onClose }: TaskFormProps) {
  // Get current user's local date
  const getCurrentUserDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    categoryId: '',
    subtasks: [] as Subtask[],
    // Recurring task fields
    isRecurring: false,
    recurringPattern: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    recurringInterval: 1,
    recurringEndDate: '',
    // AI Enhancement fields
    aiEnhanced: false,
    aiEnhancedTitle: '',
    aiEnhancedDescription: '',
    aiEstimatedDuration: '',
    aiTips: [] as string[],
    aiSubtasks: [] as string[],
    aiDependencies: [] as string[],
    aiCategory: '',
    // Extracted from natural language
    extractedTime: '',
    extractedLocation: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [aiEnhancement, setAiEnhancement] = useState<TaskEnhancement | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [rewordLoading, setRewordLoading] = useState(false)
  const [rewordError, setRewordError] = useState<string | null>(null)

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        categoryId: task.categoryId || '',
        subtasks: task.subtasks || [],
        // Recurring task fields
        isRecurring: task.isRecurring || false,
        recurringPattern: task.recurringPattern || 'daily',
        recurringInterval: task.recurringInterval || 1,
        recurringEndDate: task.recurringEndDate ? new Date(task.recurringEndDate).toISOString().split('T')[0] : '',
        // AI Enhancement fields
        aiEnhanced: false,
        aiEnhancedTitle: '',
        aiEnhancedDescription: '',
        aiEstimatedDuration: '',
        aiTips: [] as string[],
        aiSubtasks: [] as string[],
        aiDependencies: [] as string[],
        aiCategory: '',
        // Extracted from natural language
        extractedTime: '',
        extractedLocation: ''
      })
    }
  }, [task])

  // Subtask management functions
  const addSubtask = () => {
    const newSubtask: Subtask = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      title: '',
      completed: false
    }
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, newSubtask]
    }))
  }

  const updateSubtask = (subtaskId: string, title: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(subtask =>
        subtask.id === subtaskId ? { ...subtask, title } : subtask
      )
    }))
  }

  const removeSubtask = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(subtask => subtask.id !== subtaskId)
    }))
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Build clean task data without undefined values
    const taskData: any = {
      title: formData.title.trim(),
      priority: formData.priority,
    }

    // Only add optional fields if they have valid values
    if (formData.description && formData.description.trim()) {
      taskData.description = formData.description.trim()
    }
    
    if (formData.dueDate) {
      taskData.dueDate = new Date(formData.dueDate)
    }
    
    if (formData.categoryId && formData.categoryId.trim()) {
      taskData.categoryId = formData.categoryId.trim()
    }
    
    // Only add subtasks if there are valid ones
    const validSubtasks = formData.subtasks.filter(subtask => subtask.title.trim() !== '')
    if (validSubtasks.length > 0) {
      taskData.subtasks = validSubtasks
    }
    
    // Add recurring task fields if enabled
    if (formData.isRecurring) {
      taskData.isRecurring = true
      taskData.recurringPattern = formData.recurringPattern
      
      if (formData.recurringInterval && formData.recurringInterval > 0) {
        taskData.recurringInterval = formData.recurringInterval
      }
      
      if (formData.recurringEndDate) {
        taskData.recurringEndDate = new Date(formData.recurringEndDate)
      }
    }
    
    onSubmit(taskData)
  }

  const updateField = (field: string, value: any) => {
    // First update the field value immediately - don't interfere with user typing
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Parse natural language for the title field (but don't override the title!)
    if (field === 'title' && typeof value === 'string') {
      const parsed = parseNaturalLanguage(value)
      
      // Only auto-fill OTHER fields, never replace the title while user is typing
      const updates: any = {}
      
      // Auto-fill extracted data to other fields only
      if (parsed.extractedDueDate && !formData.dueDate) {
        updates.dueDate = formatDateForInput(parsed.extractedDueDate)
      }
      
      if (parsed.extractedPriority && parsed.extractedPriority !== formData.priority) {
        updates.priority = parsed.extractedPriority
      }
      
      if (parsed.extractedTime) {
        updates.extractedTime = parsed.extractedTime
      }
      
      if (parsed.extractedLocation) {
        updates.extractedLocation = parsed.extractedLocation
      }
      
      if (parsed.extractedDuration) {
        updates.aiEstimatedDuration = parsed.extractedDuration
      }
      
      // Only update if we have other fields to update (not the title itself)
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({ ...prev, ...updates }))
      }
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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

  // Generate enhanced title suggestions
  const generateEnhancedTitle = (title: string): string => {
    const lowerTitle = title.toLowerCase().trim()
    
    // Add action words if missing
    if (!lowerTitle.match(/^(create|build|write|plan|organize|schedule|review|update|fix|implement|design|research|analyze|complete|finish|setup|install|configure|develop|test|deploy)/)) {
      if (lowerTitle.includes('meeting')) return `Schedule ${title}`
      if (lowerTitle.includes('document') || lowerTitle.includes('report')) return `Write ${title}`
      if (lowerTitle.includes('project') || lowerTitle.includes('campaign')) return `Plan ${title}`
      if (lowerTitle.includes('system') || lowerTitle.includes('setup')) return `Configure ${title}`
      if (lowerTitle.includes('bug') || lowerTitle.includes('issue')) return `Fix ${title}`
      if (lowerTitle.includes('feature')) return `Implement ${title}`
      if (lowerTitle.includes('research') || lowerTitle.includes('analysis')) return `Research ${title}`
      return `Complete ${title}`
    }
    
    return title
  }

  // Generate enhanced descriptions
  const generateEnhancedDescription = (title: string, existingDescription?: string): string => {
    if (existingDescription && existingDescription.trim()) {
      return existingDescription
    }
    
    const lowerTitle = title.toLowerCase()
    const parsed = parseNaturalLanguage(title)
    
    let baseDescription = ''
    
    if (lowerTitle.includes('meeting')) {
      baseDescription = `Organize and conduct a meeting to discuss key objectives, align on priorities, and establish clear action items with all stakeholders.`
    } else if (lowerTitle.includes('document') || lowerTitle.includes('report')) {
      baseDescription = `Create comprehensive documentation that covers all necessary details, follows established guidelines, and provides clear value to stakeholders.`
    } else if (lowerTitle.includes('project') || lowerTitle.includes('campaign')) {
      baseDescription = `Develop a detailed project plan with clear milestones, resource allocation, timeline management, and success metrics to ensure successful delivery.`
    } else if (lowerTitle.includes('research') || lowerTitle.includes('analysis')) {
      baseDescription = `Conduct thorough research and analysis to gather insights, identify patterns, and provide data-driven recommendations for informed decision-making.`
    } else if (lowerTitle.includes('implementation') || lowerTitle.includes('develop')) {
      baseDescription = `Design and implement a robust solution that meets requirements, follows best practices, and delivers measurable value to users.`
    } else if (lowerTitle.includes('review') || lowerTitle.includes('audit')) {
      baseDescription = `Perform a comprehensive review to assess current state, identify opportunities for improvement, and recommend actionable next steps.`
    } else {
      baseDescription = `Execute this task with careful planning and attention to detail, ensuring high-quality results and alignment with overall objectives.`
    }
    
    // Add time context if available
    if (parsed.extractedTime) {
      baseDescription += ` Scheduled for ${parsed.extractedTime}.`
    }
    
    // Add location context if available
    if (parsed.extractedLocation) {
      baseDescription += ` Location: ${parsed.extractedLocation}.`
    }
    
    return baseDescription
  }

  const handleAIEnhance = async () => {
    if (!formData.title.trim()) {
      return
    }

    setAiError(null)
    setAiLoading(true)
    
    try {
      // Parse the title to get additional context
      const parsed = parseNaturalLanguage(formData.title)
      
      // Mock AI enhancement with intelligent suggestions based on title
      const cleanTitle = parsed.cleanedTitle || formData.title
      const enhancedTitle = generateEnhancedTitle(cleanTitle)
      const enhancedDescription = generateEnhancedDescription(cleanTitle, formData.description)
      
      const mockEnhancement: TaskEnhancement = {
        description: enhancedDescription,
        priority: parsed.extractedPriority || formData.priority,
        estimatedDuration: parsed.extractedDuration || (formData.aiEstimatedDuration || '30 minutes'),
        tips: [
          'Break this task into smaller, manageable steps',
          'Set up your environment before starting',
          'Focus on one aspect at a time',
          'Review your progress regularly'
        ],
        subtasks: generateSmartSubtasks(cleanTitle),
        dependencies: [],
        category: 'productivity',
        // Include extracted data
        extractedDueDate: parsed.extractedDueDate,
        extractedTime: parsed.extractedTime,
        extractedPriority: parsed.extractedPriority,
        extractedDuration: parsed.extractedDuration,
        extractedLocation: parsed.extractedLocation
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setAiEnhancement(mockEnhancement)
    } catch (error) {
      void error
      setAiError('Failed to enhance task. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }
  
  // Generate smart subtasks based on task title
  const generateSmartSubtasks = (title: string): string[] => {
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('plan') || lowerTitle.includes('organize')) {
      return [
        'Research and gather requirements',
        'Create detailed outline or plan',
        'Identify necessary resources',
        'Set timeline and milestones'
      ]
    } else if (lowerTitle.includes('meeting') || lowerTitle.includes('call')) {
      return [
        'Prepare agenda and materials',
        'Set meeting agenda',
        'Conduct meeting/call',
        'Follow up with action items'
      ]
    } else if (lowerTitle.includes('write') || lowerTitle.includes('document')) {
      return [
        'Research and gather information',
        'Create first draft',
        'Review and edit content',
        'Finalize and publish'
      ]
    } else if (lowerTitle.includes('buy') || lowerTitle.includes('purchase')) {
      return [
        'Research options and compare prices',
        'Check reviews and ratings',
        'Make purchase decision',
        'Complete transaction'
      ]
    } else {
      return [
        'Research and gather requirements',
        'Create initial plan or outline',
        'Execute main task components',
        'Review and finalize output'
      ]
    }
  }

  const applyAIEnhancement = (enhancement: TaskEnhancement) => {
    // Parse the current title to get cleaned version
    const parsed = parseNaturalLanguage(formData.title)
    const enhancedTitle = generateEnhancedTitle(parsed.cleanedTitle || formData.title)
    const enhancedDescription = generateEnhancedDescription(formData.title, formData.description)
    
    const updates: any = {
      aiEnhanced: true,
      // UPDATE the actual form fields with enhanced content
      title: enhancedTitle,
      description: enhancedDescription,
      // Save all AI enhancement data for display
      aiEnhancedTitle: enhancedTitle,
      aiEnhancedDescription: enhancedDescription,
      aiEstimatedDuration: enhancement.estimatedDuration || '',
      aiTips: enhancement.tips || [],
      aiSubtasks: enhancement.subtasks || [],
      aiDependencies: enhancement.dependencies || [],
      aiCategory: enhancement.category || ''
    }
    
    // Apply extracted data from natural language
    if (enhancement.extractedDueDate && !formData.dueDate) {
      updates.dueDate = formatDateForInput(enhancement.extractedDueDate)
    }
    
    if (enhancement.extractedTime) {
      updates.extractedTime = enhancement.extractedTime
    }
    
    if (enhancement.extractedLocation) {
      updates.extractedLocation = enhancement.extractedLocation
    }
    
    if (enhancement.extractedPriority && enhancement.extractedPriority !== formData.priority) {
      updates.priority = enhancement.extractedPriority
    }
    
    setFormData(prev => ({ ...prev, ...updates }))

    // Close the enhancement card
    setAiEnhancement(null)
  }

  const handleAIReword = async () => {
    if (!formData.title.trim()) {
      setRewordError('Please enter a task title first')
      return
    }

    setRewordError(null)
    setRewordLoading(true)
    
    try {
      // Prepare subtasks for API call
      const validSubtasks = formData.subtasks
        .filter(subtask => subtask.title.trim() !== '')
        .map(subtask => subtask.title.trim())

      const response = await fetch('/api/ai/tasks/reword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          subtasks: validSubtasks.length > 0 ? validSubtasks : undefined,
          context: {
            priority: formData.priority,
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reword task')
      }

      const rewordedData = await response.json()
      
      // Update form fields with reworded content
      const updates: any = {
        title: rewordedData.title,
      }

      if (rewordedData.description && rewordedData.description.trim()) {
        updates.description = rewordedData.description
      }

      // Update subtasks if reworded versions were provided
      if (rewordedData.subtasks && rewordedData.subtasks.length > 0) {
        const rewordedSubtasks = rewordedData.subtasks.map((title: string, index: number) => {
          const existingSubtask = formData.subtasks[index]
          return {
            id: existingSubtask?.id || Math.random().toString(36).substring(2) + Date.now().toString(36),
            title,
            completed: existingSubtask?.completed || false
          }
        })
        updates.subtasks = rewordedSubtasks
      }

      setFormData(prev => ({ ...prev, ...updates }))
      
    } catch (error) {
      setRewordError(error instanceof Error ? error.message : 'Failed to reword task. Please try again.')
    } finally {
      setRewordLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto border border-border shadow-xl task-form-modal"
      >
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="flex items-center justify-between text-lg font-semibold">
            {task ? task.title : 'Create New Task'}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-muted-foreground">
              Task Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="What needs to be done?"
              className={`border-0 bg-muted/30 text-base px-3 py-2 focus-visible:ring-1 focus-visible:ring-primary ${errors.title ? 'ring-1 ring-red-500' : ''}`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* AI Enhancement Card */}
          {aiEnhancement && (
            <TaskEnhancementCard
              enhancement={aiEnhancement}
              onApply={applyAIEnhancement}
              onClose={() => setAiEnhancement(null)}
              cached={false}
              responseTime={1500}
            />
          )}


          {/* AI Reword Error Messages */}
          {rewordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {rewordError}
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-muted-foreground">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="border-0 bg-muted/30 resize-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* AI Reword Button */}
          <div className="flex justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAIReword}
              disabled={rewordLoading || !formData.title.trim()}
              className="flex items-center gap-2 text-xs bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {rewordLoading ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  Rewording...
                </>
              ) : (
                <>
                  ✍️ AI Reword
                </>
              )}
            </Button>
          </div>

          {/* Subtasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Subtasks (Optional)
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSubtask}
                className="h-8 px-3 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Subtask
              </Button>
            </div>
            
            {formData.subtasks.length > 0 && (
              <div className="space-y-2">
                {formData.subtasks.map((subtask, index) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <Input
                      value={subtask.title}
                      onChange={(e) => updateSubtask(subtask.id, e.target.value)}
                      placeholder="Enter subtask..."
                      className="flex-1 glass border-glass text-sm h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubtask(subtask.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {formData.subtasks.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Break down your task into smaller, manageable steps
              </p>
            )}
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
              Due Date
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

          {/* Recurring Task Section */}
          <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Task Frequency</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="isRecurring"
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => updateField('isRecurring', e.target.checked)}
                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <Label htmlFor="isRecurring" className="text-sm cursor-pointer">
                  Make this a recurring task
                </Label>
              </div>
            </div>

            {!formData.isRecurring && (
              <p className="text-xs text-muted-foreground">
                This is a one-time task that will be completed once.
              </p>
            )}

            {formData.isRecurring && (
              <div className="space-y-3 pt-2 border-t border-border/50">
                {/* Recurrence Pattern */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Repeat Pattern</Label>
                  <Select
                    value={formData.recurringPattern}
                    onValueChange={(value) => updateField('recurringPattern', value)}
                  >
                    <SelectTrigger className="glass border-glass">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Interval */}
                {formData.recurringPattern === 'custom' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Repeat Every</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.recurringInterval}
                        onChange={(e) => updateField('recurringInterval', parseInt(e.target.value) || 1)}
                        className="glass border-glass w-20"
                      />
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </div>
                )}

                {/* End Date (Optional) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.recurringEndDate}
                    onChange={(e) => updateField('recurringEndDate', e.target.value)}
                    className="glass border-glass"
                    min={getCurrentUserDate()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to repeat indefinitely
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Time (if extracted) */}
          {formData.extractedTime && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                🕐 Extracted Time
              </Label>
              <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-primary font-medium">{formData.extractedTime}</p>
                <p className="text-xs text-muted-foreground">Time extracted from task description</p>
              </div>
            </div>
          )}

          {/* AI Enhancement Fields */}
          {formData.aiEnhanced && (
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-primary">
                  AI Enhancement Details
                </h3>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  Enhanced
                </span>
              </div>
              
              {/* Enhanced Title */}
              {formData.aiEnhancedTitle && formData.aiEnhancedTitle !== formData.title && (
                <div className="mb-3">
                  <Label className="text-sm font-medium text-primary">
                    📝 Enhanced Title
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted/50 rounded-md">
                    {formData.aiEnhancedTitle}
                  </p>
                </div>
              )}

              {/* Enhanced Description */}
              {formData.aiEnhancedDescription && (
                <div className="mb-3">
                  <Label className="text-sm font-medium text-primary">
                    📋 Enhanced Description
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted/50 rounded-md">
                    {formData.aiEnhancedDescription}
                  </p>
                </div>
              )}
              
              {/* Estimated Duration */}
              {formData.aiEstimatedDuration && (
                <div className="mb-3">
                  <Label className="text-sm font-medium text-primary">
                    ⏱️ Estimated Duration
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.aiEstimatedDuration}
                  </p>
                </div>
              )}

              {/* Subtasks */}
              {formData.aiSubtasks.length > 0 && (
                <div className="mb-3">
                  <Label className="text-sm font-medium text-primary">
                    ✅ Suggested Subtasks
                  </Label>
                  <div className="space-y-1 mt-2">
                    {formData.aiSubtasks.map((subtask, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1 h-1 rounded-full bg-primary"></span>
                        {subtask}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 bg-primary hover:bg-primary/90"
              disabled={!formData.title.trim()}
            >
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
