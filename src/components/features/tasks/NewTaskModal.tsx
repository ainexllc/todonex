'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: any) => void
  activeListId?: string
}

export function NewTaskModal({ isOpen, onClose, onSubmit, activeListId }: NewTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    tags: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) return

    // Build clean task data
    const taskData: any = {
      title: formData.title.trim(),
      priority: formData.priority,
    }

    // Add optional fields if they have values
    if (formData.notes && formData.notes.trim()) {
      taskData.description = formData.notes.trim()
    }

    if (formData.dueDate) {
      taskData.dueDate = new Date(formData.dueDate)
    }

    if (formData.tags && formData.tags.trim()) {
      taskData.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    }

    if (activeListId) {
      taskData.listId = activeListId
    }

    onSubmit(taskData)

    // Reset form
    setFormData({
      title: '',
      notes: '',
      priority: 'medium',
      dueDate: '',
      tags: ''
    })
  }

  const handleClose = () => {
    // Reset form on close
    setFormData({
      title: '',
      notes: '',
      priority: 'medium',
      dueDate: '',
      tags: ''
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-xl mx-4">
        <div className="bg-card border-2 border-border rounded-2xl shadow-2xl backdrop-filter backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Add task</h2>
            <button
              onClick={handleClose}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-hover-bg transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {/* Title - col-span-2 */}
              <div className="col-span-2">
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Task title"
                  className="rounded-xl bg-card/50 border backdrop-filter backdrop-blur-sm"
                  required
                />
              </div>

              {/* Notes - col-span-2 */}
              <div className="col-span-2">
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes"
                  rows={3}
                  className="rounded-xl bg-card/50 border backdrop-filter backdrop-blur-sm resize-none"
                />
              </div>

              {/* Priority - col-span-1 */}
              <div className="col-span-1">
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') =>
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="rounded-xl bg-card/50 border backdrop-filter backdrop-blur-sm">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date - col-span-1 */}
              <div className="col-span-1">
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="rounded-xl bg-card/50 border backdrop-filter backdrop-blur-sm"
                />
              </div>

              {/* Tags - col-span-2 */}
              <div className="col-span-2">
                <Input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Tags (comma-separated)"
                  className="rounded-xl bg-card/50 border backdrop-filter backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={!formData.title.trim()}
              >
                Add task
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
