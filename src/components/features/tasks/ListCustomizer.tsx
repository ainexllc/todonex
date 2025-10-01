'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ColorPicker } from '@/components/ui/color-picker'
import { IconPicker } from '@/components/ui/icon-picker'
import { cn } from '@/lib/utils'
import { getIconComponent } from '@/lib/utils/icon-matcher'
import { getListColor } from '@/lib/utils/list-colors'
import type { TaskList } from '@/types/task'
import type { IconName } from '@/lib/utils/icon-matcher'
import type { ListColorKey } from '@/lib/utils/list-colors'

interface ListCustomizerProps {
  taskList: TaskList
  isOpen: boolean
  onClose: () => void
  onSave: (updates: Partial<TaskList>) => void
  className?: string
}

export function ListCustomizer({
  taskList,
  isOpen,
  onClose,
  onSave,
  className
}: ListCustomizerProps) {
  const [title, setTitle] = useState(taskList.title)
  const [icon, setIcon] = useState<IconName>(taskList.icon || 'List')
  const [color, setColor] = useState<ListColorKey>(taskList.color || 'blue')

  // Reset state when taskList changes
  useEffect(() => {
    setTitle(taskList.title)
    setIcon(taskList.icon || 'List')
    setColor(taskList.color || 'blue')
  }, [taskList])

  const handleSave = () => {
    onSave({
      title: title.trim() || taskList.title,
      icon,
      color
    })
    onClose()
  }

  const handleCancel = () => {
    // Reset to original values
    setTitle(taskList.title)
    setIcon(taskList.icon || 'List')
    setColor(taskList.color || 'blue')
    onClose()
  }

  if (!isOpen) return null

  // Get components for preview
  const IconComponent = getIconComponent(icon)
  const colorTheme = getListColor(color)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
          'bg-gray-900 border border-gray-700 rounded-lg shadow-2xl',
          'w-[90vw] max-w-lg max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Customize List</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-300">Preview</label>
            <div
              className={cn(
                'border-2 rounded-lg p-3 flex items-center gap-3',
                colorTheme.bg,
                colorTheme.border
              )}
            >
              {IconComponent && (
                <IconComponent className={cn('h-5 w-5', colorTheme.text)} />
              )}
              <span className={cn('font-medium text-sm', colorTheme.text)}>
                {title || taskList.title}
              </span>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-300">List Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter list title..."
              className="h-9 text-sm"
            />
          </div>

          {/* Icon Picker */}
          <IconPicker
            listTitle={title || taskList.title}
            value={icon}
            onChange={setIcon}
          />

          {/* Color Picker */}
          <ColorPicker
            value={color}
            onChange={setColor}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 px-4 py-3 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="h-8 text-xs"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </>
  )
}
