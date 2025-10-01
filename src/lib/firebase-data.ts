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

// Helper function to remove undefined values from an object (deep clean)
function removeUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {}
  for (const key in obj) {
    const value = obj[key]

    // Skip undefined values
    if (value === undefined) {
      continue
    }

    // Handle arrays (recursively clean each item)
    if (Array.isArray(value)) {
      cleaned[key] = value.map(item => {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          return removeUndefinedFields(item)
        }
        return item
      }).filter(item => item !== undefined)
    }
    // Handle nested objects (recursively clean)
    else if (typeof value === 'object' && value !== null && !(value instanceof Date) && !(value instanceof Timestamp)) {
      cleaned[key] = removeUndefinedFields(value)
    }
    // Handle primitive values
    else {
      cleaned[key] = value
    }
  }
  return cleaned
}

// Generic CRUD operations
export async function createDocument<T extends Record<string, any>>(
  collectionName: string,
  id: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  if (!auth.currentUser) throw new Error('Not authenticated')

  console.log('createDocument: Creating document in', collectionName, 'with ID:', id)
  console.log('createDocument: Current user:', auth.currentUser.uid)

  // Clean the data to remove undefined fields
  const cleanedData = removeUndefinedFields(data)

  const docData = {
    ...cleanedData,
    id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: auth.currentUser.uid,
    familyId: auth.currentUser.uid // For now, user ID is family ID
  }

  console.log('createDocument: Document data:', docData)

  try {
    // Clean the document data to remove any undefined fields
    const cleanedDocData = removeUndefinedFields(docData)
    console.log('createDocument: Cleaned document data:', cleanedDocData)

    await setDoc(doc(db, collectionName, id), cleanedDocData)
    console.log('createDocument: Document created successfully in Firestore')

    // Verify the document was created
    const verifyDoc = await getDoc(doc(db, collectionName, id))
    if (verifyDoc.exists()) {
      console.log('createDocument: Verified - document exists with ID:', id)
    } else {
      console.error('createDocument: WARNING - Document not found after creation!')
    }
  } catch (error) {
    console.error('createDocument: Failed to create document:', error)
    throw error
  }
}

export async function updateDocument<T extends Record<string, any>>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  // Clean the data to remove undefined fields
  const cleanedData = removeUndefinedFields(data)

  const docData = {
    ...cleanedData,
    updatedAt: serverTimestamp()
  }

  // Clean again to ensure no undefined values slip through
  const cleanedDocData = removeUndefinedFields(docData)

  await setDoc(doc(db, collectionName, id), cleanedDocData, { merge: true })
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
  if (!auth.currentUser) {
    console.log('getUserDocuments: No current user')
    return []
  }

  console.log('getUserDocuments: Querying', collectionName, 'for user:', auth.currentUser.uid)

  try {
    const q = query(
      collection(db, collectionName),
      where('familyId', '==', auth.currentUser.uid),
      orderBy(orderByField, 'desc')
    )

    const querySnapshot = await getDocs(q)
    console.log('getUserDocuments: Found', querySnapshot.docs.length, 'documents in', collectionName)
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      console.log('Document data:', doc.id, data)

      // Convert nested task dates if this is a taskList document
      if (data.tasks && Array.isArray(data.tasks)) {
        data.tasks = data.tasks.map((task: any) => ({
          ...task,
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }))
      }

      // Helper to safely convert Timestamp to Date
      const safeToDate = (value: any) => {
        if (!value) return value
        if (typeof value?.toDate === 'function') {
          return value.toDate()
        }
        if (value instanceof Date) {
          return value
        }
        // If it's a string or number, try to convert
        if (typeof value === 'string' || typeof value === 'number') {
          return new Date(value)
        }
        return value
      }

      return {
        ...data,
        id: doc.id,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
        dueDate: safeToDate(data.dueDate)
      } as T
    })
  } catch (error) {
    // If index doesn't exist, try simpler query without ordering
    console.log('Falling back to simple query without ordering')
    const q = query(
      collection(db, collectionName),
      where('familyId', '==', auth.currentUser.uid)
    )

    const querySnapshot = await getDocs(q)
    const docs = querySnapshot.docs.map(doc => {
      const data = doc.data()

      // Convert nested task dates if this is a taskList document
      if (data.tasks && Array.isArray(data.tasks)) {
        data.tasks = data.tasks.map((task: any) => ({
          ...task,
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }))
      }

      // Helper to safely convert Timestamp to Date
      const safeToDate = (value: any) => {
        if (!value) return value
        if (typeof value?.toDate === 'function') {
          return value.toDate()
        }
        if (value instanceof Date) {
          return value
        }
        // If it's a string or number, try to convert
        if (typeof value === 'string' || typeof value === 'number') {
          return new Date(value)
        }
        return value
      }

      return {
        ...data,
        id: doc.id,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
        dueDate: safeToDate(data.dueDate)
      } as T
    })

    // Sort in memory by the requested field
    return docs.sort((a: any, b: any) => {
      const aValue = a[orderByField]
      const bValue = b[orderByField]
      if (!aValue || !bValue) return 0
      return bValue.getTime() - aValue.getTime()
    })
  }
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

      // Convert nested task dates if this is a taskList document
      if (data.tasks && Array.isArray(data.tasks)) {
        data.tasks = data.tasks.map((task: any) => ({
          ...task,
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }))
      }

      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate
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

