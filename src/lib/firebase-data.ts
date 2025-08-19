// Simple Firebase data layer for NextTaskPro
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore'
import { db, auth } from './firebase'
import { Note, Subscription, CalendarEvent } from '@/types'

// Generic CRUD operations
export async function createDocument<T extends Record<string, any>>(
  collectionName: string,
  id: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  if (!auth.currentUser) throw new Error('Not authenticated')
  
  const docData = {
    ...data,
    id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: auth.currentUser.uid,
    familyId: auth.currentUser.uid // For now, user ID is family ID
  }
  
  await setDoc(doc(db, collectionName, id), docData)
}

export async function updateDocument<T extends Record<string, any>>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  const docData = {
    ...data,
    updatedAt: serverTimestamp()
  }
  
  await setDoc(doc(db, collectionName, id), docData, { merge: true })
}

export async function getDocument<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const docSnapshot = await getDoc(doc(db, collectionName, id))
  if (docSnapshot.exists()) {
    const data = docSnapshot.data()
    return {
      ...data,
      id: docSnapshot.id,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as T
  }
  return null
}

export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  await deleteDoc(doc(db, collectionName, id))
}

export async function getUserDocuments<T>(
  collectionName: string,
  orderByField = 'updatedAt'
): Promise<T[]> {
  if (!auth.currentUser) return []
  
  const q = query(
    collection(db, collectionName),
    where('familyId', '==', auth.currentUser.uid),
    orderBy(orderByField, 'desc')
  )
  
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => {
    const data = doc.data()
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    } as T
  })
}

export function subscribeToUserDocuments<T>(
  collectionName: string,
  callback: (items: T[]) => void,
  orderByField = 'updatedAt'
): Unsubscribe {
  if (!auth.currentUser) {
    callback([])
    return () => {}
  }
  
  const q = query(
    collection(db, collectionName),
    where('familyId', '==', auth.currentUser.uid),
    orderBy(orderByField, 'desc')
  )
  
  return onSnapshot(q, (querySnapshot) => {
    const items = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as T
    })
    callback(items)
  })
}

// Connection status utilities
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

export function onNetworkChange(callback: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

// Simple preferences using localStorage only
export function savePreference<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`nexttaskpro-${key}`, JSON.stringify(value))
  } catch (error) {
    console.warn('Failed to save preference:', error)
  }
}

export function getPreference<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const stored = localStorage.getItem(`nexttaskpro-${key}`)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

export function clearPreferences(): void {
  if (typeof window === 'undefined') return
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('nexttaskpro-')) {
      localStorage.removeItem(key)
    }
  })
}

// Notes management
export async function createNote(noteData: Omit<Note, 'id' | 'lastModified' | 'createdBy' | 'createdAt'>): Promise<Note> {
  const user = auth.currentUser
  if (!user) throw new Error('Authentication required')

  const notesRef = collection(db, 'notes')
  const noteDoc = doc(notesRef)
  
  const now = new Date()
  const note: Note = {
    id: noteDoc.id,
    ...noteData,
    createdBy: user.uid,
    createdAt: now,
    lastModified: now
  }
  
  await setDoc(noteDoc, {
    ...note,
    createdAt: Timestamp.fromDate(note.createdAt),
    lastModified: Timestamp.fromDate(note.lastModified)
  })
  
  return note
}

export async function updateNote(noteId: string, updates: Partial<Omit<Note, 'id' | 'createdBy' | 'createdAt'>>): Promise<Note> {
  const user = auth.currentUser
  if (!user) throw new Error('Authentication required')

  const noteRef = doc(db, 'notes', noteId)
  const noteSnap = await getDoc(noteRef)
  
  if (!noteSnap.exists()) {
    throw new Error('Note not found')
  }
  
  const existingNote = noteSnap.data()
  if (existingNote.createdBy !== user.uid) {
    throw new Error('Permission denied')
  }
  
  const updatedData = {
    ...updates,
    lastModified: Timestamp.fromDate(new Date())
  }
  
  await setDoc(noteRef, updatedData, { merge: true })
  
  const updatedSnap = await getDoc(noteRef)
  const data = updatedSnap.data()!
  
  return {
    id: updatedSnap.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    lastModified: data.lastModified.toDate()
  } as Note
}

export async function deleteNote(noteId: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Authentication required')

  const noteRef = doc(db, 'notes', noteId)
  const noteSnap = await getDoc(noteRef)
  
  if (!noteSnap.exists()) {
    throw new Error('Note not found')
  }
  
  const noteData = noteSnap.data()
  if (noteData.createdBy !== user.uid) {
    throw new Error('Permission denied')
  }
  
  await deleteDoc(noteRef)
}

