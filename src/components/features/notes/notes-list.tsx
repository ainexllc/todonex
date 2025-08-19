'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Note } from '@/types'
import { useAuthStore } from '@/store/auth-store'
import { getAllNotes, deleteNote } from '@/lib/firebase-data'
import { 
  StickyNote, 
  Pin, 
  Edit2, 
  Trash2, 
  Search, 
  Plus,
  Type,
  CheckSquare,
  Mic,
  Image,
  Tag,
  Calendar,
  Users
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface NotesListProps {
  onNewNote?: () => void
  onEditNote?: (note: Note) => void
  className?: string
}

const noteTypeIcons = {
  text: Type,
  checklist: CheckSquare,
  voice: Mic,
  image: Image
}

export function NotesList({ onNewNote, onEditNote, className }: NotesListProps) {
  const { user } = useAuthStore()
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  const loadNotes = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const userNotes = await getAllNotes(user.id)
      setNotes(userNotes)
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [user])

  // Filter notes based on search and filters
  useEffect(() => {
    let filtered = notes

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(note => 
        note.title?.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(note => note.type === selectedType)
    }

    // Tag filter
    if (selectedTag !== 'all') {
      filtered = filtered.filter(note => note.tags.includes(selectedTag))
    }

    // Sort: pinned first, then by last modified
    filtered = filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    })

    setFilteredNotes(filtered)
  }, [notes, searchQuery, selectedType, selectedTag])

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      await deleteNote(noteId)
      setNotes(prev => prev.filter(note => note.id !== noteId))
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)))

  const formatContent = (content: string, type: string) => {
    if (type === 'checklist') {
      const lines = content.split('\n').filter(line => line.trim())
      return lines.slice(0, 3).join(' • ') + (lines.length > 3 ? '...' : '')
    }
    return content.length > 100 ? content.substring(0, 100) + '...' : content
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StickyNote className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Notes</h1>
          <Badge variant="secondary">{notes.length}</Badge>
        </div>
        {onNewNote && (
          <Button onClick={onNewNote}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="checklist">Checklist</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectContent>
          </Select>

          {allTags.length > 0 && (
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <StickyNote className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
              </h3>
              <p className="text-muted-foreground">
                {notes.length === 0 
                  ? 'Create your first note to capture ideas and reminders.'
                  : 'Try adjusting your search or filters.'
                }
              </p>
            </div>
            {notes.length === 0 && onNewNote && (
              <Button onClick={onNewNote}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Note
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const TypeIcon = noteTypeIcons[note.type]
            
            return (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      {note.title ? (
                        <h3 className="font-medium truncate">{note.title}</h3>
                      ) : (
                        <span className="text-muted-foreground text-sm">Untitled</span>
                      )}
                      {note.isPinned && (
                        <Pin className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {formatContent(note.content, note.type)}
                  </p>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(note.lastModified), { addSuffix: true })}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {onEditNote && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditNote(note)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {note.sharedWith.length > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground pt-1">
                      <Users className="h-3 w-3" />
                      <span>Shared with {note.sharedWith.length} {note.sharedWith.length === 1 ? 'person' : 'people'}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}