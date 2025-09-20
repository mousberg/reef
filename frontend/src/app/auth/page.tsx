"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "../../components/ui/button"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-center items-center max-w-[100vw]">
      {/* Navigation */}
      <div className="w-full h-12 sm:h-14 md:h-16 lg:h-[84px] absolute left-0 top-0 flex justify-center items-center z-20 px-6 sm:px-8 md:px-12 lg:px-0">
        <div className="w-full h-0 absolute left-0 top-6 sm:top-7 md:top-8 lg:top-[42px] border-t border-[rgba(55,50,47,0.12)] shadow-[0px_1px_0px_white]" />
        
        <div className="w-full max-w-[calc(100%-32px)] sm:max-w-[calc(100%-48px)] md:max-w-[calc(100%-64px)] lg:max-w-[700px] lg:w-[700px] h-10 sm:h-11 md:h-12 py-1.5 sm:py-2 px-3 sm:px-4 md:px-4 pr-2 sm:pr-3 bg-[#F7F5F3] backdrop-blur-sm shadow-[0px_0px_0px_2px_white] overflow-hidden rounded-[50px] flex justify-between items-center relative z-30">
          <Link href="/" className="flex justify-center items-center">
            <div className="font-title flex flex-col justify-center text-[#2F3037] text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-5 font-sans">
              Reef
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[400px] px-6 sm:px-8">
        <div className="bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] border border-[rgba(2,6,23,0.08)] rounded-[24px] p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-[#2F3037] text-2xl sm:text-3xl font-medium leading-tight font-sans mb-2">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-[#37322F] text-sm font-medium leading-5 font-sans opacity-70">
              {isSignUp ? "Start your journey with Reef" : "Sign in to continue to Reef"}
            </p>
          </div>

          <form className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans focus:outline-none focus:border-[#37322F] focus:ring-[3px] focus:ring-[rgba(55,50,47,0.1)] transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans focus:outline-none focus:border-[#37322F] focus:ring-[3px] focus:ring-[rgba(55,50,47,0.1)] transition-all"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans focus:outline-none focus:border-[#37322F] focus:ring-[3px] focus:ring-[rgba(55,50,47,0.1)] transition-all"
                placeholder="Enter your password"
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans focus:outline-none focus:border-[#37322F] focus:ring-[3px] focus:ring-[rgba(55,50,47,0.1)] transition-all"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <Button className="w-full h-12 bg-[#37322F] hover:bg-[#2F2B28] text-white rounded-[12px] text-sm font-medium leading-5 font-sans transition-all">
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#37322F] text-sm font-medium leading-5 font-sans hover:opacity-70 transition-opacity"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}