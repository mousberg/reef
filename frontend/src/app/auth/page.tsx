"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { useAuth } from "../../contexts/AuthContext"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [marketingAccepted, setMarketingAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signUp, signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError("Passwords don't match")
          return
        }
        await signUp(email, password, firstName, lastName, termsAccepted, marketingAccepted)
      } else {
        await signIn(email, password)
      }
      router.push(isSignUp ? "/settings" : "/")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)

    try {
      await signInWithGoogle()
      router.push("/projects")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

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
      <div className="px-6 w-[60%] sm:px-8 mt-16">
        <div className="bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] border border-[rgba(2,6,23,0.08)] rounded-[24px] p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-[#2F3037] text-2xl sm:text-3xl font-medium leading-tight font-sans mb-2">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-[#37322F] text-sm font-medium leading-5 font-sans opacity-70">
              {isSignUp ? "Start your journey with Reef" : "Sign in to continue to Reef"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[12px]">
              <p className="text-red-600 text-sm font-medium leading-5 font-sans">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans focus:outline-none focus:border-[#37322F] focus:ring-[3px] focus:ring-[rgba(55,50,47,0.1)] transition-all"
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans focus:outline-none focus:border-[#37322F] focus:ring-[3px] focus:ring-[rgba(55,50,47,0.1)] transition-all"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="email" className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans focus:outline-none focus:border-[#37322F] focus:ring-[3px] focus:ring-[rgba(55,50,47,0.1)] transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-[#37322F] text-sm font-medium leading-5 font-sans mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans focus:outline-none focus:border-[#37322F] focus:ring-[3px] focus:ring-[rgba(55,50,47,0.1)] transition-all"
                placeholder="Enter your password"
                required
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-[#37322F] text-sm font-medium leading-5 font-sans focus:outline-none focus:border-[#37322F] focus:ring-[3px] focus:ring-[rgba(55,50,47,0.1)] transition-all"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            {isSignUp && (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#37322F] bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded focus:ring-[#37322F] focus:ring-2"
                    required
                  />
                  <label htmlFor="terms" className="text-[#37322F] text-sm font-medium leading-5 font-sans">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="marketing"
                    checked={marketingAccepted}
                    onChange={(e) => setMarketingAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-[#37322F] bg-[#F7F5F3] border border-[rgba(55,50,47,0.12)] rounded focus:ring-[#37322F] focus:ring-2"
                  />
                  <label htmlFor="marketing" className="text-[#37322F] text-sm font-medium leading-5 font-sans">
                    I would like to receive marketing emails and updates
                  </label>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-[#37322F] hover:bg-[#2F2B28] text-white rounded-[12px] text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(55,50,47,0.12)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-[#37322F] font-medium leading-5 font-sans opacity-70">
                  Or continue with
                </span>
              </div>
            </div>
            
            <Button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 mt-4 bg-white hover:bg-[#F7F5F3] text-[#37322F] border border-[rgba(55,50,47,0.12)] rounded-[12px] text-sm font-medium leading-5 font-sans transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#37322F] text-sm font-medium leading-5 font-sans hover:opacity-70 transition-opacity cursor-pointer"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}