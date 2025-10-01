'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LIST_COLORS, getAllColorKeys, type ListColorKey } from '@/lib/utils/list-colors'

interface ColorPickerProps {
  value?: string
  onChange: (color: ListColorKey) => void
  className?: string
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState<ListColorKey>(
    (value as ListColorKey) || 'blue'
  )

  const colors = getAllColorKeys()

  const handleColorSelect = (colorKey: ListColorKey) => {
    setSelectedColor(colorKey)
    onChange(colorKey)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-xs font-medium text-muted-foreground">List Color</label>
      <div className="grid grid-cols-6 gap-2">
        {colors.map((colorKey) => {
          const colorTheme = LIST_COLORS[colorKey]
          const isSelected = selectedColor === colorKey

          return (
            <button
              key={colorKey}
              type="button"
              onClick={() => handleColorSelect(colorKey)}
              className={cn(
                'relative h-9 w-9 rounded-lg transition-all duration-200',
                'hover:scale-110 hover:shadow-lg border border-border',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
                isSelected && 'ring-2 ring-ring ring-offset-2 ring-offset-background scale-110'
              )}
              style={{
                backgroundColor: colorTheme.hex
              }}
              title={colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white drop-shadow-md" strokeWidth={3} />
                </div>
              )}
            </button>
          )
        })}
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        Selected: <span className="text-foreground font-medium">
          {selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}
        </span>
      </div>
    </div>
  )
}
