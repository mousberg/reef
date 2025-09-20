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
import { doc, setDoc, updateDoc, getDoc, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore'
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

interface Project {
  id: string
  name: string
  description: string
  createdAt: any
  updatedAt: any
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, firstName?: string, lastName?: string, termsAccepted?: boolean, marketingAccepted?: boolean) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  getUserData: (uid: string) => Promise<UserData | null>
  getUserProjects: (uid: string) => Promise<Project[]>
  createProject: (uid: string, name: string, description: string) => Promise<string>
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

  const getUserProjects = async (uid: string): Promise<Project[]> => {
    try {
      const projectsRef = collection(firestore, 'users', uid, 'projects')
      const snapshot = await getDocs(projectsRef)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[]
    } catch (error) {
      console.error('Failed to get user projects:', error)
      return []
    }
  }

  const createProject = async (uid: string, name: string, description: string): Promise<string> => {
    try {
      const projectsRef = collection(firestore, 'users', uid, 'projects')
      const docRef = await addDoc(projectsRef, {
        name,
        description,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    getUserData,
    getUserProjects,
    createProject
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}