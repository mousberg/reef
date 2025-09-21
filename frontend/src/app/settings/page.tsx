"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth, type ToolAuthStatus } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Navigation } from "../../components/navigation"
import { Button } from "../../components/ui/button"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { firestore } from "../../lib/firebase"
import { toast } from "sonner"
import { Footer } from "../../components/Footer"
import Image from "next/image"

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

export default function SettingsPage() {
  const { user, getUserData, logout, getAvailableTools, authorizeTool, getUserToolAuthStatus } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editableData, setEditableData] = useState({
    firstName: "",
    lastName: "",
    marketingAccepted: false
  })
  const [availableTools, setAvailableTools] = useState<string[]>([])
  const [toolAuthStatus, setToolAuthStatus] = useState<ToolAuthStatus[]>([])
  const [authorizingTool, setAuthorizingTool] = useState<string | null>(null)
  const router = useRouter()

  const fetchUserData = useCallback(async () => {
    if (!user) return
    
    try {
      const [data, tools, authStatus] = await Promise.all([
        getUserData(user.uid),
        getAvailableTools(user.uid),
        getUserToolAuthStatus(user.uid)
      ])
      
      setUserData(data)
      setAvailableTools(tools)
      setToolAuthStatus(authStatus)
      
      if (data) {
        setEditableData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          marketingAccepted: data.marketingAccepted || false
        })
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    } finally {
      setLoading(false)
    }
  }, [user, getUserData, getAvailableTools, getUserToolAuthStatus])

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    fetchUserData()
  }, [user, fetchUserData, router])

  const handleSave = async () => {
    if (!user || !userData) return
    
    setSaving(true)
    try {
      const userDocRef = doc(firestore, 'users', user.uid)
      await updateDoc(userDocRef, {
        firstName: editableData.firstName,
        lastName: editableData.lastName,
        marketingAccepted: editableData.marketingAccepted,
        lastUpdated: serverTimestamp()
      })
      
      // Update local state
      setUserData({
        ...userData,
        firstName: editableData.firstName,
        lastName: editableData.lastName,
        marketingAccepted: editableData.marketingAccepted
      })
      
      toast.success("Settings saved successfully!")
    } catch (error) {
      console.error("Failed to save user data:", error)
      toast.error("Failed to save settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Failed to logout:", error)
    } finally {
      setLoggingOut(false)
    }
  }

  const handleToolAuthorization = async (toolName: string) => {
    if (!user) return
    
    setAuthorizingTool(toolName)
    try {
      const success = await authorizeTool(user.uid, toolName)
      if (success) {
        toast.success(`${toolName} authorized successfully!`)
        // Update the local auth status
        setToolAuthStatus(prev => {
          const existing = prev.find(status => status.toolName === toolName)
          if (existing) {
            return prev.map(status => 
              status.toolName === toolName 
                ? { ...status, isAuthenticated: true, authenticatedAt: new Date() }
                : status
            )
          } else {
            return [...prev, { toolName, isAuthenticated: true, authenticatedAt: new Date() }]
          }
        })
      } else {
        toast.error(`Failed to authorize ${toolName}`)
      }
    } catch (error) {
      console.error("Failed to authorize tool:", error)
      toast.error(`Failed to authorize ${toolName}`)
    } finally {
      setAuthorizingTool(null)
    }
  }

  const isToolAuthenticated = (toolName: string): boolean => {
    return toolAuthStatus.some(status => status.toolName === toolName && status.isAuthenticated)
  }

  const getToolIconPath = (toolName: string): string => {
    const iconMap: Record<string, string> = {
      'X': '/icons/x.svg',
      'Linkedin': '/icons/linkedin.svg',
      'GoogleSearch': '/icons/google-search.svg',
      'Slack': '/icons/slack.svg',
      'GoogleCalendar': '/icons/calendar.svg',
      'GoogleFinance': '/icons/google-finance.svg',
      'Gmail': '/icons/email.svg'
    }
    
    // Extract the service name (before the first dot)
    const serviceName = toolName.split('.')[0]
    return iconMap[serviceName] || '/icons/default.svg'
  }

  const getServiceName = (toolName: string): string => {
    return toolName.split('.')[0]
  }

  const getToolDisplayName = (toolName: string): string => {
    const parts = toolName.split('.')
    if (parts.length === 1) return toolName
    
    // Convert CamelCase to readable format
    const action = parts[1].replace(/([A-Z])/g, ' $1').trim()
    return action
  }

  const groupToolsByService = (tools: string[]) => {
    const grouped: Record<string, string[]> = {}
    tools.forEach(tool => {
      const service = getServiceName(tool)
      if (!grouped[service]) {
        grouped[service] = []
      }
      grouped[service].push(tool)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen relative bg-background overflow-x-hidden flex flex-col justify-center items-center max-w-[100vw]">
        <div className="text-foreground text-lg font-medium leading-6 font-sans">Loading...</div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="w-full min-h-screen relative bg-background overflow-x-hidden flex flex-col justify-center items-center max-w-[100vw]">
        <div className="text-foreground text-lg font-medium leading-6 font-sans">User data not found</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen relative bg-background overflow-x-hidden flex flex-col justify-start items-center max-w-[100vw]">
      <div className="relative flex flex-col justify-start items-center w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen overflow-x-hidden">
          {/* Vertical lines */}
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-border/50 shadow-[1px_0px_0px_background] dark:shadow-[1px_0px_0px_rgba(0,0,0,0.3)] z-0" />
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-border/50 shadow-[1px_0px_0px_background] dark:shadow-[1px_0px_0px_rgba(0,0,0,0.3)] z-0" />

          <Navigation />

          {/* Main Content */}
          <div className="w-full flex-1 px-6 sm:px-8 md:px-12 lg:px-0 py-8 relative z-10 mt-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card dark:bg-card/95 shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] dark:shadow-[0px_0px_0px_4px_rgba(255,255,255,0.05)] border border-border/20 dark:border-border/30 rounded-[24px] p-8 sm:p-10">
                <div className="text-center mb-8">
                  <h1 className="text-foreground text-2xl sm:text-3xl font-medium leading-tight font-sans mb-2">
                    Settings
                  </h1>
                  <p className="text-foreground/70 text-sm font-medium leading-5 font-sans">
                    Manage your account settings and preferences
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-foreground text-sm font-medium leading-5 font-sans mb-2">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={editableData.firstName}
                        onChange={(e) => setEditableData({ ...editableData, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-background dark:bg-card border border-border rounded-[12px] text-foreground text-sm font-medium leading-5 font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-foreground text-sm font-medium leading-5 font-sans mb-2">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={editableData.lastName}
                        onChange={(e) => setEditableData({ ...editableData, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-background dark:bg-card border border-border rounded-[12px] text-foreground text-sm font-medium leading-5 font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-foreground text-sm font-medium leading-5 font-sans mb-2">
                      Email
                    </label>
                    <div id="email" className="w-full px-4 py-3 bg-muted border border-border rounded-[12px] text-foreground text-sm font-medium leading-5 font-sans">
                      {userData.email}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="marketing" className="block text-foreground text-sm font-medium leading-5 font-sans mb-2">
                      Marketing Communications
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="marketing"
                        checked={editableData.marketingAccepted}
                        onChange={(e) => setEditableData({ ...editableData, marketingAccepted: e.target.checked })}
                        className="w-4 h-4 text-primary bg-background dark:bg-card border-border rounded focus:ring-primary focus:ring-2"
                      />
                      <label htmlFor="marketing" className="text-foreground text-sm font-medium leading-5 font-sans">
                        I agree to receive marketing communications and updates
                      </label>
                    </div>
                  </div>

                  {/* Tool Authentication Section */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="mb-6">
                      <h3 className="text-foreground text-lg font-medium leading-6 font-sans mb-2">
                        Tool Authentication
                      </h3>
                      <p className="text-foreground/70 text-sm font-medium leading-5 font-sans">
                        Connect and authorize tools for your AI agents to use
                      </p>
                    </div>
                    
                    {availableTools.length > 0 ? (
                      <div className="space-y-6">
                        {Object.entries(groupToolsByService(availableTools)).map(([serviceName, tools]) => (
                          <div key={serviceName} className="bg-background dark:bg-card border border-border rounded-[16px] p-6">
                            {/* Service Header */}
                            <div className="flex items-center space-x-3 mb-4">
                              <Image 
                                src={getToolIconPath(serviceName)} 
                                alt={serviceName}
                                width={40}
                                height={40}
                                className="opacity-90"
                              />
                              <div>
                                <h4 className="text-foreground text-lg font-semibold leading-6 font-sans">
                                  {serviceName}
                                </h4>
                                <p className="text-foreground/60 text-sm font-medium leading-5 font-sans">
                                  {tools.length} tool{tools.length > 1 ? 's' : ''} available
                                </p>
                              </div>
                            </div>

                            {/* Tools Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {tools.map((tool) => {
                                const isAuthenticated = isToolAuthenticated(tool)
                                const isAuthorizingThis = authorizingTool === tool
                                const displayName = getToolDisplayName(tool)
                                
                                return (
                                  <div key={tool} className="bg-card dark:bg-background border border-border/50 rounded-[12px] p-4 flex items-center justify-between hover:border-border transition-colors">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-foreground text-sm font-medium leading-5 font-sans truncate">
                                        {displayName}
                                      </h5>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <p className="text-foreground/60 text-xs font-medium leading-4 font-sans">
                                          {isAuthenticated ? 'Connected' : 'Not connected'}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <Button
                                      onClick={() => handleToolAuthorization(tool)}
                                      disabled={isAuthenticated || isAuthorizingThis}
                                      size="sm"
                                      className={`
                                        ml-3 px-3 py-1.5 text-xs font-medium leading-4 font-sans rounded-[8px] transition-all shrink-0
                                        ${isAuthenticated 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 cursor-default hover:bg-green-100 dark:hover:bg-green-900/20' 
                                          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                        }
                                        disabled:opacity-50
                                      `}
                                    >
                                      {isAuthorizingThis ? 'Connecting...' : isAuthenticated ? '✓ Connected' : 'Connect'}
                                    </Button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-background dark:bg-card border border-border rounded-[16px]">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Tools icon">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <p className="text-foreground/60 text-sm font-medium leading-5 font-sans">
                          No tools available at the moment
                        </p>
                        <p className="text-foreground/40 text-xs font-medium leading-4 font-sans mt-1">
                          Tools will appear here when they become available
                        </p>
                      </div>
                    )}
                  </div>

                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex justify-between items-center mb-6">
                    <Button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-[12px] px-8 py-3 text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-foreground text-lg font-medium leading-6 font-sans mb-1">
                        Account Actions
                      </h3>
                      <p className="text-foreground/70 text-sm font-medium leading-5 font-sans">
                        Manage your account settings
                      </p>
                    </div>
                    <Button 
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-[12px] px-6 py-3 text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50"
                    >
                      {loggingOut ? "Logging out..." : "Logout"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  )
}