'use client'

import { useState, useEffect } from 'react'
import { X, DollarSign, Calendar, CreditCard, Repeat, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Bill } from '@/types'

interface BillFormProps {
  bill?: Bill | null
  onSubmit: (billData: any) => void
  onClose: () => void
}

const categories = [
  'Utilities',
  'Rent/Mortgage',
  'Insurance',
  'Subscriptions',
  'Loans',
  'Credit Cards',
  'Healthcare',
  'Internet/Phone',
  'Transportation',
  'Other'
]

export function BillForm({ bill, onSubmit, onClose }: BillFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: '',
    description: '',
    isRecurring: false,
    recurringInterval: 'monthly' as 'weekly' | 'monthly' | 'yearly'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when editing
  useEffect(() => {
    if (bill) {
      setFormData({
        name: bill.name || '',
        amount: bill.amount?.toString() || '',
        dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : '',
        category: bill.category || '',
        description: bill.description || '',
        isRecurring: bill.isRecurring || false,
        recurringInterval: bill.recurringInterval || 'monthly'
      })
    }
  }, [bill])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Bill name is required'
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required'
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const billData = {
      name: formData.name.trim(),
      amount: Number(formData.amount),
      dueDate: new Date(formData.dueDate),
      category: formData.category,
      description: formData.description.trim() || undefined,
      isRecurring: formData.isRecurring,
      recurringInterval: formData.isRecurring ? formData.recurringInterval : undefined
    }
    
    onSubmit(billData)
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'utilities': '⚡',
      'rent/mortgage': '🏠',
      'insurance': '🛡️',
      'subscriptions': '📱',
      'loans': '🏦',
      'credit cards': '💳',
      'healthcare': '🏥',
      'internet/phone': '📡',
      'transportation': '🚗',
      'other': '📄'
    }
    return iconMap[category.toLowerCase()] || '📄'
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass border-glass">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {bill ? 'Edit Bill' : 'Add New Bill'}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bill Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Bill Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Electric bill, Netflix, etc."
              className={`glass border-glass ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Amount and Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => updateField('amount', e.target.value)}
                placeholder="0.00"
                className={`glass border-glass ${errors.amount ? 'border-red-500' : ''}`}
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date *
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => updateField('dueDate', e.target.value)}
                className={`glass border-glass ${errors.dueDate ? 'border-red-500' : ''}`}
              />
              {errors.dueDate && (
                <p className="text-xs text-red-500">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => updateField('category', value)}
            >
              <SelectTrigger className={`glass border-glass ${errors.category ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select category">
                  {formData.category && (
                    <span className="flex items-center gap-2">
                      <span>{getCategoryIcon(formData.category)}</span>
                      <span>{formData.category}</span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    <span className="flex items-center gap-2">
                      <span>{getCategoryIcon(category)}</span>
                      <span>{category}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Recurring Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => updateField('isRecurring', e.target.checked)}
                className="rounded border-glass"
              />
              <Label htmlFor="isRecurring" className="text-sm font-medium flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Recurring Bill
              </Label>
            </div>

            {formData.isRecurring && (
              <div className="ml-6">
                <Label className="text-sm font-medium">
                  Repeat Frequency
                </Label>
                <Select
                  value={formData.recurringInterval}
                  onValueChange={(value) => updateField('recurringInterval', value)}
                >
                  <SelectTrigger className="glass border-glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description (optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Additional notes about this bill..."
              rows={3}
              className="glass border-glass resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 glass border-glass hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!formData.name.trim() || !formData.amount || !formData.dueDate || !formData.category}
            >
              {bill ? 'Update Bill' : 'Add Bill'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}