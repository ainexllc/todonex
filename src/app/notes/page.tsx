'use client'

import { useState } from 'react'
import { NotesList } from '@/components/features/notes/notes-list'
import { NoteForm } from '@/components/features/notes/note-form'
import { Note } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'


export default function NotesPage() {
  const [editingNote, setEditingNote] = useState<Note | undefined>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleNewNote = () => {
    setEditingNote(undefined)
    setIsDialogOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setIsDialogOpen(true)
  }

  const handleNoteSaved = () => {
    setIsDialogOpen(false)
    setEditingNote(undefined)
    // The notes list will automatically refresh
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingNote(undefined)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <NotesList 
          onNewNote={handleNewNote}
          onEditNote={handleEditNote}
        />
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <NoteForm
              note={editingNote}
              onSaved={handleNoteSaved}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}