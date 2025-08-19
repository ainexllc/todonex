'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingCart, Package, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface ShoppingItem {
  id: string
  name: string
  category?: string
  quantity?: number
  unit?: string
  purchased: boolean
}

interface ShoppingFormProps {
  item?: ShoppingItem | null
  onSubmit: (itemData: any) => void
  onClose: () => void
}

const categories = [
  'Produce',
  'Dairy', 
  'Meat',
  'Pantry',
  'Frozen',
  'Bakery',
  'Snacks',
  'Beverages',
  'Household',
  'Personal Care'
]

const units = [
  'lbs',
  'oz',
  'kg',
  'g',
  'cups',
  'tbsp',
  'tsp',
  'qt',
  'gal',
  'ml',
  'l',
  'pcs',
  'boxes',
  'cans',
  'bottles',
  'bags',
  'packets'
]

export function ShoppingForm({ item, onSubmit, onClose }: ShoppingFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        quantity: item.quantity?.toString() || '',
        unit: item.unit || ''
      })
    }
  }, [item])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required'
    }
    
    if (formData.quantity && isNaN(Number(formData.quantity))) {
      newErrors.quantity = 'Quantity must be a number'
    }
    
    if (formData.quantity && Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const itemData = {
      name: formData.name.trim(),
      category: formData.category || undefined,
      quantity: formData.quantity ? Number(formData.quantity) : undefined,
      unit: formData.unit || undefined
    }
    
    onSubmit(itemData)
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
      'Produce': '🥬',
      'Dairy': '🥛',
      'Meat': '🥩',
      'Snacks': '🍪',
      'Beverages': '🥤',
      'Household': '🧽',
      'Personal Care': '🧴',
      'Frozen': '🧊',
      'Pantry': '🥫',
      'Bakery': '🍞'
    }
    return iconMap[category] || '📦'
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] glass border-glass">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {item ? 'Edit Shopping Item' : 'Add to Shopping List'}
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
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Item Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter item name..."
              className={`glass border-glass ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => updateField('category', value)}
            >
              <SelectTrigger className="glass border-glass">
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
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
                placeholder="Amount"
                className={`glass border-glass ${errors.quantity ? 'border-red-500' : ''}`}
                min="0"
                step="0.1"
              />
              {errors.quantity && (
                <p className="text-xs text-red-500">{errors.quantity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Unit
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => updateField('unit', value)}
              >
                <SelectTrigger className="glass border-glass">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              disabled={!formData.name.trim()}
            >
              {item ? 'Update Item' : 'Add to List'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}