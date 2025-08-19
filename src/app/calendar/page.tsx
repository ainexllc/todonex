'use client'

import { useState } from 'react'
import { CalendarView } from '@/components/features/calendar/calendar-view'
import { EventForm } from '@/components/features/calendar/event-form'
import { CalendarEvent } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export default function CalendarPage() {
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleNewEvent = () => {
    setEditingEvent(undefined)
    setIsDialogOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setIsDialogOpen(true)
  }

  const handleEventSaved = () => {
    setIsDialogOpen(false)
    setEditingEvent(undefined)
    // The calendar view will automatically refresh
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingEvent(undefined)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <CalendarView 
        onNewEvent={handleNewEvent}
        onEditEvent={handleEditEvent}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <EventForm
            event={editingEvent}
            onSaved={handleEventSaved}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}