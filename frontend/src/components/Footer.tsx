import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t border-[rgba(55,50,47,0.12)] bg-[#F7F5F3] mt-auto">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-0 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-[#37322F] text-sm font-medium leading-5 font-sans opacity-70">
            2024 Reefs. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/"
              className="text-[#37322F] text-sm font-medium leading-5 font-sans hover:opacity-70 transition-opacity"
            >
              Home
            </Link>
            <Link 
              href="/privacy"
              className="text-[#37322F] text-sm font-medium leading-5 font-sans hover:opacity-70 transition-opacity"
            >
              Privacy
            </Link>
            <Link 
              href="/terms"
              className="text-[#37322F] text-sm font-medium leading-5 font-sans hover:opacity-70 transition-opacity"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}