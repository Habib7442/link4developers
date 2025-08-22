import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Link4Coders',
  description: 'Privacy Policy for Link4Coders - Learn how we collect, use, and protect your personal information.',
  robots: 'index, follow'
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-8 font-medium"
          >
            ← Back to Link4Coders
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-['Sharp_Grotesk']">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-400">
            Last updated: January 19, 2024
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl">
            <div className="max-w-none">

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">1. Introduction</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Welcome to Link4Coders ("we," "our," or "us"). This Privacy Policy explains how we collect,
                  use, disclose, and safeguard your information when you visit our website and use our services.
                  Link4Coders is a platform designed for developers to create and share their professional profiles
                  and project links.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">2. Information We Collect</h2>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">2.1 Personal Information</h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  When you create an account, we may collect:
                </p>
                <ul className="text-gray-300 space-y-3 mb-6 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Full name and email address</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Profile information (bio, location, company)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Social media usernames (GitHub, Twitter, LinkedIn)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Profile picture and avatar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Website URLs and project links</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">2.2 Authentication Information</h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  When you sign in with third-party providers (Google, GitHub), we receive:
                </p>
                <ul className="text-gray-300 space-y-3 mb-6 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Basic profile information (name, email, profile picture)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Unique identifier from the authentication provider</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Public profile information as permitted by the provider</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">2.3 Usage Information</h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  We automatically collect certain information about your use of our services:
                </p>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>IP address and browser information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Pages visited and time spent on our platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Click data and interaction patterns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Device information and operating system</span>
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">3. How We Use Your Information</h2>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  We use the collected information for the following purposes:
                </p>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>To provide and maintain our services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>To create and manage your developer profile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>To enable profile sharing and networking features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>To provide analytics and insights about link performance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>To communicate with you about our services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>To improve our platform and user experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>To detect and prevent fraud or abuse</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>To comply with legal obligations</span>
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">4. Information Sharing and Disclosure</h2>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">4.1 Public Information</h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  When you make your profile public, the following information becomes visible to anyone:
                </p>
                <ul className="text-gray-300 space-y-3 mb-6 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Your name, bio, and profile picture</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Your links and project information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Your social media usernames (if provided)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Your location and company (if provided)</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">4.2 Third-Party Services</h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  We may share information with trusted third-party services:
                </p>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Supabase (database and authentication services)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Analytics providers for usage insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Email service providers for communications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Cloud storage providers for file hosting</span>
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">5. Data Security</h2>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  We implement appropriate technical and organizational security measures to protect your personal information:
                </p>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Encryption of data in transit and at rest</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Regular security audits and monitoring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Access controls and authentication requirements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Secure coding practices and input validation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Regular backups and disaster recovery procedures</span>
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">6. Your Rights and Choices</h2>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong className="text-white">Access:</strong> Request a copy of your personal data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong className="text-white">Correction:</strong> Update or correct inaccurate information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong className="text-white">Deletion:</strong> Request deletion of your account and data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong className="text-white">Portability:</strong> Export your data in a machine-readable format</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong className="text-white">Privacy Settings:</strong> Control the visibility of your profile</span>
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">7. Cookies and Tracking</h2>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  We use cookies and similar technologies to:
                </p>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Maintain your login session</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Remember your preferences</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Analyze usage patterns and improve our services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Provide personalized content and features</span>
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">8. Children's Privacy</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Our services are not intended for children under 13 years of age. We do not knowingly
                  collect personal information from children under 13. If you are a parent or guardian and
                  believe your child has provided us with personal information, please contact us.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">9. International Data Transfers</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Your information may be transferred to and processed in countries other than your own.
                  We ensure appropriate safeguards are in place to protect your personal information in
                  accordance with this Privacy Policy.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">10. Changes to This Privacy Policy</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  We may update this Privacy Policy from time to time. We will notify you of any changes
                  by posting the new Privacy Policy on this page and updating the "Last updated" date.
                  We encourage you to review this Privacy Policy periodically.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">11. Contact Us</h2>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <p className="text-gray-300 text-lg">
                    <strong className="text-white">Email:</strong> privacy@link4coders.in<br />
                    <strong className="text-white">Website:</strong> <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">https://link4coders.in</Link>
                  </p>
                </div>
              </section>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/terms"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Terms of Service
            </Link>
            <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Back to Link4Coders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
