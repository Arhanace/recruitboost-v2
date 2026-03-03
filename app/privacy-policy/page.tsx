import Link from "next/link";
import { Trophy } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - RecruitBoost",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-12">
          <Link href="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">RecruitBoost</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
            >
              Sign In
            </Link>
          </div>
        </header>

        <div className="max-w-3xl mx-auto pb-24">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-10">Last updated: March 3, 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                RecruitBoost (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website recruitboost.io (the &quot;Service&quot;). This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you use our Service, including information obtained through Google APIs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Data We Collect</h2>
              <p className="text-gray-600 leading-relaxed mb-3">We collect the following types of information:</p>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Account Information</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                <li>Name, email address, and profile picture (provided during signup or via Google OAuth)</li>
                <li>Sport, graduation year, athletic stats, academic information, and school preferences (provided by you in your profile)</li>
                <li>Password hash (if using email/password authentication)</li>
              </ul>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Google User Data</h3>
              <p className="text-gray-600 leading-relaxed mb-2">
                If you choose to connect your Gmail account, we access the following Google user data:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                <li><strong>Gmail messages:</strong> We read and send emails on your behalf solely for the purpose of communicating with college coaches through the RecruitBoost platform.</li>
                <li><strong>Gmail OAuth tokens:</strong> We store encrypted access and refresh tokens to maintain your Gmail connection.</li>
              </ul>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Usage Data</h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Emails sent and received through the platform (subject, body, timestamps)</li>
                <li>Coaches you have saved or contacted</li>
                <li>Tasks and follow-up reminders you create</li>
                <li>Activity logs (e.g., emails sent, coaches saved)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Your Data</h2>
              <p className="text-gray-600 leading-relaxed mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li><strong>Provide the Service:</strong> Authenticate your account, display your profile, and enable you to search for and contact college coaches.</li>
                <li><strong>Send and receive emails:</strong> When you connect Gmail, we use your Gmail API access to send outreach emails to coaches and sync incoming replies so you can manage all correspondence within RecruitBoost.</li>
                <li><strong>Generate email drafts:</strong> We may use AI (Anthropic Claude) to help you draft outreach emails based on your profile and the coach you are contacting. Your profile information and the coach&apos;s publicly available information are sent to Anthropic&apos;s API for this purpose.</li>
                <li><strong>Track your recruiting progress:</strong> Display dashboards, saved coaches, activity history, and follow-up reminders.</li>
                <li><strong>Improve the Service:</strong> Understand how the platform is used to fix bugs and improve features.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                We do not sell your personal data. We share data only in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li><strong>College coaches:</strong> When you send an email through RecruitBoost, the coach receives your email (including your name, email address, and message content) via Gmail.</li>
                <li><strong>Anthropic (AI provider):</strong> When you use the AI email generation feature, your profile information and the target coach&apos;s publicly available details are sent to Anthropic&apos;s Claude API to generate a draft. Anthropic does not use this data for training. See <a href="https://www.anthropic.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Anthropic&apos;s Privacy Policy</a>.</li>
                <li><strong>Infrastructure providers:</strong> We use Vercel (hosting), Neon (PostgreSQL database), and Google Cloud (OAuth and Gmail API) to operate the Service. These providers process data as necessary to deliver their services and are bound by their own privacy policies.</li>
                <li><strong>Legal requirements:</strong> We may disclose data if required by law, regulation, or legal process.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Data Storage and Protection</h2>
              <p className="text-gray-600 leading-relaxed mb-3">We take the following measures to protect your data:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>All data is transmitted over HTTPS with TLS encryption.</li>
                <li>Passwords are hashed using bcrypt with a cost factor of 12 and are never stored in plaintext.</li>
                <li>Gmail OAuth tokens are stored in our database and used only to maintain your Gmail connection.</li>
                <li>Our database is hosted on Neon (PostgreSQL) with SSL connections required.</li>
                <li>The application is hosted on Vercel with automatic HTTPS, DDoS protection, and secure infrastructure.</li>
                <li>Access controls are enforced server-side on every request. No access control logic runs on the client.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Data Retention and Deletion</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                We retain your data for as long as your account is active. You may request deletion of your data at any time:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li><strong>Account deletion:</strong> Contact us at <a href="mailto:support@recruitboost.io" className="text-blue-600 hover:underline">support@recruitboost.io</a> to request complete deletion of your account and all associated data.</li>
                <li><strong>Gmail disconnection:</strong> You can disconnect your Gmail account at any time from the Settings page. When you disconnect, we delete your stored Gmail OAuth tokens. You can also revoke access from your <a href="https://myaccount.google.com/permissions" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Account permissions page</a>.</li>
                <li><strong>Data export:</strong> You may request a copy of your data by contacting us at the email above.</li>
                <li>Upon account deletion, all your personal data, emails, saved coaches, tasks, and activity history are permanently deleted from our database.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Google API Services Disclosure</h2>
              <p className="text-gray-600 leading-relaxed">
                RecruitBoost&apos;s use and transfer of information received from Google APIs adheres to the{" "}
                <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements. We only use Google user data (Gmail access) for the purpose of sending and receiving emails with college coaches on your behalf. We do not use Google user data for advertising, and we do not allow humans to read your emails unless you explicitly request support assistance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                We use essential cookies only for authentication (session tokens). We do not use advertising or tracking cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                RecruitBoost is intended for use by high school and college-age student-athletes (typically ages 14 and older). We do not knowingly collect personal information from children under the age of 13. If you believe a child under 13 has provided us with personal information, please contact us so we can delete it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on this page with a revised &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at:{" "}
                <a href="mailto:support@recruitboost.io" className="text-blue-600 hover:underline">support@recruitboost.io</a>
              </p>
            </section>
          </div>
        </div>

        <footer className="max-w-3xl mx-auto border-t border-gray-200 pt-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} RecruitBoost. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/" className="text-sm text-gray-500 hover:text-blue-600">Home</Link>
              <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-blue-600">Privacy Policy</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
