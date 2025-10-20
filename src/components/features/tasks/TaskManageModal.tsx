'use client'

import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { TagInput } from '@/components/ui/tag-input'
import type { Task, TaskPriority, TaskStatus } from '@/types/task'

interface TaskManageModalProps {
  open: boolean
  task: Task | null
  onClose: () => void
  onSubmit: (updates: Partial<Task>) => Promise<void> | void
  onRequestDelete: () => void
  isSaving?: boolean
}

const PRIORITY_OPTIONS: TaskPriority[] = ['low', 'medium', 'high']
const STATUS_OPTIONS: TaskStatus[] = ['today', 'upcoming', 'done']

const formatDateForInput = (date?: Date) => {
  if (!date) return ''
  const parsed = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function TaskManageModal({
  open,
  task,
  onClose,
  onSubmit,
  onRequestDelete,
  isSaving = false
}: TaskManageModalProps) {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [status, setStatus] = useState<TaskStatus>('upcoming')
  const [labels, setLabels] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (!task || !open) return
    setTitle(task.title ?? '')
    setDetails(task.description ?? task.note ?? '')
    setPriority(task.priority ?? 'medium')
    setStatus(task.status ?? 'upcoming')
    setLabels(task.categories ?? task.tags ?? [])
    setCompleted(Boolean(task.completed))
    setDueDate(formatDateForInput(task.dueDate))
  }, [task, open])

  const disableSave = useMemo(() => !title.trim() || isSaving, [title, isSaving])

  if (!task) return null

  const handleSave = async () => {
    if (!title.trim()) return

    const trimmedDetails = details.trim()
    const updates: Partial<Task> = {
      title: title.trim(),
      priority,
      status,
      completed,
      categories: labels,
      tags: labels,
      description: trimmedDetails || undefined,
      note: trimmedDetails || undefined
    }

    if (!dueDate) {
      updates.dueDate = undefined
    } else {
      const parsedDate = new Date(dueDate)
      if (!Number.isNaN(parsedDate.getTime())) {
        updates.dueDate = parsedDate
      }
    }

    if (completed !== task.completed) {
      updates.completedAt = completed ? new Date() : null
    }

    try {
      await onSubmit(updates)
    } catch (error) {
      console.error('Failed to update task', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="relative overflow-hidden border border-white/10 bg-[#050505]/95 px-0 py-0 text-gray-100 shadow-[0_25px_60px_rgba(249,115,22,0.25)] sm:max-w-[520px]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.28),_transparent_65%)] opacity-80" />
        <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(120deg,_rgba(255,115,35,0.18)_0%,_rgba(17,17,17,0.9)_45%,_rgba(6,6,6,1)_100%)]" />

        <div className="relative px-6 pt-6 pb-2 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-orange-200">
                Manual Control
              </span>
              <div>
                <DialogTitle className="text-2xl font-semibold text-white">
                  Edit task
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm leading-relaxed text-gray-400">
                  Tune the essentials and keep this list aligned with your launch rhythm.
                </DialogDescription>
              </div>
            </div>
            <div className="hidden rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3 text-orange-300 sm:flex">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="task-manage-title" className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">
                Task title
              </Label>
              <Input
                id="task-manage-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Name the work that needs to happen"
                autoFocus
                className="h-11 rounded-xl border border-white/15 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-orange-400 focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-manage-details" className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">
                Notes
              </Label>
              <Textarea
                id="task-manage-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Add supporting context, blockers, or acceptance criteria"
                className="min-h-[96px] rounded-xl border border-white/15 bg-white/8 text-sm text-gray-100 placeholder:text-white/40 focus-visible:border-orange-400 focus-visible:ring-0"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">
                  Priority
                </Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                  <SelectTrigger className="h-11 rounded-xl border border-white/15 bg-white/8 text-gray-100 focus:border-orange-400 focus:ring-0">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="border border-white/10 bg-[#050505]/95 text-gray-100">
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option} className="capitalize">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">
                  Due date
                </Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="h-11 rounded-xl border border-white/15 bg-white/8 text-gray-100 focus-visible:border-orange-400 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">
                  Status
                </Label>
                <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                  <SelectTrigger className="h-11 rounded-xl border border-white/15 bg-white/8 text-gray-100 focus:border-orange-400 focus:ring-0">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="border border-white/10 bg-[#050505]/95 text-gray-100">
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option} className="capitalize">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">
                    Completed
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Toggle when the work is finished
                  </p>
                </div>
                <Switch checked={completed} onCheckedChange={setCompleted} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-200">
                Labels
              </Label>
              <TagInput
                tags={labels}
                onChange={setLabels}
                placeholder="Add label and press enter"
                className="w-full rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-gray-100 focus-within:border-orange-400"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="relative flex flex-col gap-3 border-t border-white/10 bg-black/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            onClick={onRequestDelete}
            className="w-full justify-start rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:border-red-400 hover:bg-red-500/20 sm:w-auto"
            disabled={isSaving}
          >
            Delete task
          </Button>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 hover:bg-white/10"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={disableSave}
              className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
