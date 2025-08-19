'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Subscription } from '@/types'
import { useAuthStore } from '@/store/auth-store'
import { getAllSubscriptions, deleteSubscription } from '@/lib/firebase-data'
import { 
  BarChart3, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  DollarSign,
  Calendar,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDistanceToNow, isWithinInterval, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface SubscriptionsListProps {
  onNewSubscription?: () => void
  onEditSubscription?: (subscription: Subscription) => void
  className?: string
}

const getCycleMultiplier = (cycle: string): number => {
  switch (cycle) {
    case 'monthly': return 1
    case 'quarterly': return 3
    case 'yearly': return 12
    default: return 1
  }
}

const getBillingCycleText = (cycle: string): string => {
  switch (cycle) {
    case 'monthly': return 'month'
    case 'quarterly': return 'quarter'
    case 'yearly': return 'year'
    default: return cycle
  }
}

export function SubscriptionsList({ onNewSubscription, onEditSubscription, className }: SubscriptionsListProps) {
  const { user } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)

  const loadSubscriptions = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const userSubscriptions = await getAllSubscriptions(user.id)
      setSubscriptions(userSubscriptions)
    } catch (error) {
      console.error('Error loading subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [user])

  // Filter subscriptions
  useEffect(() => {
    let filtered = subscriptions

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(sub => 
        sub.service.toLowerCase().includes(query) ||
        sub.category.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(sub => sub.category === selectedCategory)
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(sub => sub.isActive)
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(sub => !sub.isActive)
      } else if (statusFilter === 'expiring-soon') {
        const oneWeekFromNow = addDays(new Date(), 7)
        filtered = filtered.filter(sub => {
          const nextBilling = new Date(sub.nextBilling)
          return isWithinInterval(nextBilling, { start: new Date(), end: oneWeekFromNow }) && sub.isActive
        })
      }
    }

    // Show/hide inactive
    if (!showInactive) {
      filtered = filtered.filter(sub => sub.isActive)
    }

    // Sort by next billing date
    filtered = filtered.sort((a, b) => {
      if (!a.isActive && b.isActive) return 1
      if (a.isActive && !b.isActive) return -1
      return new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime()
    })

    setFilteredSubscriptions(filtered)
  }, [subscriptions, searchQuery, selectedCategory, statusFilter, showInactive])

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return

    try {
      await deleteSubscription(subscriptionId)
      setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId))
    } catch (error) {
      console.error('Error deleting subscription:', error)
    }
  }

  const allCategories = Array.from(new Set(subscriptions.map(sub => sub.category).filter(Boolean)))

  // Calculate totals
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive)
  const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
    const multiplier = getCycleMultiplier(sub.billingCycle)
    return total + (sub.cost / multiplier)
  }, 0)
  const yearlyTotal = monthlyTotal * 12

  const getSubscriptionStatus = (subscription: Subscription) => {
    if (!subscription.isActive) return 'inactive'
    
    const nextBilling = new Date(subscription.nextBilling)
    const now = new Date()
    const daysUntilBilling = Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (subscription.trialEnd && new Date(subscription.trialEnd) > now) return 'trial'
    if (daysUntilBilling <= 3) return 'due-soon'
    if (daysUntilBilling <= 7) return 'due-week'
    return 'active'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'trial':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Trial</Badge>
      case 'due-soon':
        return <Badge variant="destructive">Due in {Math.ceil((new Date().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</Badge>
      case 'due-week':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Due this week</Badge>
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>
      default:
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <Badge variant="secondary">{activeSubscriptions.length}</Badge>
        </div>
        {onNewSubscription && (
          <Button onClick={onNewSubscription}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subscription
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Monthly Total</p>
                <p className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Yearly Total</p>
                <p className="text-2xl font-bold">${yearlyTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Services</p>
                <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {allCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="inactive">Inactive only</SelectItem>
              <SelectItem value="expiring-soon">Expiring soon</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
            className="flex items-center space-x-2"
          >
            {showInactive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showInactive ? 'Hide' : 'Show'} Inactive</span>
          </Button>
        </div>
      </Card>

      {/* Subscriptions List */}
      {filteredSubscriptions.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {subscriptions.length === 0 ? 'No subscriptions yet' : 'No matching subscriptions'}
              </h3>
              <p className="text-muted-foreground">
                {subscriptions.length === 0 
                  ? 'Start tracking your recurring subscriptions and get insights into your spending.'
                  : 'Try adjusting your search or filters.'
                }
              </p>
            </div>
            {subscriptions.length === 0 && onNewSubscription && (
              <Button onClick={onNewSubscription}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Subscription
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((subscription) => {
            const status = getSubscriptionStatus(subscription)
            const nextBilling = new Date(subscription.nextBilling)
            const monthlyEquivalent = subscription.cost / getCycleMultiplier(subscription.billingCycle)
            
            return (
              <Card key={subscription.id} className={cn(
                "hover:shadow-md transition-shadow",
                !subscription.isActive && "opacity-60"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold truncate">{subscription.service}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(status)}
                        {subscription.category && (
                          <Badge variant="outline" className="text-xs">
                            {subscription.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">${subscription.cost}</p>
                      <p className="text-sm text-muted-foreground">
                        per {getBillingCycleText(subscription.billingCycle)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${monthlyEquivalent.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Next: {formatDistanceToNow(nextBilling, { addSuffix: true })}
                    </span>
                  </div>
                  
                  {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        Trial ends {formatDistanceToNow(new Date(subscription.trialEnd), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      {subscription.cancellationUrl && (
                        <a
                          href={subscription.cancellationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {onEditSubscription && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditSubscription(subscription)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubscription(subscription.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}