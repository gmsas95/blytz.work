import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-32">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-5xl lg:text-6xl text-black tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-gray-600 text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">1. Information We Collect</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>We collect information you provide directly to us, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account information (name, email, password)</li>
                    <li>Profile information (skills, experience, hourly rate)</li>
                    <li>Payment information (processed securely through Stripe)</li>
                    <li>Communications between employers and VAs</li>
                    <li>Usage data and analytics</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">2. How We Use Your Information</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Match employers with suitable VAs</li>
                    <li>Process payments and prevent fraud</li>
                    <li>Send you updates, newsletters, and promotional materials (with your consent)</li>
                    <li>Respond to your comments and questions</li>
                    <li>Monitor and analyze trends and usage</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">3. Information Sharing</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>We share information in the following circumstances:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>With employers and VAs:</strong> We share profile information to facilitate matching
                    </li>
                    <li>
                      <strong>With service providers:</strong> We use third-party services for payment processing, analytics, and hosting
                    </li>
                    <li>
                      <strong>For legal reasons:</strong> When required by law or to protect our rights
                    </li>
                    <li>
                      <strong>With your consent:</strong> When you authorize us to share information
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">4. Data Security</h2>
                <p className="text-gray-700 leading-relaxed">
                  We implement reasonable security measures to protect your information from unauthorized access, alteration, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">5. Cookies and Tracking</h2>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar tracking technologies to collect usage information and improve your experience. You can control cookies through your browser settings, but disabling them may affect functionality.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">6. Your Rights</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Export your data</li>
                    <li>Object to certain data processing</li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, contact us at{" "}
                    <a href="mailto:privacy@blytz.app" className="text-black hover:underline">
                      privacy@blytz.app
                    </a>
                  </p>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">7. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for legal compliance, fraud prevention, and dispute resolution.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">8. International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We take appropriate safeguards to ensure your data is protected in accordance with this Privacy Policy.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">9. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our Service is not intended for users under 18 years of age. We do not knowingly collect information from children. If we learn we have collected information from a child, we will delete it immediately.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">10. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice on our platform.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">11. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:privacy@blytz.app" className="text-black hover:underline">
                    privacy@blytz.app
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
