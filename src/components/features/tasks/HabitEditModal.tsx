'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import type { HabitFrequency, HabitSettings, Task } from '@/types/task'

interface HabitEditModalProps {
  open: boolean
  task: Task | null
  onClose: () => void
  onSave: (updates: { habitSettings: HabitSettings; dueDate?: Date }) => void
}

const DEFAULT_SETTINGS: HabitSettings = {
  frequency: 'daily',
  streak: 0,
  bestStreak: 0,
  totalCompletions: 0,
  lastCompletion: null
}

export function HabitEditModal({ open, task, onClose, onSave }: HabitEditModalProps) {
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [intervalDays, setIntervalDays] = useState<number>(2)
  const [streak, setStreak] = useState<number>(0)
  const [bestStreak, setBestStreak] = useState<number>(0)
  const [totalCompletions, setTotalCompletions] = useState<number>(0)
  const [lastCompletion, setLastCompletion] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')

  useEffect(() => {
    if (!task) return

    const settings = task.habitSettings ?? DEFAULT_SETTINGS
    setFrequency(settings.frequency ?? 'daily')
    setIntervalDays(settings.intervalDays ?? 2)
    setStreak(settings.streak ?? 0)
    setBestStreak(settings.bestStreak ?? 0)
    setTotalCompletions(settings.totalCompletions ?? 0)
    setLastCompletion(
      settings.lastCompletion ? format(new Date(settings.lastCompletion), 'yyyy-MM-dd') : ''
    )
    setDueDate(task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '')
  }, [task, open])

  if (!task) return null

  const handleSave = () => {
    const habitSettings: HabitSettings = {
      frequency,
      streak: Math.max(streak, 0),
      bestStreak: Math.max(bestStreak, 0),
      totalCompletions: Math.max(totalCompletions, 0),
      lastCompletion: lastCompletion ? new Date(lastCompletion) : null
    }

    if (frequency === 'custom') {
      habitSettings.intervalDays = Math.max(intervalDays, 1)
    }

    const updates: { habitSettings: HabitSettings; dueDate?: Date } = { habitSettings }

    if (dueDate) {
      const parsedDue = new Date(dueDate)
      if (!isNaN(parsedDue.getTime())) {
        updates.dueDate = parsedDue
      }
    }

    onSave(updates)
  }

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : onClose())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Adjust the cadence and progress stats for <strong>{task.title}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Repeat cadence</Label>
            <Select value={frequency} onValueChange={(value: HabitFrequency) => setFrequency(value)}>
              <SelectTrigger className="glass border-glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Every X Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'custom' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Repeat every</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={intervalDays}
                  onChange={(event) => setIntervalDays(Number(event.target.value) || 1)}
                  className="glass border-glass w-24"
                />
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current streak</Label>
              <Input
                type="number"
                min={0}
                value={streak}
                onChange={(event) => setStreak(Math.max(Number(event.target.value) || 0, 0))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Best streak</Label>
              <Input
                type="number"
                min={0}
                value={bestStreak}
                onChange={(event) => setBestStreak(Math.max(Number(event.target.value) || 0, 0))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total completions</Label>
              <Input
                type="number"
                min={0}
                value={totalCompletions}
                onChange={(event) =>
                  setTotalCompletions(Math.max(Number(event.target.value) || 0, 0))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Last completion</Label>
              <Input
                type="date"
                value={lastCompletion}
                onChange={(event) => setLastCompletion(event.target.value)}
                className="glass border-glass"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to clear the last completion date.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Next due date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="glass border-glass"
            />
            <p className="text-xs text-muted-foreground">
              Updating the due date overrides the automatic schedule until the next completion.
            </p>
          </div>

          <p className="rounded-lg border border-dashed border-border/60 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
            Changes apply immediately across Board and List views for this habit.
          </p>
        </div>

        <DialogFooter className="flex items-center justify-between gap-3 pt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
