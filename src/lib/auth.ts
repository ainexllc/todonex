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
  
  // Always use popup on localhost for better dev experience
  if (isLocalhost()) return true
  
  // Check if popup is supported
  try {
    const popup = window.open('', '_blank', 'width=1,height=1')
    if (popup) {
      popup.close()
      return true
    }
    return false
  } catch {
    return false
  }
}

export interface AuthResult {
  user: FirebaseUser | null
  error?: string
}

// Enhanced Google Sign-In with environment detection
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    let userCredential
    
    if (canUsePopup()) {
      // Use popup method (localhost and supported environments)
      console.log('Using popup authentication method')
      userCredential = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver)
    } else {
      // Use redirect method (production and popup-blocked environments)
      console.log('Using redirect authentication method')
      
      // Check if we're returning from a redirect
      const redirectResult = await getRedirectResult(auth)
      if (redirectResult) {
        return { user: redirectResult.user }
      }
      
      // Initiate redirect
      await signInWithRedirect(auth, googleProvider)
      // This will redirect away, so we won't reach this point
      return { user: null }
    }
    
    return { user: userCredential.user }
    
  } catch (error) {
    console.error('Google Sign-In Error:', error)
    return { 
      user: null, 
      error: getAuthErrorMessage(error as AuthError) 
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
      // Log unknown errors for debugging
      console.error('Unknown auth error:', error.code, error.message)
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
    console.error('Redirect result error:', error)
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
        console.log('Popup blocked, falling back to redirect method')
        await signInWithRedirect(auth, googleProvider)
        return { user: null } // Will redirect away
      }
      
      return result
    } else {
      // Use redirect method directly
      return await signInWithGoogle()
    }
  } catch (error) {
    console.error('Enhanced Google Sign-In Error:', error)
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