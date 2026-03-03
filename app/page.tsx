import Link from "next/link";
import {
  Trophy,
  Mail,
  BarChart4,
  School,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";

export default function SplashPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">
              RecruitBoost
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
            >
              Sign In
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-screen-xl mx-auto py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-16">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">
                Connect with{" "}
                <span className="text-blue-600">College Coaches</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Take control of your athletic future with our platform that
                helps you reach out to coaches, manage your recruitment, and
                find your perfect college fit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-12 px-6 py-3 transition-colors"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 h-12 px-6 py-3 transition-colors text-gray-700"
                >
                  Learn More
                </a>
              </div>

              <div className="flex items-center text-gray-600">
                <div className="flex -space-x-2 mr-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-medium text-blue-700">
                    JT
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-xs font-medium text-green-700">
                    KL
                  </div>
                  <div className="w-8 h-8 rounded-full bg-yellow-100 border-2 border-white flex items-center justify-center text-xs font-medium text-yellow-700">
                    SP
                  </div>
                </div>
                <span className="text-sm">
                  Joined by <span className="font-medium">25,000+</span>{" "}
                  athletes
                </span>
              </div>
            </div>

            <div className="lg:w-1/2 mt-12 lg:mt-0">
              <div className="relative">
                <div className="absolute -right-4 -top-4 w-full h-full bg-blue-100 rounded-2xl -z-10 transform translate-x-4 translate-y-2" />
                <img
                  src="https://images.unsplash.com/photo-1519766304817-4f37bda74a26?auto=format&fit=crop&q=80"
                  alt="College athlete"
                  className="rounded-2xl shadow-lg object-cover w-full h-[450px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-screen-xl mx-auto my-16">
          <div className="border border-gray-100 shadow-sm rounded-xl grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 p-8 bg-white">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">10,000+</p>
              <p className="text-gray-500 mt-1">Coaches</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">1,500+</p>
              <p className="text-gray-500 mt-1">Schools</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">25,000+</p>
              <p className="text-gray-500 mt-1">Athletes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">98%</p>
              <p className="text-gray-500 mt-1">Success Rate</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="max-w-screen-xl mx-auto py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How RecruitBoost <span className="text-blue-600">Works</span>
            </h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              Our platform makes recruiting simple with powerful tools designed
              specifically for student-athletes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <School className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Find Coaches
              </h3>
              <p className="text-gray-600 mb-4">
                Search our database of 10,000+ college coaches across all
                divisions, filtered by your sport, location, and academic
                preferences.
              </p>
              <ul className="space-y-2">
                <FeatureCheck>Division I, II, III coaches</FeatureCheck>
                <FeatureCheck>Verified contact information</FeatureCheck>
                <FeatureCheck>Save favorite coaches</FeatureCheck>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Contact Coaches
              </h3>
              <p className="text-gray-600 mb-4">
                Send personalized emails with our AI-powered writing assistant
                that helps you create impressive outreach messages.
              </p>
              <ul className="space-y-2">
                <FeatureCheck>AI email templates</FeatureCheck>
                <FeatureCheck>Bulk email campaigns</FeatureCheck>
                <FeatureCheck>Open and response tracking</FeatureCheck>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all border border-gray-100">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <BarChart4 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Track Progress
              </h3>
              <p className="text-gray-600 mb-4">
                Manage your entire recruitment journey with our task management
                system and communication tracking.
              </p>
              <ul className="space-y-2">
                <FeatureCheck>Task management</FeatureCheck>
                <FeatureCheck>Response analytics</FeatureCheck>
                <FeatureCheck>Recruitment timeline</FeatureCheck>
              </ul>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-screen-xl mx-auto py-16 bg-gray-50 rounded-2xl my-16 overflow-hidden">
          <div className="relative">
            <div className="absolute -left-16 -top-16 w-40 h-40 bg-blue-50 rounded-full" />
            <div className="absolute -right-16 -bottom-16 w-40 h-40 bg-blue-50 rounded-full" />
          </div>

          <div className="relative px-8 py-8 md:px-12 md:py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Success Stories
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hear from athletes who found their perfect college match using
                RecruitBoost
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <TestimonialCard
                name="Michael Johnson"
                school="Stanford University"
                sport="Basketball"
                quote="After months of silence from coaches, I started using RecruitBoost and received 5 responses in my first week. The coach database and email templates made all the difference in my recruiting journey."
                outcome="Full Scholarship"
                initials="MJ"
                bgColor="bg-blue-100"
                textColor="text-blue-700"
              />
              <TestimonialCard
                name="Sarah Williams"
                school="UCLA"
                sport="Soccer"
                quote="The task management system helped me stay organized during my recruiting process. I could track every email, campus visit, and follow-up in one place. I'm now playing soccer at my dream school!"
                outcome="Athletic Scholarship"
                initials="SW"
                bgColor="bg-green-100"
                textColor="text-green-700"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-screen-xl mx-auto mb-24">
          <div className="bg-blue-600 rounded-2xl overflow-hidden">
            <div className="px-8 py-12 md:px-12 md:py-16 relative">
              <div className="absolute right-0 top-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

              <div className="relative max-w-3xl mx-auto text-center z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Find Your Perfect College Match?
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Join thousands of athletes who have successfully connected
                  with college coaches using RecruitBoost.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-white hover:bg-gray-100 text-blue-600 h-12 px-6 py-3 transition-colors"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-white/30 text-white hover:bg-white/10 h-12 px-6 py-3 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-screen-xl mx-auto border-t border-gray-200 pt-12 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <Trophy className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-800">
                  RecruitBoost
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                The comprehensive platform that connects student-athletes with
                college coaches to simplify the recruiting process.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-4">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-800 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} RecruitBoost. All rights
              reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCheck({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center text-sm text-gray-600">
      <CheckCircle className="h-4 w-4 text-blue-600 mr-2 shrink-0" />
      {children}
    </li>
  );
}

function TestimonialCard({
  name,
  school,
  sport,
  quote,
  outcome,
  initials,
  bgColor,
  textColor,
}: {
  name: string;
  school: string;
  sport: string;
  quote: string;
  outcome: string;
  initials: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center mb-6">
        <div
          className={`w-14 h-14 rounded-full ${bgColor} flex items-center justify-center mr-4`}
        >
          <span className={`text-lg font-semibold ${textColor}`}>
            {initials}
          </span>
        </div>
        <div>
          <h4 className="font-semibold text-lg text-gray-900">{name}</h4>
          <span className="text-sm text-gray-500">
            {school} | {sport}
          </span>
        </div>
      </div>
      <p className="text-gray-600 mb-4">&ldquo;{quote}&rdquo;</p>
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className="w-5 h-5 text-yellow-400 fill-yellow-400"
            />
          ))}
        </div>
        <span className="text-sm font-medium text-green-600">{outcome}</span>
      </div>
    </div>
  );
}
