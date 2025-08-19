'use client'

import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface ShoppingFilters {
  status: string
  category: string
  search: string
}

interface ShoppingFiltersProps {
  filters: ShoppingFilters
  onFiltersChange: (filters: ShoppingFilters) => void
  categories: string[]
}

export function ShoppingFilters({ filters, onFiltersChange, categories }: ShoppingFiltersProps) {
  const updateFilter = (key: keyof ShoppingFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      status: 'all',
      category: 'all',
      search: ''
    })
  }

  const hasActiveFilters = filters.status !== 'all' || filters.category !== 'all' || filters.search

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
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10 glass border-glass"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateFilter('search', '')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/10"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status Filter */}
        <div className="flex-1">
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="glass border-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="pending">Need to Buy</SelectItem>
              <SelectItem value="purchased">Purchased</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="flex-1">
          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger className="glass border-glass">
              <SelectValue>
                {filters.category === 'all' ? (
                  'All Categories'
                ) : (
                  <span className="flex items-center gap-2">
                    <span>{getCategoryIcon(filters.category)}</span>
                    <span>{filters.category}</span>
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
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

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="glass border-glass hover:bg-white/5 sm:w-auto w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="glass border-glass">
              <Filter className="h-3 w-3 mr-1" />
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('status', 'all')}
                className="h-4 w-4 p-0 ml-1 hover:bg-white/10"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="glass border-glass">
              <Filter className="h-3 w-3 mr-1" />
              Category: {filters.category}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('category', 'all')}
                className="h-4 w-4 p-0 ml-1 hover:bg-white/10"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {filters.search && (
            <Badge variant="secondary" className="glass border-glass">
              <Search className="h-3 w-3 mr-1" />
              &quot;{filters.search}&quot;
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('search', '')}
                className="h-4 w-4 p-0 ml-1 hover:bg-white/10"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}