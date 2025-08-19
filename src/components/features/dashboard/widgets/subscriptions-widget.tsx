'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Subscription } from '@/types'
import { useAuthStore } from '@/store/auth-store'
import { getAllSubscriptions } from '@/lib/firebase-data'
import { 
  BarChart3, 
  Plus, 
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { formatDistanceToNow, isWithinInterval, addDays } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SubscriptionsWidgetProps {
  size?: 'small' | 'medium' | 'large'
  settings?: Record<string, any>
}

const getCycleMultiplier = (cycle: string): number => {
  switch (cycle) {
    case 'monthly': return 1
    case 'quarterly': return 3
    case 'yearly': return 12
    default: return 1
  }
}

export function SubscriptionsWidget({ size = 'medium' }: SubscriptionsWidgetProps) {
  const { user } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadSubscriptions = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const userSubscriptions = await getAllSubscriptions(user.id)
      setSubscriptions(userSubscriptions.filter(sub => sub.isActive))
    } catch (error) {
      console.error('Error loading subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [user])

  // Calculate totals
  const monthlyTotal = subscriptions.reduce((total, sub) => {
    const multiplier = getCycleMultiplier(sub.billingCycle)
    return total + (sub.cost / multiplier)
  }, 0)

  // Find subscriptions expiring soon
  const oneWeekFromNow = addDays(new Date(), 7)
  const expiringSoon = subscriptions.filter(sub => {
    const nextBilling = new Date(sub.nextBilling)
    return isWithinInterval(nextBilling, { start: new Date(), end: oneWeekFromNow })
  })

  // Get next upcoming subscription
  const nextSubscription = subscriptions
    .sort((a, b) => new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime())[0]

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base font-medium text-gray-900">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <span>Subscriptions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
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
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span>Subscriptions</span>
            </CardTitle>
            <Link href="/subscriptions">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                <ArrowRight className="h-4 w-4 text-gray-600" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {subscriptions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-2">No subscriptions</p>
              <Link href="/subscriptions">
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add One
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Badge variant="secondary">{subscriptions.length} active</Badge>
                {expiringSoon.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {expiringSoon.length} due soon
                  </Badge>
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
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <span>Subscriptions</span>
            {subscriptions.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {subscriptions.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Link href="/subscriptions">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                <Plus className="h-4 w-4 text-gray-600" />
              </Button>
            </Link>
            {subscriptions.length > 0 && (
              <Link href="/subscriptions">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                  <ArrowRight className="h-4 w-4 text-gray-600" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {subscriptions.length === 0 ? (
          <div className="text-center py-6">
            <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Track your recurring subscriptions
            </p>
            <Link href="/subscriptions">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Subscription
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg border border-gray-100 bg-white">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">${monthlyTotal.toFixed(2)}</p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
              <div className="text-center p-3 rounded-lg border border-gray-100 bg-white">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">${(monthlyTotal * 12).toFixed(0)}</p>
                <p className="text-xs text-gray-500">per year</p>
              </div>
            </div>

            {/* Alerts */}
            {expiringSoon.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    {expiringSoon.length} subscription{expiringSoon.length !== 1 ? 's' : ''} due soon
                  </span>
                </div>
                <div className="space-y-1">
                  {expiringSoon.slice(0, 2).map((sub) => (
                    <div key={sub.id} className="text-xs text-red-600">
                      {sub.service} - {formatDistanceToNow(new Date(sub.nextBilling), { addSuffix: true })}
                    </div>
                  ))}
                  {expiringSoon.length > 2 && (
                    <div className="text-xs text-red-600">
                      +{expiringSoon.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Next Subscription */}
            {nextSubscription && (
              <div className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 hover:shadow-sm transition-all bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{nextSubscription.service}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {nextSubscription.category}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">${nextSubscription.cost}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Next: {formatDistanceToNow(new Date(nextSubscription.nextBilling), { addSuffix: true })}
                  </span>
                </div>
              </div>
            )}
            
            {/* View All Button */}
            <div className="pt-3 border-t border-gray-100">
              <Link href="/subscriptions">
                <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:bg-gray-100">
                  View All Subscriptions
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}