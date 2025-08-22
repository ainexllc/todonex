'use client'

import { useState } from 'react'
import { SubscriptionsList } from '@/components/features/subscriptions/subscriptions-list'
import { SubscriptionForm } from '@/components/features/subscriptions/subscription-form'
import { Subscription } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export default function SubscriptionsPage() {
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleNewSubscription = () => {
    setEditingSubscription(undefined)
    setIsDialogOpen(true)
  }

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setIsDialogOpen(true)
  }

  const handleSubscriptionSaved = () => {
    setIsDialogOpen(false)
    setEditingSubscription(undefined)
    // The subscriptions list will automatically refresh
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingSubscription(undefined)
  }

  return (
    <div 
      className="max-w-[50rem] px-5 pt-20 @sm:pt-18 mx-auto w-full flex flex-col h-full pb-4 transition-all duration-300" 
      style={{ maskImage: 'linear-gradient(black 85%, transparent 100%)' }}
    >
      <SubscriptionsList 
        onNewSubscription={handleNewSubscription}
        onEditSubscription={handleEditSubscription}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <SubscriptionForm
            subscription={editingSubscription}
            onSaved={handleSubscriptionSaved}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}