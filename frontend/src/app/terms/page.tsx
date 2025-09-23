"use client"

import { Navigation } from "../../components/navigation"
import { Footer } from "../../components/Footer"

export default function TermsPage() {
  return (
    <div className="w-full min-h-screen relative bg-[#F7F5F3] overflow-x-hidden flex flex-col justify-start items-center max-w-[100vw]">
      <div className="relative flex flex-col justify-start items-center w-full max-w-[100vw] overflow-x-hidden min-h-screen">
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
                  <h1 className="text-[#2F3037] text-3xl sm:text-4xl font-medium leading-tight font-sans mb-4">
                    Terms of Service
                  </h1>
                  <p className="text-[#37322F] text-lg font-medium leading-6 font-sans opacity-70">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className="prose prose-gray max-w-none">
                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">1. Acceptance of Terms</h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      By accessing and using Reefs (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. 
                      If you do not agree to abide by the above, please do not use this service.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">2. Description of Service</h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      Reefs is a platform for building, deploying, and managing AI agents. The service provides tools and infrastructure 
                      to help users create intelligent agents through natural language interfaces.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">3. User Accounts</h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      You are responsible for maintaining the confidentiality of your account and password. You agree to accept 
                      responsibility for all activities that occur under your account or password.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">4. Acceptable Use</h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      You agree not to use the service for any unlawful purposes or to solicit others to perform such acts. 
                      You agree not to transmit any material that is copyrighted, obscene, or otherwise objectionable.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">5. Intellectual Property</h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      The service and its original content, features, and functionality are owned by Reefs and are protected 
                      by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">6. Limitation of Liability</h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      In no event shall Reefs be liable for any indirect, incidental, special, consequential, or punitive damages, 
                      including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">7. Termination</h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      We may terminate or suspend your account and bar access to the service immediately, without prior notice 
                      or liability, under our sole discretion, for any reason whatsoever.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">8. Changes to Terms</h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                      we will provide at least 30 days notice prior to any new terms taking effect.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">9. Contact Information</h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      If you have any questions about these Terms of Service, please contact us.
                    </p>
                  </section>
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