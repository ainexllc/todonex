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

interface BillFilters {
  status: string
  category: string
  search: string
  period: string
}

interface BillFiltersProps {
  filters: BillFilters
  onFiltersChange: (filters: BillFilters) => void
  categories: string[]
}

export function BillFilters({ filters, onFiltersChange, categories }: BillFiltersProps) {
  const updateFilter = (key: keyof BillFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      status: 'all',
      category: 'all',
      search: '',
      period: 'current'
    })
  }

  const hasActiveFilters = filters.status !== 'all' || filters.category !== 'all' || filters.search || filters.period !== 'current'

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
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bills..."
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Status Filter */}
        <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
          <SelectTrigger className="glass border-glass">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bills</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
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

        {/* Period Filter */}
        <Select value={filters.period} onValueChange={(value) => updateFilter('period', value)}>
          <SelectTrigger className="glass border-glass">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">This Month</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="glass border-glass hover:bg-white/5"
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
          
          {filters.period !== 'current' && (
            <Badge variant="secondary" className="glass border-glass">
              <Filter className="h-3 w-3 mr-1" />
              Period: {filters.period}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('period', 'current')}
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