'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Mail, Lock, User, Chrome } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthFormProps {
  mode?: 'signin' | 'signup'
}

export function AuthForm({ mode: initialMode = 'signin' }: AuthFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const { setUser } = useAuthStore()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let userCredential
      
      if (mode === 'signin') {
        userCredential = await signInWithEmailAndPassword(auth, email, password)
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Update profile with display name
        if (displayName) {
          await updateProfile(userCredential.user, { displayName })
        }
      }

      // Create user document in Firestore for new users
      if (mode === 'signup') {
        const userDoc = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          displayName: displayName || userCredential.user.email?.split('@')[0] || 'User',
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
              billReminders: true,
              subscriptionAlerts: true,
            },
            dataSync: 'wifi-only' as const
          },
          createdAt: new Date(),
          lastLoginAt: new Date()
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)
        setUser(userDoc)
      }

      router.push('/')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError('')

    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      
      // Create or update user document
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
            billReminders: true,
            subscriptionAlerts: true,
          },
          dataSync: 'wifi-only' as const
        },
        createdAt: new Date(),
        lastLoginAt: new Date()
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), userDoc, { merge: true })
      setUser(userDoc)

      router.push('/')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card glass className="w-full max-w-md mx-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
      
      <CardHeader className="relative text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">HomeKeep</h1>
        </div>
        
        <div className="space-y-2">
          <CardTitle className="text-xl">
            {mode === 'signin' ? 'Welcome back' : 'Get started'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'signin' 
              ? 'Sign in to your adaptive home hub'
              : 'Create your personalized home management account'
            }
          </p>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Google Sign In */}
        <Button
          variant="outline"
          size="touch"
          className="w-full glass-effect hover:bg-white/20 dark:hover:bg-black/20"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-glass/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Full name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-lg",
                  "bg-white/10 dark:bg-black/10 backdrop-blur-sm",
                  "border border-glass/50 focus:border-primary",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                  "min-touch"
                )}
                required={mode === 'signup'}
                disabled={loading}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-lg",
                "bg-white/10 dark:bg-black/10 backdrop-blur-sm",
                "border border-glass/50 focus:border-primary",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                "min-touch"
              )}
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-lg",
                "bg-white/10 dark:bg-black/10 backdrop-blur-sm",
                "border border-glass/50 focus:border-primary",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                "min-touch"
              )}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <Button 
            type="submit" 
            size="touch" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-4 border-t border-glass/50">
          <p className="text-sm text-muted-foreground">
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            disabled={loading}
            className="text-primary hover:text-primary/80"
          >
            {mode === 'signin' ? 'Create one here' : 'Sign in instead'}
          </Button>
        </div>

        {/* Features Preview for New Users */}
        {mode === 'signup' && (
          <div className="rounded-lg bg-white/5 dark:bg-black/5 p-4 space-y-2">
            <h4 className="text-sm font-medium">What you'll get:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Adaptive dashboard that learns your habits</li>
              <li>• Smart task and bill management</li>
              <li>• Recipe organization and meal planning</li>
              <li>• Family-friendly collaboration tools</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}