export async function getAllNotes(userId: string): Promise<Note[]> {
  const notesRef = collection(db, 'notes')
  const q = query(notesRef, where('createdBy', '==', userId), orderBy('lastModified', 'desc'))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      lastModified: data.lastModified.toDate()
    } as Note
  })
}

export async function getNoteById(noteId: string): Promise<Note | null> {
  const noteRef = doc(db, 'notes', noteId)
  const noteSnap = await getDoc(noteRef)
  
  if (!noteSnap.exists()) {
    return null
  }
  
  const data = noteSnap.data()
  return {
    id: noteSnap.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    lastModified: data.lastModified.toDate()
  } as Note
}

// Subscription management
export async function createSubscription(subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'usage'>): Promise<Subscription> {
  const user = auth.currentUser
  if (!user) throw new Error('Authentication required')

  const subscriptionsRef = collection(db, 'subscriptions')
  const subscriptionDoc = doc(subscriptionsRef)
  
  const now = new Date()
  const subscription: Subscription = {
    id: subscriptionDoc.id,
    ...subscriptionData,
    createdBy: user.uid,
    createdAt: now,
    usage: { lastAccessed: now, accessCount: 0 }
  }
  
  await setDoc(subscriptionDoc, {
    ...subscription,
    nextBilling: Timestamp.fromDate(subscription.nextBilling),
    trialEnd: subscription.trialEnd ? Timestamp.fromDate(subscription.trialEnd) : null,
    createdAt: Timestamp.fromDate(subscription.createdAt),
    'usage.lastAccessed': Timestamp.fromDate(subscription.usage.lastAccessed)
  })
  
  return subscription
}

export async function updateSubscription(subscriptionId: string, updates: Partial<Omit<Subscription, 'id' | 'createdBy' | 'createdAt'>>): Promise<Subscription> {
  const user = auth.currentUser
  if (!user) throw new Error('Authentication required')

  const subscriptionRef = doc(db, 'subscriptions', subscriptionId)
  const subscriptionSnap = await getDoc(subscriptionRef)
  
  if (!subscriptionSnap.exists()) {
    throw new Error('Subscription not found')
  }
  
  const existingSubscription = subscriptionSnap.data()
  if (existingSubscription.createdBy !== user.uid) {
    throw new Error('Permission denied')
  }
  
  const updatedData: any = { ...updates }
  if (updates.nextBilling) {
    updatedData.nextBilling = Timestamp.fromDate(new Date(updates.nextBilling))
  }
  if (updates.trialEnd) {
    updatedData.trialEnd = Timestamp.fromDate(new Date(updates.trialEnd))
  } else if (updates.trialEnd === undefined) {
    updatedData.trialEnd = null
  }
  
  await setDoc(subscriptionRef, updatedData, { merge: true })
  
  const updatedSnap = await getDoc(subscriptionRef)
  const data = updatedSnap.data()!
  
  return {
    id: updatedSnap.id,
    ...data,
    nextBilling: data.nextBilling.toDate(),
    trialEnd: data.trialEnd ? data.trialEnd.toDate() : undefined,
    createdAt: data.createdAt.toDate()
  } as Subscription
}

export async function deleteSubscription(subscriptionId: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Authentication required')

  const subscriptionRef = doc(db, 'subscriptions', subscriptionId)
  const subscriptionSnap = await getDoc(subscriptionRef)
  
  if (!subscriptionSnap.exists()) {
    throw new Error('Subscription not found')
  }
  
  const subscriptionData = subscriptionSnap.data()
  if (subscriptionData.createdBy !== user.uid) {
    throw new Error('Permission denied')
  }
  
  await deleteDoc(subscriptionRef)
}

export async function getAllSubscriptions(userId: string): Promise<Subscription[]> {
  const subscriptionsRef = collection(db, 'subscriptions')
  const q = query(subscriptionsRef, where('createdBy', '==', userId), orderBy('nextBilling', 'asc'))
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      nextBilling: data.nextBilling.toDate(),
      trialEnd: data.trialEnd ? data.trialEnd.toDate() : undefined,
      createdAt: data.createdAt.toDate()
    } as Subscription
  })
}

export async function getSubscriptionById(subscriptionId: string): Promise<Subscription | null> {
  const subscriptionRef = doc(db, 'subscriptions', subscriptionId)
  const subscriptionSnap = await getDoc(subscriptionRef)
  
  if (!subscriptionSnap.exists()) {
    return null
  }
  
  const data = subscriptionSnap.data()
  return {
    id: subscriptionSnap.id,
    ...data,
    nextBilling: data.nextBilling.toDate(),
    trialEnd: data.trialEnd ? data.trialEnd.toDate() : undefined,
    createdAt: data.createdAt.toDate()
  } as Subscription
}

