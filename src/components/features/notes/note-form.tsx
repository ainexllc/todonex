'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Note } from '@/types'
import { useAuthStore } from '@/store/auth-store'
import { createNote, updateNote } from '@/lib/firebase-data'
import { StickyNote, Pin, Users, X, Tag, Type, CheckSquare, Mic, Image } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NoteFormProps {
  note?: Note
  onSaved?: (note: Note) => void
  onCancel?: () => void
  className?: string
}

const noteTypes = [
  { value: 'text', label: 'Text Note', icon: Type },
  { value: 'checklist', label: 'Checklist', icon: CheckSquare },
  { value: 'voice', label: 'Voice Memo', icon: Mic },
  { value: 'image', label: 'Image Note', icon: Image }
]

export function NoteForm({ note, onSaved, onCancel, className }: NoteFormProps) {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    type: note?.type || 'text' as const,
    tags: note?.tags || [],
    isPinned: note?.isPinned || false,
    sharedWith: note?.sharedWith || []
  })
  const [newTag, setNewTag] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.content.trim()) return

    setIsLoading(true)
    try {
      const noteData: Omit<Note, 'id' | 'lastModified' | 'createdBy' | 'createdAt'> = {
        title: formData.title.trim() || undefined,
        content: formData.content.trim(),
        type: formData.type,
        tags: formData.tags,
        isPinned: formData.isPinned,
        sharedWith: formData.sharedWith,
        familyId: user.familyId,
        attachments: []
      }

      let savedNote: Note
      if (note?.id) {
        savedNote = await updateNote(note.id, noteData)
      } else {
        savedNote = await createNote(noteData)
      }

      onSaved?.(savedNote)
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <StickyNote className="h-5 w-5" />
          <span>{note ? 'Edit Note' : 'New Note'}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Give your note a title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Note Type</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {noteTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder={
                formData.type === 'checklist' 
                  ? "- Task 1\n- Task 2\n- Task 3"
                  : formData.type === 'voice'
                  ? "Voice memo notes will appear here..."
                  : "Write your note here..."
              }
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                  <Tag className="h-3 w-3" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-destructive/20 rounded-sm p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="pinned"
                checked={formData.isPinned}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPinned: checked }))}
              />
              <Label htmlFor="pinned" className="flex items-center space-x-2">
                <Pin className="h-4 w-4" />
                <span>Pin this note</span>
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button type="submit" disabled={isLoading || !formData.content.trim()}>
              {isLoading ? 'Saving...' : (note ? 'Update Note' : 'Save Note')}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}