'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarEvent } from '@/types'
import { useAuthStore } from '@/store/auth-store'
import { getTodaysEvents, getUpcomingEvents } from '@/lib/firebase-data'
import { 
  Calendar, 
  Plus, 
  Clock,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { formatDistanceToNow, format, startOfDay, addDays, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface CalendarWidgetProps {
  size?: 'small' | 'medium' | 'large'
  settings?: Record<string, any>
}

export function CalendarWidget({ size = 'medium' }: CalendarWidgetProps) {
  const { user } = useAuthStore()
  const [todaysEvents, setTodaysEvents] = useState<CalendarEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  const loadEvents = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const [todayEvents, upcoming] = await Promise.all([
        getTodaysEvents(user.id),
        getUpcomingEvents(user.id, 7)
      ])
      
      setTodaysEvents(todayEvents)
      setUpcomingEvents(upcoming.filter(event => !isSameDay(event.start, new Date())))
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [user])

  const nextUpcoming = upcomingEvents[0]

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base font-medium text-gray-900">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>Calendar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (size === 'small') {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-base font-medium text-gray-900">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>Today</span>
            </CardTitle>
            <Link href="/calendar">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                <ArrowRight className="h-4 w-4 text-gray-600" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {todaysEvents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-3">No events today</p>
              <Link href="/calendar">
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{todaysEvents.length}</span>
                <span className="text-sm text-gray-500">events</span>
              </div>
              <div className="space-y-2">
                {todaysEvents.slice(0, 2).map((event) => (
                  <div key={event.id} className="text-xs p-2 border border-gray-100 rounded-lg bg-white">
                    <div className="font-medium truncate text-gray-900">{event.title}</div>
                    <div className="text-gray-500 mt-1">
                      {event.allDay ? 'All day' : format(event.start, 'h:mm a')}
                    </div>
                  </div>
                ))}
                {todaysEvents.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{todaysEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-base font-medium text-gray-900">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>Calendar</span>
            {(todaysEvents.length + upcomingEvents.length) > 0 && (
              <Badge variant="secondary" className="text-xs">
                {todaysEvents.length + upcomingEvents.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Link href="/calendar">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                <Plus className="h-4 w-4 text-gray-600" />
              </Button>
            </Link>
            <Link href="/calendar">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                <ArrowRight className="h-4 w-4 text-gray-600" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {todaysEvents.length === 0 && upcomingEvents.length === 0 ? (
          <div className="text-center py-6">
            <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              No upcoming events
            </p>
            <Link href="/calendar">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Today's Events */}
            {todaysEvents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center space-x-2 text-gray-900">
                  <span>Today</span>
                  <Badge variant="secondary" className="text-xs">
                    {todaysEvents.length}
                  </Badge>
                </h4>
                <div className="space-y-3">
                  {todaysEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 hover:shadow-sm transition-all bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium truncate text-gray-900">{event.title}</h5>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                            {!event.allDay && (
                              <>
                                <Clock className="h-3 w-3" />
                                <span>{format(event.start, 'h:mm a')}</span>
                              </>
                            )}
                            {event.allDay && <span>All day</span>}
                            {event.location && (
                              <>
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{event.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div 
                          className="w-2 h-2 rounded-full ml-2 flex-shrink-0"
                          style={{ backgroundColor: event.color || '#3b82f6' }}
                        />
                      </div>
                    </div>
                  ))}
                  {todaysEvents.length > 3 && (
                    <div className="text-center">
                      <Link href="/calendar">
                        <Button variant="outline" size="sm">
                          View {todaysEvents.length - 3} more
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Next Upcoming Event */}
            {nextUpcoming && (
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-900">
                  Next Up
                </h4>
                <div className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 hover:shadow-sm transition-all bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium truncate text-gray-900">{nextUpcoming.title}</h5>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(nextUpcoming.start, { addSuffix: true })}
                        </span>
                        {!nextUpcoming.allDay && (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>{format(nextUpcoming.start, 'MMM d, h:mm a')}</span>
                          </>
                        )}
                      </div>
                      {nextUpcoming.location && (
                        <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{nextUpcoming.location}</span>
                        </div>
                      )}
                    </div>
                    <div 
                      className="w-2 h-2 rounded-full ml-2 flex-shrink-0"
                      style={{ backgroundColor: nextUpcoming.color || '#3b82f6' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* View All Button */}
            {(todaysEvents.length > 0 || upcomingEvents.length > 0) && (
              <div className="pt-2 border-t border-gray-100">
                <Link href="/calendar">
                  <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:bg-gray-100">
                    View All Events
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}