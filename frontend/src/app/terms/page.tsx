import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="py-24 pb-32">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center space-y-6 mb-20">
            <h1 className="text-5xl lg:text-6xl text-black tracking-tight leading-tight">
              Terms of{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Service</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] z-0" />
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              By using Blytz Hire, you agree to these terms and conditions.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-12">
            {/* Acceptance of Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Acceptance of Terms</CardTitle>
                <CardDescription>
                  Your agreement to use our platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    By accessing or using Blytz Hire, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>
                  What Blytz Hire provides
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Blytz Hire is a platform that connects:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-600">
                    <li>Employers seeking virtual assistants with pre-vetted talent</li>
                    <li>Virtual assistants offering their professional services</li>
                    <li>Tools for contract management and payment processing</li>
                    <li>Communication and collaboration features</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Service Availability</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. We reserve the right to modify or discontinue services at any time without notice.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* User Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle>User Responsibilities</CardTitle>
                <CardDescription>
                  Your obligations as a platform user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Account Security</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. You are responsible for:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-600">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities under your account</li>
                    <li>Notifying us immediately of unauthorized access</li>
                    <li>Providing accurate and up-to-date information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Prohibited Activities</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. You may not:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-600">
                    <li>Use the platform for illegal purposes</li>
                    <li>Share false or misleading information</li>
                    <li>Attempt to gain unauthorized access</li>
                    <li>Interfere with platform functionality</li>
                    <li>Violate intellectual property rights</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Terms</CardTitle>
                <CardDescription>
                  How billing and payments work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Service Fees</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Our fee structure includes:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-600">
                    <li>Speed Hire Pass: $99/month for unlimited matching</li>
                    <li>Platform service fee: 10% for full payroll management</li>
                    <li>Direct hiring: No ongoing fees (one-time setup)</li>
                    <li>Additional charges may apply for premium features</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Payment Processing</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. All payments are processed securely through Stripe. We accept major credit cards and bank transfers for employer accounts. VAs receive payments weekly via their preferred method.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Refunds</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Refunds are evaluated on a case-by-case basis within 30 days of service.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle>Intellectual Property</CardTitle>
                <CardDescription>
                  Ownership and usage rights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Platform Content</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. The platform content, including design, text, graphics, and software, is owned by Blytz Hire and protected by copyright laws.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">User-Generated Content</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Users retain ownership of their content but grant Blytz Hire a license to use it for providing and improving our services.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card>
              <CardHeader>
                <CardTitle>Limitation of Liability</CardTitle>
                <CardDescription>
                  Our responsibility limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. To the fullest extent permitted by law, Blytz Hire shall not be liable for:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-600">
                    <li>Indirect, incidental, or consequential damages</li>
                    <li>Loss of profits or business opportunities</li>
                    <li>Data loss or corruption</li>
                    <li>Service interruptions or downtime</li>
                    <li>Actions of third-party users</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Maximum Liability</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Our total liability for any claim related to the service shall not exceed the amount you paid to us in the six months preceding the claim.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle>Termination</CardTitle>
                <CardDescription>
                  How accounts and contracts can be ended
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Account Termination</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Users may terminate their accounts at any time. We reserve the right to suspend or terminate accounts for violations of these terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-black mb-3">Effect of Termination</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Upon termination, you lose access to the platform and any rights to use our services. We may delete your data in accordance with our privacy policy.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>
                  Questions about these terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. If you have questions about these Terms of Service, please contact us.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-black mb-1">Legal Team</h4>
                    <p className="text-gray-600">legal@blytzhire.com</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Support</h4>
                    <p className="text-gray-600">support@blytzhire.com</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Mailing Address</h4>
                    <p className="text-gray-600">
                      123 Legal Street<br />
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