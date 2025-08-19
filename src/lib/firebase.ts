import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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