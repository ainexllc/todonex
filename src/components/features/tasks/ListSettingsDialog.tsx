'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorPicker } from '@/components/ui/color-picker'
import { IconPicker } from '@/components/ui/icon-picker'
import { Trash2 } from 'lucide-react'
import type { TaskList } from '@/types/task'
import type { ListColorKey } from '@/lib/utils/list-colors'
import type { IconName } from '@/lib/utils/icon-matcher'

interface ListSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: TaskList
  onSave: (updates: { title?: string; color?: string; icon?: string }) => void
  onDelete?: (listId: string) => void
}

export function ListSettingsDialog({
  open,
  onOpenChange,
  list,
  onSave,
  onDelete
}: ListSettingsDialogProps) {
  const [title, setTitle] = useState(list.title)
  const [color, setColor] = useState<ListColorKey>(list.color as ListColorKey || 'blue')
  const [icon, setIcon] = useState<IconName>(list.icon as IconName || 'List')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Reset form state when dialog opens or list changes
  useEffect(() => {
    if (open) {
      setTitle(list.title)
      setColor(list.color as ListColorKey || 'blue')
      setIcon(list.icon as IconName || 'List')
    }
  }, [open, list.title, list.color, list.icon])

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

  const handleDelete = () => {
    if (onDelete) {
      onDelete(list.id)
      onOpenChange(false)
      setShowDeleteConfirm(false)
    }
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

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1">
            {onDelete && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete List
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete List?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{list.title}&quot;? This will permanently delete the list and all {list.tasks.length} task{list.tasks.length !== 1 ? 's' : ''} in it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete List
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
