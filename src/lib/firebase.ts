import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:demo123',
}

// Debug environment variables
console.log('=== Firebase Environment Variables Debug ===')
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'LOADED' : 'MISSING')
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'LOADED' : 'MISSING')
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'LOADED' : 'MISSING')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('Firebase config loaded:', { 
  apiKey: firebaseConfig.apiKey ? 'SET' : 'MISSING', 
  authDomain: firebaseConfig.authDomain ? 'SET' : 'MISSING', 
  projectId: firebaseConfig.projectId ? 'SET' : 'MISSING' 
})

// Validate Firebase configuration only in browser
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

// Only validate in browser environment where Firebase will actually be used
if (typeof window !== 'undefined') {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  if (missingVars.length > 0) {
    console.error('Missing Firebase environment variables:', missingVars)
    // Only throw if we're using demo config in production
    if (process.env.NODE_ENV === 'production' && firebaseConfig.apiKey === 'demo-api-key') {
      throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`)
    }
  }
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Connect to emulators in development (only if explicitly enabled)
if (process.env.NODE_ENV === 'development' && process.env.USE_FIREBASE_EMULATOR === 'true' && typeof window !== 'undefined') {
  // Only connect to emulators if not already connected
  try {
    // @ts-expect-error - Accessing internal Auth properties for emulator check
    if (!auth.config?.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099')
    }
  } catch {
    console.log('Auth emulator already connected')
  }

  try {
    // @ts-expect-error - Accessing internal Firestore properties
    if (!db._delegate._databaseId.projectId.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080)
    }
  } catch {
    console.log('Firestore emulator already connected')
  }

  try {
    if (!storage.app.options.storageBucket?.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199)
    }
  } catch {
    console.log('Storage emulator already connected')
  }
}

export default app