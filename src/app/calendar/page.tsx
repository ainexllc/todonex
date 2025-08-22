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
    <div 
      className="max-w-[50rem] px-5 pt-20 @sm:pt-18 mx-auto w-full flex flex-col h-full pb-4 transition-all duration-300" 
      style={{ maskImage: 'linear-gradient(black 85%, transparent 100%)' }}
    >
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