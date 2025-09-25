"use client";

import { Navigation } from "../../components/navigation";
import { Footer } from "../../components/Footer";

export default function PrivacyPage() {
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
                    Privacy Policy
                  </h1>
                  <p className="text-[#37322F] text-lg font-medium leading-6 font-sans opacity-70">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className="prose prose-gray max-w-none">
                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">
                      1. Information We Collect
                    </h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      We collect information you provide directly to us, such as
                      when you create an account, use our services, or contact
                      us for support. This may include your name, email address,
                      and other contact information.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">
                      2. How We Use Your Information
                    </h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      We use the information we collect to provide, maintain,
                      and improve our services, process transactions, send you
                      technical notices and support messages, and communicate
                      with you about products and services.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">
                      3. Information Sharing
                    </h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      We do not sell, trade, or otherwise transfer your personal
                      information to third parties without your consent, except
                      as described in this privacy policy or as required by law.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">
                      4. Data Security
                    </h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      We implement appropriate technical and organizational
                      measures to protect your personal information against
                      unauthorized access, alteration, disclosure, or
                      destruction.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">
                      5. Data Retention
                    </h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      We retain your personal information for as long as
                      necessary to provide our services and fulfill the purposes
                      outlined in this privacy policy, unless a longer retention
                      period is required by law.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">
                      6. Your Rights
                    </h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      You have the right to access, update, or delete your
                      personal information. You may also have the right to
                      restrict or object to certain processing of your data.
                      Contact us to exercise these rights.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">
                      7. Cookies and Tracking
                    </h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      We use cookies and similar tracking technologies to
                      collect information about your browsing activities and to
                      provide and improve our services. You can control cookie
                      settings through your browser.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">
                      8. Third-Party Services
                    </h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      Our service may contain links to third-party websites or
                      services. We are not responsible for the privacy practices
                      of these third parties and encourage you to read their
                      privacy policies.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">
                      9. Children&apos;s Privacy
                    </h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      Our service is not intended for children under 13 years of
                      age. We do not knowingly collect personal information from
                      children under 13.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">
                      10. Changes to Privacy Policy
                    </h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      We may update this privacy policy from time to time. We
                      will notify you of any changes by posting the new privacy
                      policy on this page and updating the &quot;Last
                      updated&quot; date.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-[#2F3037] text-xl font-medium leading-7 font-sans mb-4">
                      11. Contact Us
                    </h2>
                    <p className="text-[#37322F] text-base leading-6 font-sans mb-4">
                      If you have any questions about this privacy policy,
                      please contact us.
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
  );
}
