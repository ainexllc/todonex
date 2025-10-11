import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  User as FirebaseUser,
  AuthError,
  browserPopupRedirectResolver
} from 'firebase/auth'
import { auth } from './firebase'

// Create Google provider instance
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

// Environment detection for auth method selection
const isLocalhost = () => {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost')
}

// Check if we're in a popup-friendly environment
const canUsePopup = () => {
  if (typeof window === 'undefined') return false
  
  // Use popup for both localhost AND production (like HabitTracker)
  // Modern browsers generally allow popups for user-initiated actions
  return true
}

export interface AuthResult {
  user: FirebaseUser | null
  error?: string
}

// Enhanced Google Sign-In with popup method (like HabitTracker)
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver)
    return { user: userCredential.user }
    
  } catch (error) {
    // If popup fails, provide helpful error message
    const authError = error as AuthError
    if (authError.code === 'auth/popup-blocked') {
      return { 
        user: null, 
        error: 'Please allow popups for this site and try again. You may need to check your browser\'s popup blocker settings.' 
      }
    }
    
    return { 
      user: null, 
      error: getAuthErrorMessage(authError) 
    }
  }
}

// Improved error message handling
function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups and try again, or we\'ll use redirect method.'
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.'
    case 'auth/cancelled-popup-request':
      return 'Another sign-in popup is already open.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Please contact support.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google sign-in.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/user-not-found':
      return 'No account found with this email address.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/invalid-email':
      return 'Invalid email address format.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
    case 'auth/internal-error':
      return 'Internal error occurred. Please try again.'
    default:
      // Preserve full error message for troubleshooting without logging
      return error.message || 'An unexpected error occurred. Please try again.'
  }
}

// Handle redirect result on page load
export async function handleRedirectResult(): Promise<AuthResult> {
  try {
    const result = await getRedirectResult(auth)
    if (result) {
      return { user: result.user }
    }
    return { user: null }
  } catch (error) {
    return { 
      user: null, 
      error: getAuthErrorMessage(error as AuthError) 
    }
  }
}

// Enhanced sign-in with automatic fallback
export async function signInWithGoogleEnhanced(): Promise<AuthResult> {
  try {
    // First attempt: popup method
    if (canUsePopup()) {
      const result = await signInWithGoogle()
      
      // If popup was blocked, fallback to redirect
      if (result.error?.includes('popup')) {
        await signInWithRedirect(auth, googleProvider)
        return { user: null } // Will redirect away
      }
      
      return result
    } else {
      // Use redirect method directly
      return await signInWithGoogle()
    }
  } catch (error) {
    return { 
      user: null, 
      error: getAuthErrorMessage(error as AuthError) 
    }
  }
}

// Environment info for debugging
export function getAuthEnvironmentInfo() {
  if (typeof window === 'undefined') {
    return { environment: 'server-side' }
  }
  
  return {
    environment: isLocalhost() ? 'localhost' : 'production',
    hostname: window.location.hostname,
    canUsePopup: canUsePopup(),
    userAgent: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
               navigator.userAgent.includes('Firefox') ? 'Firefox' : 
               navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'
  }
}
