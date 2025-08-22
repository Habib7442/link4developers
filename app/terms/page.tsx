import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Link4Coders',
  description: 'Terms of Service for Link4Coders - Learn about the rules and guidelines for using our platform.',
  robots: 'index, follow'
}

export default function TermsOfServicePage() {
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
            Terms of Service
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
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">1. Acceptance of Terms</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  By accessing and using Link4Coders ("the Service"), you accept and agree to be bound by the
                  terms and provision of this agreement. If you do not agree to abide by the above, please do
                  not use this service. Link4Coders is a platform that enables developers to create professional
                  profiles and share their projects and links.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">2. Description of Service</h2>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  Link4Coders provides the following services:
                </p>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Developer profile creation and customization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Link management and organization tools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Multiple profile templates and themes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Analytics and click tracking for shared links</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Public profile sharing capabilities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Integration with popular developer platforms (GitHub, etc.)</span>
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">3. User Accounts and Registration</h2>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">3.1 Account Creation</h3>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  To use certain features of our Service, you must register for an account. You may register
                  using your email address or through third-party authentication providers (Google, GitHub).
                </p>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">3.2 Account Responsibility</h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  You are responsible for:
                </p>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Maintaining the confidentiality of your account credentials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>All activities that occur under your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Providing accurate and up-to-date information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Notifying us immediately of any unauthorized use</span>
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">4. Acceptable Use Policy</h2>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">4.1 Permitted Uses</h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  You may use Link4Coders to:
                </p>
                <ul className="text-gray-300 space-y-3 mb-6 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Create and maintain your professional developer profile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Share links to your projects, portfolio, and social media</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Network with other developers and professionals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Showcase your work and skills to potential employers or clients</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">4.2 Prohibited Uses</h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  You agree NOT to use the Service to:
                </p>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Upload, post, or share illegal, harmful, or offensive content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Impersonate another person or entity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Spam, harass, or abuse other users</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Share malicious links or malware</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Violate any applicable laws or regulations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Attempt to gain unauthorized access to our systems</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Use automated tools to scrape or harvest data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Share content that infringes on intellectual property rights</span>
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">5. Content and Intellectual Property</h2>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">5.1 Your Content</h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  You retain ownership of all content you upload to Link4Coders. By using our Service, you grant us:
                </p>
                <ul className="text-gray-300 space-y-3 mb-6 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>A non-exclusive license to display your content on our platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>The right to backup and store your content for service provision</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Permission to share your public profile content as intended by the service</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">5.2 Our Content</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Link4Coders and its original content, features, and functionality are owned by us and are
                  protected by international copyright, trademark, patent, trade secret, and other intellectual
                  property laws.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">6. Privacy and Data Protection</h2>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect
                  your information when you use our Service. By using Link4Coders, you agree to the collection
                  and use of information in accordance with our Privacy Policy.
                </p>
                <p className="text-gray-300 leading-relaxed text-lg">
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                    Read our full Privacy Policy →
                  </Link>
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">7. Subscription and Payment Terms</h2>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">7.1 Free Tier</h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  Link4Coders offers a free tier with basic features including:
                </p>
                <ul className="text-gray-300 space-y-3 mb-6 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Basic profile creation and customization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Access to free templates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Limited link management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Basic analytics</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">7.2 Premium Features</h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  Premium subscriptions may include additional features such as:
                </p>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Advanced templates and customization options</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Custom domains</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Enhanced analytics and insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Removal of Link4Coders branding</span>
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">8. Service Availability and Modifications</h2>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">8.1 Service Availability</h3>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  We strive to maintain high availability of our Service, but we do not guarantee uninterrupted access.
                  We may experience downtime for maintenance, updates, or unforeseen technical issues.
                </p>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">8.2 Service Modifications</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  We reserve the right to modify, suspend, or discontinue any part of our Service at any time.
                  We will provide reasonable notice for significant changes that affect your use of the Service.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">9. Termination</h2>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">9.1 Termination by You</h3>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  You may terminate your account at any time by contacting us or using the account deletion
                  feature in your dashboard.
                </p>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">9.2 Termination by Us</h3>
                <p className="text-gray-300 leading-relaxed mb-4 text-lg">
                  We may terminate or suspend your account if you:
                </p>
                <ul className="text-gray-300 space-y-3 text-lg">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Violate these Terms of Service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Engage in prohibited activities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Fail to pay for premium services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Remain inactive for an extended period</span>
                  </li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">10. Disclaimers and Limitation of Liability</h2>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">10.1 Service Disclaimer</h3>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  Link4Coders is provided "as is" without warranties of any kind. We do not guarantee that
                  the Service will be error-free, secure, or continuously available.
                </p>

                <h3 className="text-xl font-semibold text-white mb-4 font-['Sharp_Grotesk']">10.2 Limitation of Liability</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  To the maximum extent permitted by law, Link4Coders shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages arising from your use of the Service.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">11. Governing Law and Disputes</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  These Terms shall be governed by and construed in accordance with applicable laws. Any disputes
                  arising from these Terms or your use of the Service shall be resolved through binding arbitration
                  or in the courts of competent jurisdiction.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">12. Changes to Terms</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  We reserve the right to modify these Terms at any time. We will notify users of significant
                  changes via email or through our Service. Your continued use of Link4Coders after changes
                  constitutes acceptance of the new Terms.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6 font-['Sharp_Grotesk']">13. Contact Information</h2>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <p className="text-gray-300 text-lg">
                    <strong className="text-white">Email:</strong> legal@link4coders.in<br />
                    <strong className="text-white">Support:</strong> support@link4coders.in<br />
                    <strong className="text-white">Website:</strong> <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">https://link4coders.in</Link>
                  </p>
                </div>
              </section>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/privacy"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Privacy Policy
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
    </div>
  )
}

