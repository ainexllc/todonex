'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Subscription } from '@/types'
import { useAuthStore } from '@/store/auth-store'
import { createSubscription, updateSubscription } from '@/lib/firebase-data'
import { BarChart3, DollarSign, Calendar, Globe, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubscriptionFormProps {
  subscription?: Subscription
  onSaved?: (subscription: Subscription) => void
  onCancel?: () => void
  className?: string
}

const billingCycles = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
]

const subscriptionCategories = [
  'Streaming',
  'Software/SaaS', 
  'Cloud Storage',
  'Music',
  'News/Media',
  'Gaming',
  'Productivity',
  'Communication',
  'Health/Fitness',
  'Education',
  'Other'
]

const popularServices = [
  { name: 'Netflix', category: 'Streaming' },
  { name: 'Spotify', category: 'Music' },
  { name: 'YouTube Premium', category: 'Streaming' },
  { name: 'Amazon Prime', category: 'Streaming' },
  { name: 'Adobe Creative Cloud', category: 'Software/SaaS' },
  { name: 'Microsoft 365', category: 'Software/SaaS' },
  { name: 'Google Drive', category: 'Cloud Storage' },
  { name: 'Disney+', category: 'Streaming' },
  { name: 'Hulu', category: 'Streaming' },
  { name: 'Apple Music', category: 'Music' },
  { name: 'iCloud', category: 'Cloud Storage' },
  { name: 'Dropbox', category: 'Cloud Storage' }
]

export function SubscriptionForm({ subscription, onSaved, onCancel, className }: SubscriptionFormProps) {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    service: subscription?.service || '',
    cost: subscription?.cost?.toString() || '',
    billingCycle: subscription?.billingCycle || 'monthly' as const,
    nextBilling: subscription?.nextBilling ? new Date(subscription.nextBilling).toISOString().split('T')[0] : '',
    category: subscription?.category || '',
    isActive: subscription?.isActive ?? true,
    autoRenewal: subscription?.autoRenewal ?? true,
    cancellationUrl: subscription?.cancellationUrl || '',
    trialEnd: subscription?.trialEnd ? new Date(subscription.trialEnd).toISOString().split('T')[0] : ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.service || !formData.cost || !formData.nextBilling) return

    setIsLoading(true)
    try {
      const subscriptionData = {
        service: formData.service.trim(),
        cost: parseFloat(formData.cost),
        billingCycle: formData.billingCycle,
        nextBilling: new Date(formData.nextBilling),
        category: formData.category,
        isActive: formData.isActive,
        autoRenewal: formData.autoRenewal,
        cancellationUrl: formData.cancellationUrl.trim() || undefined,
        trialEnd: formData.trialEnd ? new Date(formData.trialEnd) : undefined,
        familyId: user.familyId,
        sharedWith: []
      }

      let savedSubscription: Subscription
      if (subscription?.id) {
        savedSubscription = await updateSubscription(subscription.id, subscriptionData)
      } else {
        savedSubscription = await createSubscription(subscriptionData)
      }

      onSaved?.(savedSubscription)
    } catch (error) {
      console.error('Error saving subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleServiceSelect = (serviceName: string) => {
    const service = popularServices.find(s => s.name === serviceName)
    if (service) {
      setFormData(prev => ({
        ...prev,
        service: serviceName,
        category: service.category
      }))
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>{subscription ? 'Edit Subscription' : 'Add Subscription'}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="service">Service Name *</Label>
            <Input
              id="service"
              placeholder="Enter service name..."
              value={formData.service}
              onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
              list="popular-services"
              required
            />
            <datalist id="popular-services">
              {popularServices.map((service) => (
                <option key={service.name} value={service.name} />
              ))}
            </datalist>
            
            {/* Quick Service Selection */}
            <div className="flex flex-wrap gap-2 mt-2">
              {popularServices.slice(0, 6).map((service) => (
                <Button
                  key={service.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleServiceSelect(service.name)}
                  className="text-xs"
                >
                  {service.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Cost and Billing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Billing Cycle *</Label>
              <Select value={formData.billingCycle} onValueChange={(value: any) => setFormData(prev => ({ ...prev, billingCycle: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {billingCycles.map((cycle) => (
                    <SelectItem key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category and Next Billing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextBilling">Next Billing Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nextBilling"
                  type="date"
                  value={formData.nextBilling}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextBilling: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancellationUrl">Cancellation URL (optional)</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cancellationUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.cancellationUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, cancellationUrl: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trialEnd">Trial End Date (optional)</Label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="trialEnd"
                  type="date"
                  value={formData.trialEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, trialEnd: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Subscription</Label>
                <p className="text-sm text-muted-foreground">Is this subscription currently active?</p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoRenewal">Auto Renewal</Label>
                <p className="text-sm text-muted-foreground">Does this subscription auto-renew?</p>
              </div>
              <Switch
                id="autoRenewal"
                checked={formData.autoRenewal}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoRenewal: checked }))}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !formData.service || !formData.cost || !formData.nextBilling}
            >
              {isLoading ? 'Saving...' : (subscription ? 'Update Subscription' : 'Add Subscription')}
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