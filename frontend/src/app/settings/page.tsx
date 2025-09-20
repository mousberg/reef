"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Navigation } from "../../components/navigation"
import { Button } from "../../components/ui/button"

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
  const { user, getUserData, logout } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    const fetchUserData = async () => {
      try {
        const data = await getUserData(user.uid)
        setUserData(data)
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, getUserData, router])

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

  if (loading) {
    return (
      <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-center items-center max-w-[100vw]">
        <div className="text-[#37322F] text-lg font-medium leading-6 font-sans">Loading...</div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-center items-center max-w-[100vw]">
        <div className="text-[#37322F] text-lg font-medium leading-6 font-sans">User data not found</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-start items-center max-w-[100vw]">
      <div className="relative flex flex-col justify-start items-center w-full max-w-[100vw] overflow-x-hidden">
        <div className="w-full max-w-none px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] relative flex flex-col justify-start items-start min-h-screen overflow-x-hidden">
          {/* Vertical lines */}
          <div className="w-[1px] h-full absolute left-4 sm:left-6 md:left-8 lg:left-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0" />
          <div className="w-[1px] h-full absolute right-4 sm:right-6 md:right-8 lg:right-0 top-0 bg-[rgba(55,50,47,0.12)] shadow-[1px_0px_0px_white] z-0" />

          <Navigation />

          {/* Main Content */}
          <div className="w-full flex-1 px-6 sm:px-8 md:px-12 lg:px-0 py-8 relative z-10 mt-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] border border-[rgba(2,6,23,0.08)] rounded-[24px] p-8 sm:p-10">
                <div className="text-center mb-8">
                  <h1 className="text-[#2F3037] text-2xl sm:text-3xl font-medium leading-tight font-sans mb-2">
                    Settings
                  </h1>
                  <p className="text-[#37322F] text-sm font-medium leading-5 font-sans opacity-70">
                    Manage your account settings and preferences
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                        First Name
                      </label>
                      <div className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans">
                        {userData.firstName}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                        Last Name
                      </label>
                      <div className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans">
                        {userData.lastName}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                      Email
                    </label>
                    <div className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans">
                      {userData.email}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                        Terms Accepted
                      </label>
                      <div className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans">
                        {userData.termsAccepted ? "Yes" : "No"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                        Marketing Accepted
                      </label>
                      <div className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans">
                        {userData.marketingAccepted ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                      Last Login IP
                    </label>
                    <div className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans">
                      {userData.lastLoggedInIp}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[rgba(55,50,47,0.12)]">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-[#2F3037] text-lg font-medium leading-6 font-sans mb-1">
                        Account Actions
                      </h3>
                      <p className="text-[#37322F] text-sm font-medium leading-5 font-sans opacity-70">
                        Manage your account settings
                      </p>
                    </div>
                    <Button 
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-[12px] px-6 py-3 text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50"
                    >
                      {loggingOut ? "Logging out..." : "Logout"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}