// Calendar event management
export async function createCalendarEvent(eventData: Omit<CalendarEvent, 'id' | 'createdBy'>): Promise<CalendarEvent> {
  const user = auth.currentUser
  if (!user) throw new Error('Authentication required')

  const eventsRef = collection(db, 'calendar-events')
  const eventDoc = doc(eventsRef)
  
  const event: CalendarEvent = {
    id: eventDoc.id,
    ...eventData,
    createdBy: user.uid
  }
  
  await setDoc(eventDoc, {
    ...event,
    start: Timestamp.fromDate(event.start),
    end: Timestamp.fromDate(event.end),
    reminders: event.reminders?.map(reminder => ({
      ...reminder,
      time: Timestamp.fromDate(reminder.time)
    })) || []
  })
  
  return event
}

export async function updateCalendarEvent(eventId: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdBy'>>): Promise<CalendarEvent> {
  const user = auth.currentUser
  if (!user) throw new Error('Authentication required')

  const eventRef = doc(db, 'calendar-events', eventId)
  const eventSnap = await getDoc(eventRef)
  
  if (!eventSnap.exists()) {
    throw new Error('Calendar event not found')
  }
  
  const existingEvent = eventSnap.data()
  if (existingEvent.createdBy !== user.uid && !existingEvent.attendees?.includes(user.uid)) {
    throw new Error('Permission denied')
  }
  
  const updatedData: any = { ...updates }
  if (updates.start) {
    updatedData.start = Timestamp.fromDate(new Date(updates.start))
  }
  if (updates.end) {
    updatedData.end = Timestamp.fromDate(new Date(updates.end))
  }
  if (updates.reminders) {
    updatedData.reminders = updates.reminders.map(reminder => ({
      ...reminder,
      time: Timestamp.fromDate(new Date(reminder.time))
    }))
  }
  
  await setDoc(eventRef, updatedData, { merge: true })
  
  const updatedSnap = await getDoc(eventRef)
  const data = updatedSnap.data()!
  
  return {
    id: updatedSnap.id,
    ...data,
    start: data.start.toDate(),
    end: data.end.toDate(),
    reminders: data.reminders?.map((reminder: any) => ({
      ...reminder,
      time: reminder.time.toDate()
    })) || []
  } as CalendarEvent
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Authentication required')

  const eventRef = doc(db, 'calendar-events', eventId)
  const eventSnap = await getDoc(eventRef)
  
  if (!eventSnap.exists()) {
    throw new Error('Calendar event not found')
  }
  
  const eventData = eventSnap.data()
  if (eventData.createdBy !== user.uid && !eventData.attendees?.includes(user.uid)) {
    throw new Error('Permission denied')
  }
  
  await deleteDoc(eventRef)
}

export async function getAllCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
  const eventsRef = collection(db, 'calendar-events')
  let q = query(
    eventsRef, 
    where('attendees', 'array-contains', userId),
    orderBy('start', 'asc')
  )
  
  // Add date range filtering if provided
  if (startDate) {
    q = query(q, where('start', '>=', Timestamp.fromDate(startDate)))
  }
  if (endDate) {
    q = query(q, where('start', '<=', Timestamp.fromDate(endDate)))
  }
  
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      start: data.start.toDate(),
      end: data.end.toDate(),
      reminders: data.reminders?.map((reminder: any) => ({
        ...reminder,
        time: reminder.time.toDate()
      })) || []
    } as CalendarEvent
  })
}

export async function getCalendarEventById(eventId: string): Promise<CalendarEvent | null> {
  const eventRef = doc(db, 'calendar-events', eventId)
  const eventSnap = await getDoc(eventRef)
  
  if (!eventSnap.exists()) {
    return null
  }
  
  const data = eventSnap.data()
  return {
    id: eventSnap.id,
    ...data,
    start: data.start.toDate(),
    end: data.end.toDate(),
    reminders: data.reminders?.map((reminder: any) => ({
      ...reminder,
      time: reminder.time.toDate()
    })) || []
  } as CalendarEvent
}

export async function getTodaysEvents(userId: string): Promise<CalendarEvent[]> {
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  
  return getAllCalendarEvents(userId, startOfDay, endOfDay)
}

export async function getUpcomingEvents(userId: string, days: number = 7): Promise<CalendarEvent[]> {
  const today = new Date()
  const endDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000))
  
  return getAllCalendarEvents(userId, today, endDate)
}