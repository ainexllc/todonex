'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Mail, Lock, User, Chrome, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
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
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [nameError, setNameError] = useState('')
  
  const router = useRouter()
  const { setUser } = useAuthStore()

  // Use centralized authentication redirect hook
  useAuthRedirect()

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) return 'Email is required'
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required'
    if (password.length < 6) return 'Password must be at least 6 characters'
    if (mode === 'signup' && password.length < 8) return 'Password should be at least 8 characters for better security'
    return ''
  }

  const validateName = (name: string) => {
    if (mode === 'signup' && !name.trim()) return 'Name is required'
    if (name.length > 50) return 'Name must be less than 50 characters'
    return ''
  }

  // Real-time validation
  const handleEmailChange = (value: string) => {
    setEmail(value)
    setEmailError(validateEmail(value))
    setError('')
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordError(validatePassword(value))
    setError('')
  }

  const handleNameChange = (value: string) => {
    setDisplayName(value)
    setNameError(validateName(value))
    setError('')
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const passwordStrengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const passwordStrengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate all fields
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    const nameErr = validateName(displayName)

    setEmailError(emailErr)
    setPasswordError(passwordErr)
    setNameError(nameErr)

    if (emailErr || passwordErr || nameErr) {
      setLoading(false)
      return
    }

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
            },
            dataSync: 'wifi-only' as const
          },
          createdAt: new Date(),
          lastLoginAt: new Date()
        }

        await setDoc(doc(db, 'users', userCredential.user.uid), userDoc)
        setUser(userDoc)
      }

      // Show success message
      setSuccess(mode === 'signin' ? 'Welcome back!' : 'Account created successfully!')
      console.log('Email auth success - auth redirect hook will handle navigation')
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
      console.log('Starting Google auth...')
      const result = await signInWithGoogle()
      console.log('Google auth result:', { user: !!result.user, error: result.error })

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

        console.log('Creating/updating user document in Firestore...')
        await setDoc(doc(db, 'users', result.user.uid), userDoc, { merge: true })
        setUser(userDoc)

        console.log('Google auth success - auth redirect hook will handle navigation')
        setSuccess('Successfully signed in with Google!')
      } else {
        setError(result.error || 'Google sign-in failed')
      }
    } catch (err: any) {
      console.error('Google auth error:', err)
      setError(err.message || 'An error occurred during Google sign-in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border border-gray-700 bg-gray-800 text-white">
      <CardHeader className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">NextTaskPro</h1>
        </div>

        <div className="space-y-2">
          <CardTitle className="text-xl text-white">
            {mode === 'signin' ? 'Welcome back' : 'Get started'}
          </CardTitle>
          <p className="text-sm text-gray-300">
            {mode === 'signin'
              ? 'Sign in to your adaptive home hub'
              : 'Create your personalized home management account'
            }
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          </div>
        )}

        {/* Google Sign In */}
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "w-full border-gray-600 bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300 hover:shadow-md",
            loading && "cursor-not-allowed opacity-50"
          )}
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              <span className="text-white">Connecting...</span>
            </div>
          ) : (
            <>
              <Chrome className="mr-2 h-4 w-4 text-white" />
              <span className="text-white">Continue with Google</span>
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-800 px-2 text-gray-400">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={displayName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-lg transition-colors",
                    "bg-gray-700 text-white placeholder:text-gray-400 border-gray-600",
                    nameError
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                      : "focus:border-blue-500 focus:ring-blue-500",
                    "focus:outline-none focus:ring-2"
                  )}
                  required={mode === 'signup'}
                  disabled={loading}
                />
              </div>
              {nameError && (
                <p className="text-xs text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-3 rounded-lg transition-colors",
                  "bg-gray-700 text-white placeholder:text-gray-400 border-gray-600",
                  emailError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                    : email && !emailError
                    ? "border-green-400 focus:border-green-500 focus:ring-green-500"
                    : "focus:border-blue-500 focus:ring-blue-500",
                  "focus:outline-none focus:ring-2"
                )}
                required
                disabled={loading}
              />
              {email && !emailError && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {emailError && (
              <p className="text-xs text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-12 py-3 rounded-lg transition-colors",
                  "bg-gray-700 text-white placeholder:text-gray-400 border-gray-600",
                  passwordError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                    : password && !passwordError
                    ? "border-green-400 focus:border-green-500 focus:ring-green-500"
                    : "focus:border-blue-500 focus:ring-blue-500",
                  "focus:outline-none focus:ring-2"
                )}
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {passwordError && (
              <p className="text-xs text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{passwordError}</span>
              </p>
            )}

            {/* Password Strength Indicator for Signup */}
            {mode === 'signup' && password && !passwordError && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Password strength:</span>
                  <span className={cn(
                    "text-xs font-medium",
                    passwordStrength < 2 ? "text-red-400" :
                    passwordStrength < 3 ? "text-orange-400" :
                    passwordStrength < 4 ? "text-yellow-400" :
                    passwordStrength < 5 ? "text-blue-400" : "text-green-400"
                  )}>
                    {passwordStrengthLabels[passwordStrength]}
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        i < passwordStrength + 1
                          ? passwordStrengthColors[passwordStrength]
                          : "bg-gray-200 dark:bg-gray-700"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Remember Me & Terms */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-gray-300">Remember me</span>
            </label>
            {mode === 'signin' && (
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 hover:underline"
                disabled={loading}
              >
                Forgot password?
              </button>
            )}
          </div>

          {/* Terms for Signup */}
          {mode === 'signup' && (
            <div className="text-xs text-gray-400 space-y-2">
              <p>
                By creating an account, you agree to our{' '}
                <a href="/terms" className="text-blue-400 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className={cn(
              "w-full font-medium transition-all duration-300",
              success
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl",
              loading && "cursor-not-allowed"
            )}
            disabled={loading || (emailError || passwordError || nameError ? true : false)}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
              </div>
            ) : success ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Success! Redirecting...</span>
              </div>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-4 border-t border-gray-600">
          <p className="text-sm text-gray-400">
            {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            disabled={loading}
            className="text-blue-400 hover:text-blue-300"
          >
            {mode === 'signin' ? 'Create one here' : 'Sign in instead'}
          </Button>
        </div>

        {/* Features Preview for New Users */}
        {mode === 'signup' && (
          <div className="rounded-lg bg-gray-700/50 p-4 space-y-2">
            <h4 className="text-sm font-medium text-white">What you'll get:</h4>
            <ul className="text-xs text-gray-400 space-y-1">
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