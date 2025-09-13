'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, MapPin, Users, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  createDocument,
  updateDocument,
  deleteDocument,
  subscribeToUserDocuments,
  isOnline,
  onNetworkChange
} from '@/lib/firebase-data'
import { useAuthStore } from '@/store/auth-store'
import { useAdaptiveStore } from '@/store/adaptive-store'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  location?: string
  attendees?: string[]
  category: 'meeting' | 'deadline' | 'reminder' | 'personal' | 'work'
  completed: boolean
  familyId: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export default function EventsPage() {
  const { user } = useAuthStore()
  const { trackFeatureUsage } = useAdaptiveStore()
  
  const [events, setEvents] = useState<Event[]>([])
  const [online, setOnline] = useState(isOnline())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Track feature usage
  useEffect(() => {
    trackFeatureUsage('events', 'view')
  }, [trackFeatureUsage])

  // Subscribe to network changes
  useEffect(() => {
    const unsubscribe = onNetworkChange(setOnline)
    return unsubscribe
  }, [])

  // Subscribe to events
  useEffect(() => {
    if (!user) return
    
    const unsubscribe = subscribeToUserDocuments<Event>('events', (newEvents) => {
      setEvents(newEvents)
    }, 'startDate')
    
    return unsubscribe
  }, [user])

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = () => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate)
      return eventDate >= now && eventDate <= nextWeek && !event.completed
    })
  }

  // Get today's events
  const getTodaysEvents = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate)
      eventDate.setHours(0, 0, 0, 0)
      return eventDate.getTime() === today.getTime()
    })
  }

  const formatEventDate = (date: Date) => {
    const eventDate = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    
    if (eventDate.toDateString() === today.toDateString()) {
      return `Today at ${eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else {
      return eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meeting': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'deadline': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      case 'reminder': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
      case 'personal': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'work': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300'
    }
  }

  const todaysEvents = getTodaysEvents()
  const upcomingEvents = getUpcomingEvents()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Events
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your schedule and important dates
          </p>
        </div>
        <Button className="h-9">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          <Button
            variant={selectedCategory === 'meeting' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('meeting')}
          >
            Meetings
          </Button>
          <Button
            variant={selectedCategory === 'deadline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('deadline')}
          >
            Deadlines
          </Button>
          <Button
            variant={selectedCategory === 'reminder' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('reminder')}
          >
            Reminders
          </Button>
        </div>
      </div>

      {/* Today's Events */}
      {todaysEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Today's Events</h2>
          <div className="grid gap-4">
            {todaysEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatEventDate(event.startDate)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
          <div className="grid gap-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatEventDate(event.startDate)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Events */}
      {filteredEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">All Events</h2>
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatEventDate(event.startDate)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first event to get started'
            }
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      )}
    </div>
  )
}