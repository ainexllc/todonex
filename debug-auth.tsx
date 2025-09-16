'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export function DebugAuth() {
  const [status, setStatus] = useState<string[]>([])
  
  const addStatus = (message: string) => {
    console.log(`[DEBUG AUTH] ${message}`)
    setStatus(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }
  
  useEffect(() => {
    addStatus('Starting debug authentication test...')
    
    // Test 1: Check Firebase auth object
    try {
      addStatus(`Firebase auth object: ${auth ? 'Available' : 'Missing'}`)
      addStatus(`Auth app name: ${auth?.app?.name || 'Unknown'}`)
      addStatus(`Auth currentUser: ${auth?.currentUser ? 'Logged in' : 'Not logged in'}`)
    } catch (error) {
      addStatus(`Error checking auth object: ${error}`)
    }
    
    // Test 2: Set up auth state listener
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        addStatus(`Auth state changed: ${user ? `User ${user.uid}` : 'No user'}`)
      })
      
      // Test 3: Force timeout
      setTimeout(() => {
        addStatus('5 second timeout reached - auth listener should have fired by now')
      }, 5000)
      
      return unsubscribe
    } catch (error) {
      addStatus(`Error setting up auth listener: ${error}`)
    }
  }, [])
  
  return (
    <div className="p-4 bg-gray-100 max-w-2xl mx-auto">
      <h2 className="font-bold mb-4">Firebase Auth Debug</h2>
      <div className="space-y-1 text-sm font-mono">
        {status.map((msg, i) => (
          <div key={i} className="text-xs">{msg}</div>
        ))}
      </div>
    </div>
  )
}