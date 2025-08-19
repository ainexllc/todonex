'use client'

import { X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface RecipeFilters {
  search: string
  tags: string[]
  prepTime: string
  servings: string
}

interface RecipeFiltersProps {
  filters: RecipeFilters
  onFiltersChange: (filters: RecipeFilters) => void
  availableTags: string[]
}

export function RecipeFilters({ filters, onFiltersChange, availableTags }: RecipeFiltersProps) {
  const updateFilter = (key: keyof RecipeFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag])
    }
  }

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags.filter(t => t !== tag))
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      tags: [],
      prepTime: 'all',
      servings: 'all'
    })
  }

  const hasActiveFilters = filters.tags.length > 0 || filters.prepTime !== 'all' || filters.servings !== 'all'

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Prep Time Filter */}
        <div className="flex-1">
          <Select value={filters.prepTime} onValueChange={(value) => updateFilter('prepTime', value)}>
            <SelectTrigger className="glass border-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prep Times</SelectItem>
              <SelectItem value="quick">Quick (≤30 min)</SelectItem>
              <SelectItem value="medium">Medium (30-60 min)</SelectItem>
              <SelectItem value="long">Long (&gt;60 min)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Servings Filter */}
        <div className="flex-1">
          <Select value={filters.servings} onValueChange={(value) => updateFilter('servings', value)}>
            <SelectTrigger className="glass border-glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Servings</SelectItem>
              <SelectItem value="small">Small (1-2 people)</SelectItem>
              <SelectItem value="medium">Medium (3-4 people)</SelectItem>
              <SelectItem value="large">Large (5+ people)</SelectItem>
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

      {/* Tag Selection */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Filter by tags:</div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Button
                key={tag}
                variant={filters.tags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (filters.tags.includes(tag)) {
                    removeTag(tag)
                  } else {
                    addTag(tag)
                  }
                }}
                className={`text-xs ${
                  filters.tags.includes(tag) 
                    ? "bg-primary text-primary-foreground" 
                    : "glass border-glass hover:bg-white/5"
                }`}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.prepTime !== 'all' && (
            <Badge variant="secondary" className="glass border-glass">
              <Filter className="h-3 w-3 mr-1" />
              Prep: {filters.prepTime}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('prepTime', 'all')}
                className="h-4 w-4 p-0 ml-1 hover:bg-white/10"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {filters.servings !== 'all' && (
            <Badge variant="secondary" className="glass border-glass">
              <Filter className="h-3 w-3 mr-1" />
              Servings: {filters.servings}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilter('servings', 'all')}
                className="h-4 w-4 p-0 ml-1 hover:bg-white/10"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="glass border-glass">
              <Filter className="h-3 w-3 mr-1" />
              {tag}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTag(tag)}
                className="h-4 w-4 p-0 ml-1 hover:bg-white/10"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}