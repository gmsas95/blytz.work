import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="py-24 pb-32">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center space-y-6 mb-20">
            <h1 className="text-5xl lg:text-6xl text-black tracking-tight leading-tight">
              Privacy{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Policy</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] z-0" />
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-12">
            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle>Information We Collect</CardTitle>
                <CardDescription>
                  Types of data we gather to provide our services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Personal Information</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-600">
                    <li>Name, email address, and contact information</li>
                    <li>Professional background and work experience</li>
                    <li>Payment and billing information</li>
                    <li>Government-issued identification (for verification)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Usage Data</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. We collect information about how you interact with our platform to improve our services.
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-600">
                    <li>Pages visited and time spent on our platform</li>
                    <li>Communication with other users</li>
                    <li>Contract details and work history</li>
                    <li>Device and browser information</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card>
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
                <CardDescription>
                  The purposes for which we process your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Service Provision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. We use your information to:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-600">
                    <li>Connect employers with qualified virtual assistants</li>
                    <li>Process payments and manage contracts</li>
                    <li>Provide customer support</li>
                    <li>Improve matching algorithms</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Communication</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-600">
                    <li>Send important account notifications</li>
                    <li>Provide updates about your contracts</li>
                    <li>Share relevant opportunities</li>
                    <li>Respond to your inquiries</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
                <CardDescription>
                  How we safeguard your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Security Measures</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-600">
                    <li>256-bit SSL encryption for data transmission</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Restricted access to personal data</li>
                    <li>Secure payment processing through Stripe</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Data Retention</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. We retain your information only as long as necessary to provide our services and comply with legal obligations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle>Your Rights</CardTitle>
                <CardDescription>
                  Control over your personal data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Data Control</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. You have the right to:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-600">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate data</li>
                    <li>Delete your account and data</li>
                    <li>Export your information</li>
                    <li>Opt out of marketing communications</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">How to Exercise Your Rights</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Contact our privacy team at privacy@blytzwork.com.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>
                  Questions about our privacy practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-black mb-1">Privacy Team</h4>
                    <p className="text-gray-600">privacy@blytzwork.com</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Data Protection Officer</h4>
                    <p className="text-gray-600">dpo@blytzwork.com</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Mailing Address</h4>
                    <p className="text-gray-600">
                      123 Privacy Street<br />
                      Suite 456<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Updated */}
          <div className="mt-20 text-center">
            <p className="text-gray-500">
              Last updated: January 15, 2024
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}