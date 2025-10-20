'use client'

import { useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { signInWithGoogle } from '@/lib/auth'
import { useAuthStore } from '@/store/auth-store'
import { useAuthRedirect } from '@/hooks/use-auth-redirect'
import { Button } from '@/components/ui/button'
import { Sparkles, Mail, Lock, Chrome, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthFormProps {
  mode?: 'signin' | 'signup'
}

export function AuthForm({ mode: initialMode = 'signin' }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  
  const { setUser } = useAuthStore()

  // Use centralized authentication redirect hook
  useAuthRedirect()

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()
      if (!trimmedEmail || !trimmedPassword) {
        throw new Error('Enter an email and password to continue.')
      }
      if (trimmedPassword.length < 6) {
        throw new Error('Password must be at least 6 characters.')
      }

      let userCredential

      if (mode === 'signin') {
        userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword)
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword)
        await updateProfile(userCredential.user, {
          displayName: userCredential.user.email?.split('@')[0] ?? ''
        })
      }

      // Create user document in Firestore for new users
      if (mode === 'signup') {
        const userDoc = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
          photoURL: userCredential.user.photoURL,
          role: 'user' as const,
          preferences: {
            theme: 'system' as const,
            colorMode: 'default' as const,
            layout: 'comfortable' as const,
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            notifications: {
              email: true,
              push: true,
              sms: false,
              taskReminders: true,
            },
            dataSync: 'wifi-only' as const
          },
          createdAt: new Date(),
          lastLoginAt: new Date()
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)
        setUser(userDoc)
      }

    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      const result = await signInWithGoogle()

      if (result.user && !result.error) {
        // Create or update user document
        const userDoc = {
          id: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          photoURL: result.user.photoURL,
          role: 'user' as const,
          preferences: {
            theme: 'system' as const,
            colorMode: 'default' as const,
            layout: 'comfortable' as const,
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            notifications: {
              email: true,
              push: true,
              sms: false,
              taskReminders: true,
            },
            dataSync: 'wifi-only' as const
          },
          createdAt: new Date(),
          lastLoginAt: new Date()
        }

        await setDoc(doc(db, 'users', result.user.uid), userDoc, { merge: true })
        setUser(userDoc)

      } else {
        setError(result.error || 'Google sign-in failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign-in')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-orange-500/20 bg-black/70 p-6 shadow-[0_20px_60px_-25px_rgba(249,115,22,0.35)] backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">Access</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            {mode === 'signin' ? 'Get into your workspace' : 'Start your TodoNex HQ'}
          </h2>
        </div>
        <Sparkles className="h-6 w-6 text-orange-500" />
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Email
          <span className="mt-2 flex items-center gap-2 rounded-2xl bg-black/90 px-4 py-3 transition focus-within:ring-1 focus-within:ring-orange-400">
            <Mail className="h-4 w-4 text-white" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@company.com"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              required
            />
          </span>
        </label>

        <label className="block text-sm font-medium text-gray-300">
          Password
          <span className="mt-2 flex items-center gap-2 rounded-2xl bg-black/90 px-4 py-3 transition focus-within:ring-1 focus-within:ring-orange-400">
            <Lock className="h-4 w-4 text-white" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder="At least 6 characters"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              minLength={6}
              required
            />
          </span>
        </label>

        {error && <p className="text-sm font-medium text-orange-300/90">{error}</p>}

        <Button
          type="submit"
          size="lg"
          className={cn(
            'group inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-80',
            loading && 'cursor-not-allowed opacity-80'
          )}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          )}
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        className="mt-6 text-sm text-gray-400 transition hover:text-white"
        disabled={loading || googleLoading}
      >
        {mode === 'signin'
          ? 'Need an account? Create one in seconds.'
          : 'Have an account already? Sign in instead.'}
      </button>

      <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-gray-500">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        <span>or</span>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleGoogleAuth}
        disabled={googleLoading || loading}
        className={cn(
          'mt-4 flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-400 hover:bg-orange-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-80'
        )}
      >
        {googleLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        <Chrome className="h-4 w-4 text-orange-300" />
        Continue with Google
      </Button>
    </div>
  )
}
