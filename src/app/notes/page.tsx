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
    <div 
      className="max-w-[50rem] px-5 pt-20 @sm:pt-18 mx-auto w-full flex flex-col h-full pb-4 transition-all duration-300" 
      style={{ maskImage: 'linear-gradient(black 85%, transparent 100%)' }}
    >
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
  )
}