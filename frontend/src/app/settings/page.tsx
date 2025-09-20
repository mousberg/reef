"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"

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
  const { user, getUserData } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
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
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-center items-center max-w-[100vw]">
      {/* Navigation */}
      <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
        <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]" />
        
        <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-[#F7F5F3] backdrop-blur-sm shadow-[0px_0px_0px_2px_white] overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
          <div className="flex justify-center items-center">
            <div className="font-title flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans">
              Reef
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 w-[60%] sm:px-8 mt-16">
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
        </div>
      </div>
    </div>
  )
}