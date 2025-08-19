'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Note } from '@/types'
import { useAuthStore } from '@/store/auth-store'
import { getAllNotes } from '@/lib/firebase-data'
import { 
  StickyNote, 
  Plus, 
  Pin, 
  Type,
  CheckSquare,
  Mic,
  Image,
  ArrowRight
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface NotesWidgetProps {
  size?: 'small' | 'medium' | 'large'
  settings?: Record<string, any>
}

const noteTypeIcons = {
  text: Type,
  checklist: CheckSquare,
  voice: Mic,
  image: Image
}

export function NotesWidget({ size = 'medium' }: NotesWidgetProps) {
  const { user } = useAuthStore()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadNotes = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const userNotes = await getAllNotes(user.id)
      // Show pinned notes first, then recent notes
      const sortedNotes = userNotes
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        })
        .slice(0, size === 'small' ? 2 : size === 'large' ? 6 : 4)
      
      setNotes(sortedNotes)
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [user])

  const formatNoteContent = (content: string, type: string) => {
    const maxLength = size === 'small' ? 50 : 80
    if (type === 'checklist') {
      const lines = content.split('\n').filter(line => line.trim())
      const preview = lines.slice(0, 2).join(' • ')
      return preview.length > maxLength ? preview.substring(0, maxLength) + '...' : preview
    }
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base font-medium text-gray-900">
            <StickyNote className="h-4 w-4 text-blue-500" />
            <span>Recent Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-base font-medium text-gray-900">
            <StickyNote className="h-4 w-4 text-blue-500" />
            <span>Recent Notes</span>
            {notes.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {notes.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Link href="/notes">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                <Plus className="h-4 w-4 text-gray-600" />
              </Button>
            </Link>
            {notes.length > 0 && (
              <Link href="/notes">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                  <ArrowRight className="h-4 w-4 text-gray-600" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {notes.length === 0 ? (
          <div className="text-center py-6">
            <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
              <StickyNote className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">No notes yet</p>
            <Link href="/notes">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => {
              const TypeIcon = noteTypeIcons[note.type]
              
              return (
                <div
                  key={note.id}
                  className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 hover:shadow-sm transition-all bg-white"
                >
                  <div className="flex items-start space-x-2">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <TypeIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          {note.title ? (
                            <h4 className="text-sm font-medium truncate text-gray-900">
                              {note.title}
                            </h4>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Untitled
                            </span>
                          )}
                          {note.isPinned && (
                            <Pin className="h-3 w-3 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {formatNoteContent(note.content, note.type)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(note.lastModified), { addSuffix: true })}
                          </span>
                          {note.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              {note.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                  {tag}
                                </Badge>
                              ))}
                              {note.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  +{note.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            <div className="pt-3 border-t border-gray-100">
              <Link href="/notes">
                <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:bg-gray-100">
                  View All Notes
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}