'use client'

import { useEffect, ReactNode } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useAuthStore } from '@/store/auth-store'
import { User } from '@/types'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setFirebaseUser, setLoading, setInitialized } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true)
      setFirebaseUser(firebaseUser)

      if (firebaseUser) {
        try {
          // Get user document from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            // User document exists, set user data
            const userData = userDoc.data() as User
            setUser(userData)
          } else {
            // Create new user document
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL,
              role: 'user',
              preferences: {
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
              },
              createdAt: new Date(),
              lastLoginAt: new Date()
            }

            await setDoc(userDocRef, newUser)
            setUser(newUser)
          }
        } catch (error) {
          console.error('Error loading user data:', error)
          // Still set basic user info even if Firestore fails
          const basicUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL,
            role: 'user',
            preferences: {
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
            },
            createdAt: new Date(),
            lastLoginAt: new Date()
          }
          setUser(basicUser)
        }
      } else {
        // User is signed out
        setUser(null)
      }

      setLoading(false)
      setInitialized(true)
    })

    return () => unsubscribe()
  }, [setUser, setFirebaseUser, setLoading, setInitialized])

  return <>{children}</>
}