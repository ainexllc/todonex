'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorPicker } from '@/components/ui/color-picker'
import { IconPicker } from '@/components/ui/icon-picker'
import type { TaskList } from '@/types/task'
import type { ListColorKey } from '@/lib/utils/list-colors'
import type { IconName } from '@/lib/utils/icon-matcher'

interface ListSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: TaskList
  onSave: (updates: { title?: string; color?: string; icon?: string }) => void
}

export function ListSettingsDialog({
  open,
  onOpenChange,
  list,
  onSave
}: ListSettingsDialogProps) {
  const [title, setTitle] = useState(list.title)
  const [color, setColor] = useState<ListColorKey>(list.color as ListColorKey || 'blue')
  const [icon, setIcon] = useState<IconName>(list.icon as IconName || 'List')

  const handleSave = () => {
    const updates: { title?: string; color?: string; icon?: string } = {}

    if (title !== list.title) {
      updates.title = title
    }

    if (color !== list.color) {
      updates.color = color
    }

    if (icon !== list.icon) {
      updates.icon = icon
    }

    if (Object.keys(updates).length > 0) {
      onSave(updates)
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>List Settings</DialogTitle>
          <DialogDescription>
            Customize your list's appearance and settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* List Name */}
          <div className="space-y-2">
            <Label htmlFor="list-name">List Name</Label>
            <Input
              id="list-name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter list name..."
              className="w-full"
            />
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <IconPicker
              listTitle={title}
              value={icon}
              onChange={setIcon}
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <ColorPicker
              value={color}
              onChange={setColor}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
