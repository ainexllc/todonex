'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarEvent } from '@/types'
import { useAuthStore } from '@/store/auth-store'
import { getAllCalendarEvents, deleteCalendarEvent } from '@/lib/firebase-data'
import { 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  List,
  Grid3X3
} from 'lucide-react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns'
import { cn } from '@/lib/utils'

interface CalendarViewProps {
  onNewEvent?: () => void
  onEditEvent?: (event: CalendarEvent) => void
  className?: string
}

type ViewMode = 'month' | 'list'

export function CalendarView({ onNewEvent, onEditEvent, className }: CalendarViewProps) {
  const { user } = useAuthStore()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  const loadEvents = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const userEvents = await getAllCalendarEvents(user.id)
      setEvents(userEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [user])

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await deleteCalendarEvent(eventId)
      setEvents(prev => prev.filter(event => event.id !== eventId))
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  // Generate calendar days
  const calendarDays = []
  let day = calendarStart
  while (day <= calendarEnd) {
    calendarDays.push(day)
    day = addDays(day, 1)
  }

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date))
  }

  // Get events for current month
  const currentMonthEvents = events.filter(event => 
    isSameMonth(event.start, currentDate)
  ).sort((a, b) => a.start.getTime() - b.start.getTime())

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Calendar</h1>
          <Badge variant="secondary">{events.length}</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="rounded-r-none border-r"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {onNewEvent && (
            <Button onClick={onNewEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>
      </div>

      {/* Month Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === 'month' ? (
            // Month View
            <div className="space-y-4">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDay(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isDayToday = isToday(day)

                  return (
                    <div
                      key={index}
                      className={cn(
                        "min-h-[100px] p-1 border rounded-lg",
                        !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                        isDayToday && "bg-primary/5 border-primary/20"
                      )}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1 text-center",
                        isDayToday && "text-primary font-bold"
                      )}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <button
                            key={event.id}
                            onClick={() => onEditEvent?.(event)}
                            className={cn(
                              "w-full text-left p-1 rounded text-xs font-medium truncate",
                              "hover:opacity-80 transition-opacity"
                            )}
                            style={{ 
                              backgroundColor: event.color || '#3b82f6',
                              color: 'white'
                            }}
                          >
                            {event.allDay ? event.title : `${format(event.start, 'h:mm a')} ${event.title}`}
                          </button>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {currentMonthEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">
                    No events in {format(currentDate, 'MMMM yyyy')}
                  </p>
                  {onNewEvent && (
                    <Button onClick={onNewEvent}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Event
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {currentMonthEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: event.color || '#3b82f6' }}
                              />
                              <h3 className="font-semibold">{event.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {event.category}
                              </Badge>
                            </div>
                            
                            {event.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {event.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {event.allDay 
                                    ? `${format(event.start, 'MMM d, yyyy')} (All day)`
                                    : `${format(event.start, 'MMM d, yyyy h:mm a')} - ${format(event.end, 'h:mm a')}`
                                  }
                                </span>
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-4">
                            {onEditEvent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditEvent(event)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}