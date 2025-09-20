"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, firestore } from '../lib/firebase'

interface UserData {
  firstName: string
  lastName: string
  email: string
  lastLoggedIn: any
  lastLoggedInIp: string
  termsAccepted: boolean
  marketingAccepted: boolean
  createdAt: any
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, firstName?: string, lastName?: string, termsAccepted?: boolean, marketingAccepted?: boolean) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  getUserData: (uid: string) => Promise<UserData | null>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('Failed to get user IP:', error)
    return 'unknown'
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string, termsAccepted = false, marketingAccepted = false) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    
    if (result.user) {
      const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || ''
      if (displayName) {
        await updateProfile(result.user, { displayName })
      }
      
      const userDocRef = doc(firestore, 'users', result.user.uid)
      await setDoc(userDocRef, {
        firstName: firstName || '',
        lastName: lastName || '',
        email: result.user.email,
        lastLoggedIn: serverTimestamp(),
        lastLoggedInIp: await getUserIP(),
        termsAccepted,
        marketingAccepted,
        createdAt: serverTimestamp()
      })
    }
  }

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    
    if (result.user) {
      const userDocRef = doc(firestore, 'users', result.user.uid)
      await updateDoc(userDocRef, {
        lastLoggedIn: serverTimestamp(),
        lastLoggedInIp: await getUserIP()
      })
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const getUserData = async (uid: string): Promise<UserData | null> => {
    try {
      const userDocRef = doc(firestore, 'users', uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        return userDoc.data() as UserData
      }
      return null
    } catch (error) {
      console.error('Failed to get user data:', error)
      return null
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    getUserData
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}