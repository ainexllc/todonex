import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth'
import { User, UserPreferences } from '@/types'
import { auth } from '@/lib/firebase'

interface AuthState {
  // State
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  initialized: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setFirebaseUser: (user: FirebaseUser | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  logout: () => void
  signOut: () => Promise<void>
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  colorMode: 'default',
  layout: 'comfortable',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    push: true,
    sms: false,
    taskReminders: true,
    billReminders: true,
    subscriptionAlerts: true,
  },
  dataSync: 'wifi-only'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      loading: true,
      initialized: false,

      setUser: (user) => set({ user }),
      
      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
      
      setLoading: (loading) => set({ loading }),
      
      setInitialized: (initialized) => set({ initialized }),
      
      updateUserPreferences: (preferences) => {
        const { user } = get()
        if (user) {
          set({
            user: {
              ...user,
              preferences: {
                ...user.preferences,
                ...preferences
              }
            }
          })
        }
      },
      
      logout: () => set({ 
        user: null, 
        firebaseUser: null, 
        loading: false,
        initialized: true 
      }),

      signOut: async () => {
        try {
          set({ loading: true })
          
          // Sign out from Firebase
          await firebaseSignOut(auth)
          
          // Clear local state
          set({ 
            user: null, 
            firebaseUser: null, 
            loading: false,
            initialized: true 
          })
          
          console.log('Successfully signed out')
        } catch (error) {
          console.error('Error signing out:', error)
          set({ loading: false })
          throw error
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        // Don't persist loading or initialized state to prevent hydration issues
      }),
      // Add onRehydrateStorage to handle hydration properly
      onRehydrateStorage: () => (state) => {
        console.log('Auth store hydrated:', state)
        // Ensure loading and initialized states are reset after hydration
        if (state) {
          state.loading = true
          state.initialized = false
        }
      },
    }
  )
)