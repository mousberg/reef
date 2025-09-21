"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import type {
  User
} from 'firebase/auth'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, updateDoc, getDoc, collection, addDoc, getDocs, serverTimestamp, deleteDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { auth, firestore, googleProvider } from '../lib/firebase'
import type { AgentTrace, AgentSpan } from '../types/traces'

interface UserData {
  firstName: string
  lastName: string
  email: string
  lastLoggedIn: Date | { toDate?: () => Date }
  lastLoggedInIp: string
  termsAccepted: boolean
  marketingAccepted: boolean
  createdAt: Date | { toDate?: () => Date }
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content?: string // For text content
  parts?: Array<{
    type: 'text' | 'tool-call' | 'tool-result'
    text?: string
    toolCallId?: string
    toolName?: string
    input?: any
    result?: any
  }>
  createdAt: any
  editedAt?: any
}

interface Agent {
  name: string
  task: string
  instructions: string
  connected_agents: string[]
  expected_input: string
  expected_output: string
  receives_from_user: boolean
  sends_to_user: boolean
  tools: string[]
}

interface WorkflowState {
  main_task: string
  relations: string
  agents: Record<string, Agent>
}

interface Project {
  id: string
  name: string
  createdAt: any
  updatedAt: any
  messages: Message[]
  workflowState: WorkflowState
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, firstName?: string, lastName?: string, termsAccepted?: boolean, marketingAccepted?: boolean) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  getUserData: (uid: string) => Promise<UserData | null>
  getUserProjects: (uid: string) => Promise<Project[]>
  createProject: (uid: string, name?: string) => Promise<string>
  getProjectById: (uid: string, projectId: string) => Promise<Project | null>
  subscribeToProject: (uid: string, projectId: string, callback: (project: Project | null) => void) => (() => void)
  updateProjectMessages: (uid: string, projectId: string, messages: Message[]) => Promise<void>
  updateProjectName: (uid: string, projectId: string, name: string) => Promise<void>
  updateProjectWorkflow: (uid: string, projectId: string, workflowState: WorkflowState) => Promise<void>
  deleteProject: (uid: string, projectId: string) => Promise<void>
  getAgentTraces: (uid: string, limitCount?: number) => Promise<AgentTrace[]>
  getAgentSpans: (uid: string, limitCount?: number) => Promise<AgentSpan[]>
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

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)

    if (result.user) {
      const userDocRef = doc(firestore, 'users', result.user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        const displayName = result.user.displayName || ''
        const nameParts = displayName.split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        await setDoc(userDocRef, {
          firstName,
          lastName,
          email: result.user.email,
          lastLoggedIn: serverTimestamp(),
          lastLoggedInIp: await getUserIP(),
          termsAccepted: false,
          marketingAccepted: false,
          createdAt: serverTimestamp()
        })
      } else {
        await updateDoc(userDocRef, {
          lastLoggedIn: serverTimestamp(),
          lastLoggedInIp: await getUserIP()
        })
      }
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

  const createProject = async (uid: string, name?: string): Promise<string> => {
    try {
      const projectsRef = collection(firestore, 'users', uid, 'projects')
      const defaultName = name || `New Project ${new Date().toLocaleDateString()}`
      const docRef = await addDoc(projectsRef, {
        name: defaultName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messages: []
      })
      return docRef.id
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }

  const getProjectById = async (uid: string, projectId: string): Promise<Project | null> => {
    try {
      const projectRef = doc(firestore, 'users', uid, 'projects', projectId)
      const projectDoc = await getDoc(projectRef)

      if (projectDoc.exists()) {
        return {
          id: projectDoc.id,
          ...projectDoc.data()
        } as Project
      }
      return null
    } catch (error) {
      console.error('Failed to get project:', error)
      return null
    }
  }

  const subscribeToProject = (uid: string, projectId: string, callback: (project: Project | null) => void): (() => void) => {
    const projectRef = doc(firestore, 'users', uid, 'projects', projectId)

    return onSnapshot(projectRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const project = {
            id: docSnapshot.id,
            ...docSnapshot.data()
          } as Project
          callback(project)
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error('Failed to subscribe to project:', error)
        callback(null)
      }
    )
  }

  const updateProjectMessages = async (uid: string, projectId: string, messages: Message[]): Promise<void> => {
    try {
      const projectRef = doc(firestore, 'users', uid, 'projects', projectId)
      await updateDoc(projectRef, {
        messages,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Failed to update project messages:', error)
      throw error
    }
  }

  const updateProjectName = async (uid: string, projectId: string, name: string): Promise<void> => {
    try {
      const projectRef = doc(firestore, 'users', uid, 'projects', projectId)
      await updateDoc(projectRef, {
        name,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Failed to update project name:', error)
      throw error
    }
  }

  const updateProjectWorkflow = async (uid: string, projectId: string, workflowState: WorkflowState): Promise<void> => {
    try {
      const projectRef = doc(firestore, 'users', uid, 'projects', projectId)
      await updateDoc(projectRef, {
        workflowState,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Failed to update project workflow:', error)
      throw error
    }
  }

  const deleteProject = async (uid: string, projectId: string): Promise<void> => {
    try {
      const projectRef = doc(firestore, 'users', uid, 'projects', projectId)
      await deleteDoc(projectRef)
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  }

  const getAgentTraces = async (uid: string, limitCount: number = 100): Promise<AgentTrace[]> => {
    try {
      const tracesRef = collection(firestore, 'users', uid, 'agent_traces')
      const q = query(tracesRef, orderBy('created_at', 'desc'), limit(limitCount))
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AgentTrace[]
    } catch (error) {
      console.error('Failed to get agent traces:', error)
      return []
    }
  }

  const getAgentSpans = async (uid: string, limitCount: number = 100): Promise<AgentSpan[]> => {
    try {
      const spansRef = collection(firestore, 'users', uid, 'agent_spans')
      const q = query(spansRef, orderBy('created_at', 'desc'), limit(limitCount))
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AgentSpan[]
    } catch (error) {
      console.error('Failed to get agent spans:', error)
      return []
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    getUserData,
    getUserProjects,
    createProject,
    getProjectById,
    subscribeToProject,
    updateProjectMessages,
    updateProjectName,
    updateProjectWorkflow,
    deleteProject,
    getAgentTraces,
    getAgentSpans
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
