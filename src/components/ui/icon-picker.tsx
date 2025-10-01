'use client'

import { useState, useMemo } from 'react'
import { Search, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getIconComponent,
  suggestIconsForList,
  ICON_CATEGORIES,
  isValidIconName,
  type IconName
} from '@/lib/utils/icon-matcher'

interface IconPickerProps {
  listTitle: string
  value?: IconName
  onChange: (iconName: IconName) => void
  className?: string
}

export function IconPicker({ listTitle, value, onChange, className }: IconPickerProps) {
  const [selectedIcon, setSelectedIcon] = useState<IconName>(value || 'List')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('Suggested')

  // Get suggested icons based on list title
  const suggestedIcons = useMemo(() => {
    return suggestIconsForList(listTitle)
  }, [listTitle])

  // All available categories including Suggested
  const categories = useMemo(() => {
    return {
      Suggested: suggestedIcons,
      ...ICON_CATEGORIES
    }
  }, [suggestedIcons])

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    const icons = categories[activeCategory as keyof typeof categories] || []

    if (!searchQuery) return icons

    const query = searchQuery.toLowerCase()
    return icons.filter(iconName =>
      iconName.toLowerCase().includes(query)
    )
  }, [categories, activeCategory, searchQuery])

  const handleIconSelect = (iconName: IconName) => {
    setSelectedIcon(iconName)
    onChange(iconName)
  }

  return (
    <div className={cn('space-y-3', className)}>
      <label className="text-xs font-medium text-muted-foreground">List Icon</label>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search icons..."
          className="h-8 pl-8 text-xs"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {Object.keys(categories).map((category) => (
          <Button
            key={category}
            type="button"
            size="sm"
            variant={activeCategory === category ? 'default' : 'outline'}
            onClick={() => setActiveCategory(category)}
            className="h-6 text-xs px-2 whitespace-nowrap flex-shrink-0"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Icon Grid */}
      <div className="border border-border rounded-md p-2 bg-muted/50 max-h-[200px] overflow-y-auto">
        {filteredIcons.length > 0 ? (
          <div className="grid grid-cols-8 gap-1">
            {filteredIcons.map((iconName) => {
              const IconComponent = getIconComponent(iconName)
              const isSelected = selectedIcon === iconName

              if (!IconComponent) return null

              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => handleIconSelect(iconName)}
                  className={cn(
                    'relative h-8 w-8 rounded flex items-center justify-center',
                    'transition-all duration-200',
                    'hover:bg-accent hover:scale-110',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    isSelected && 'bg-primary hover:bg-primary scale-110'
                  )}
                  title={iconName}
                >
                  <IconComponent
                    className={cn(
                      'h-4 w-4',
                      isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                    )}
                  />
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                      <Check className="h-2 w-2 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No icons found matching &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Selected Icon Display */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Selected:</span>
        {(() => {
          const SelectedIconComponent = getIconComponent(selectedIcon)
          return SelectedIconComponent ? (
            <>
              <SelectedIconComponent className="h-4 w-4 text-foreground" />
              <span className="text-foreground font-medium">{selectedIcon}</span>
            </>
          ) : (
            <span className="text-muted-foreground">None</span>
          )
        })()}
      </div>
    </div>
  )
}
