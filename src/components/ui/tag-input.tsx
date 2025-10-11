'use client'

import * as React from 'react'
import { X, Plus } from 'lucide-react'
import { Badge } from './badge'
import { Input } from './input'
import { Button } from './button'
import { cn } from '@/lib/utils'

export interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TagInput({
  tags = [],
  onChange,
  placeholder = 'Add label...',
  className,
  disabled = false
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [isAdding, setIsAdding] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleAddLabel = () => {
    const trimmedValue = inputValue.trim().toLowerCase()
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onChange([...tags, trimmedValue])
      setInputValue('')
      setIsAdding(false)
    }
  }

  const handleRemoveLabel = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddLabel()
    } else if (e.key === 'Escape') {
      setInputValue('')
      setIsAdding(false)
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {/* Existing Labels */}
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="px-1.5 py-0.5 text-xs flex items-center gap-1 group"
        >
          <span>{tag}</span>
          {!disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveLabel(tag)
              }}
              className="ml-0.5 hover:text-destructive transition-colors"
              aria-label={`Remove ${tag} label`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </Badge>
      ))}

      {/* Add Label Input */}
      {!disabled && (
        <>
          {isAdding ? (
            <div className="flex items-center gap-1">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (!inputValue.trim()) {
                    setIsAdding(false)
                  }
                }}
                placeholder={placeholder}
                className="h-6 w-24 text-xs px-2"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAddLabel}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsAdding(true)
                setTimeout(() => inputRef.current?.focus(), 0)
              }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add label</span>
            </button>
          )}
        </>
      )}
    </div>
  )
}
