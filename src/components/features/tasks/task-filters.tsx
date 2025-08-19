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

interface TaskFilters {
  status: string
  priority: string
  search: string
}

interface TaskFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const updateFilter = (key: keyof TaskFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      status: 'all',
      priority: 'all',
      search: ''
    })
  }

  const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || filters.search

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
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
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending Only</SelectItem>
              <SelectItem value="completed">Completed Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="flex-1">
          <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
            <SelectTrigger className="glass border-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">
                <span className="text-red-500">High Priority</span>
              </SelectItem>
              <SelectItem value="medium">
                <span className="text-orange-500">Medium Priority</span>
              </SelectItem>
              <SelectItem value="low">
                <span className="text-green-500">Low Priority</span>
              </SelectItem>
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
          
          {filters.priority !== 'all' && (
            <Badge variant="secondary" className="glass border-glass">
              <Filter className="h-3 w-3 mr-1" />
              Priority: {filters.priority}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('priority', 'all')}
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