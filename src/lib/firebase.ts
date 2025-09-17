import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Validate required environment variables
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`)

if (missingVars.length > 0) {
  const error = `Missing required Firebase environment variables: ${missingVars.join(', ')}`
  if (typeof window !== 'undefined') {
    console.error(error)
    throw new Error(error)
  }
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey!,
  authDomain: requiredEnvVars.authDomain!,
  projectId: requiredEnvVars.projectId!,
  storageBucket: requiredEnvVars.storageBucket!,
  messagingSenderId: requiredEnvVars.messagingSenderId!,
  appId: requiredEnvVars.appId!,
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

// Environment variables validated above - all required vars are loaded

// Initialize Firebase
console.log('Initializing Firebase app...')
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
console.log('Firebase app initialized:', app.name)

// Initialize Firebase services
console.log('Initializing Firebase services...')
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
console.log('Firebase services initialized successfully')

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