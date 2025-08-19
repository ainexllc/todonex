'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CalendarEvent } from '@/types'
import { useAuthStore } from '@/store/auth-store'
import { createCalendarEvent, updateCalendarEvent } from '@/lib/firebase-data'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventFormProps {
  event?: CalendarEvent
  onSaved?: (event: CalendarEvent) => void
  onCancel?: () => void
  className?: string
}

const eventCategories = [
  'Work',
  'Personal',
  'Family',
  'Health',
  'Travel',
  'Social',
  'Education',
  'Entertainment',
  'Other'
]

const reminderOptions = [
  { value: '0', label: 'At time of event' },
  { value: '5', label: '5 minutes before' },
  { value: '15', label: '15 minutes before' },
  { value: '30', label: '30 minutes before' },
  { value: '60', label: '1 hour before' },
  { value: '1440', label: '1 day before' },
  { value: '10080', label: '1 week before' }
]

export function EventForm({ event, onSaved, onCancel, className }: EventFormProps) {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  
  // Helper function to format datetime for input
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    start: event?.start ? formatDateTimeLocal(event.start) : '',
    end: event?.end ? formatDateTimeLocal(event.end) : '',
    allDay: event?.allDay ?? false,
    location: event?.location || '',
    category: event?.category || 'Personal',
    color: event?.color || '#3b82f6',
    attendees: event?.attendees?.join(', ') || '',
    reminderMinutes: '15'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.title || !formData.start) return

    setIsLoading(true)
    try {
      const startDate = new Date(formData.start)
      const endDate = formData.end ? new Date(formData.end) : new Date(startDate.getTime() + 60 * 60 * 1000) // Default 1 hour

      // Create reminders if specified
      const reminders = formData.reminderMinutes ? [{
        id: `reminder-${Date.now()}`,
        time: new Date(startDate.getTime() - parseInt(formData.reminderMinutes) * 60 * 1000),
        type: 'push' as const,
        sent: false
      }] : []

      const attendeesList = formData.attendees
        ? formData.attendees.split(',').map(email => email.trim()).filter(Boolean)
        : [user.id]

      const eventData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        start: startDate,
        end: endDate,
        allDay: formData.allDay,
        location: formData.location?.trim() || undefined,
        category: formData.category,
        color: formData.color,
        attendees: attendeesList,
        reminders,
        source: 'local' as const,
        familyId: user.familyId,
        recurring: undefined
      }

      let savedEvent: CalendarEvent
      if (event?.id) {
        savedEvent = await updateCalendarEvent(event.id, eventData)
      } else {
        savedEvent = await createCalendarEvent(eventData)
      }

      onSaved?.(savedEvent)
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartChange = (start: string) => {
    setFormData(prev => {
      const newData = { ...prev, start }
      
      // Auto-adjust end time if not set or if it's before start
      if (!prev.end || new Date(prev.end) <= new Date(start)) {
        const startDate = new Date(start)
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // Add 1 hour
        newData.end = formatDateTimeLocal(endDate)
      }
      
      return newData
    })
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>{event ? 'Edit Event' : 'Create Event'}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="Enter event title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Event description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="allDay"
                checked={formData.allDay}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allDay: checked }))}
              />
              <Label htmlFor="allDay">All day event</Label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start {formData.allDay ? 'Date' : 'Date & Time'} *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="start"
                    type={formData.allDay ? "date" : "datetime-local"}
                    value={formData.allDay ? formData.start.split('T')[0] : formData.start}
                    onChange={(e) => handleStartChange(formData.allDay ? `${e.target.value}T00:00` : e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">End {formData.allDay ? 'Date' : 'Date & Time'} *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="end"
                    type={formData.allDay ? "date" : "datetime-local"}
                    value={formData.allDay ? formData.end.split('T')[0] : formData.end}
                    onChange={(e) => setFormData(prev => ({ ...prev, end: formData.allDay ? `${e.target.value}T23:59` : e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Event location..."
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color and Reminder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="h-10 w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Reminder</Label>
              <Select value={formData.reminderMinutes} onValueChange={(value) => setFormData(prev => ({ ...prev, reminderMinutes: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No reminder</SelectItem>
                  {reminderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees (comma-separated emails)</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="attendees"
                placeholder="email1@example.com, email2@example.com"
                value={formData.attendees}
                onChange={(e) => setFormData(prev => ({ ...prev, attendees: e.target.value }))}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to create a personal event
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !formData.title || !formData.start}
            >
              {isLoading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}