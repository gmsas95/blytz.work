import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-32">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-5xl lg:text-6xl text-black tracking-tight">
                Terms of Service
              </h1>
              <p className="text-gray-600 text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  By accessing and using Blytz Hire ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">2. Description of Service</h2>
                <p className="text-gray-700 leading-relaxed">
                  Blytz Hire is a platform that connects employers with pre-vetted Southeast Asian virtual assistants. We facilitate matching, contracting, and payment processing but are not the employer of any VA listed on the platform.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">3. User Accounts</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>When you create an account, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Notify us immediately of any unauthorized access</li>
                    <li>Be responsible for all activities under your account</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">4. For Employers</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>As an employer using the Service, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Treat all VAs with professionalism and respect</li>
                    <li>Pay for services rendered in accordance with agreed rates</li>
                    <li>Provide clear task descriptions and expectations</li>
                    <li>Not misuse VA contact information or data</li>
                    <li>Comply with all applicable labor and employment laws</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">5. For Virtual Assistants</h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>As a VA using the Service, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate information about your skills and experience</li>
                    <li>Deliver quality work in a timely manner</li>
                    <li>Maintain professional communication with employers</li>
                    <li>Report hours worked accurately</li>
                    <li>Maintain confidentiality of client information</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">6. Payments and Fees</h2>
                <p className="text-gray-700 leading-relaxed">
                  All payments are processed through our secure payment system. Employers are billed weekly for hours worked. VAs receive payment weekly minus applicable fees. We reserve the right to modify our fee structure with 30 days notice.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">7. Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent, abusive, or illegal activities. Users may terminate their accounts at any time through their account settings.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">8. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed">
                  Blytz Hire is a platform connecting employers and VAs. We are not responsible for the quality of work, employment disputes, or any damages arising from the use of our Service. Our liability is limited to the fees paid to us in the preceding 12 months.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">9. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update these Terms of Service from time to time. Continued use of the Service after changes constitutes acceptance of the modified terms.
                </p>
              </section>

              <section className="space-y-6">
                <h2 className="text-3xl text-black tracking-tight">10. Contact</h2>
                <p className="text-gray-700 leading-relaxed">
                  For questions about these terms, please contact us at{" "}
                  <a href="mailto:legal@blytz.app" className="text-black hover:underline">
                    legal@blytz.app
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
