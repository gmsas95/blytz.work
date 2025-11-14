import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQPage() {
  const employerFAQs = [
    {
      question: "How does Blytz Hire work?",
      answer: "Blytz Hire is a speed hiring platform that connects you with pre-vetted Southeast Asian virtual assistants within minutes. Post your job requirements, get instant matches, review profiles, and start working together on weekly contracts — no lengthy interview process needed.",
    },
    {
      question: "How are VAs vetted?",
      answer: "All VAs go through a rigorous screening process including skills assessment, background verification, English proficiency testing, and portfolio review. We only accept the top 10% of applicants.",
    },
    {
      question: "What's the pricing?",
      answer: "VAs set their own hourly rates starting from $8/hr. You pay weekly based on hours worked. Our Speed Hire Pass ($99/mo) gives you unlimited matching and priority support. For full payroll management, we charge a 10% service fee.",
    },
    {
      question: "What if I'm not happy with my VA?",
      answer: "Weekly contracts mean you're never locked in. If a VA isn't the right fit, you can end the contract at any time. Speed Hire Pass members get free replacements anytime.",
    },
    {
      question: "How do payments work?",
      answer: "We handle all payments securely through Stripe. You're billed weekly for hours worked. VAs receive payment directly from us, so you don't have to manage international transfers.",
    },
  ];

  const vaFAQs = [
    {
      question: "How do I apply as a VA?",
      answer: "Click 'Apply as VA' on our homepage, create your profile with your skills and experience, and submit for review. Our team will evaluate your application within 48 hours.",
    },
    {
      question: "What qualifications do I need?",
      answer: "We look for VAs with proven experience in their field, strong English communication skills, reliable internet connection, and a professional work setup. Specific skill requirements vary by role.",
    },
    {
      question: "How do I get paid?",
      answer: "We process payments weekly via PayPal, Wise, or direct bank transfer. You'll receive payment every week for hours worked and approved by your client.",
    },
    {
      question: "How much can I earn?",
      answer: "VAs set their own rates starting from $8/hr. Top VAs with specialized skills can earn $15-25/hr. Your earnings depend on your skills, experience, and client ratings.",
    },
    {
      question: "What kind of work will I do?",
      answer: "Common tasks include administrative support, social media management, customer service, data entry, email management, bookkeeping, and more specialized roles like web development or graphic design.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-32">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Hero */}
          <div className="text-center space-y-6 mb-20">
            <h1 className="text-5xl lg:text-6xl text-black tracking-tight leading-tight">
              Frequently Asked{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Questions</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] z-0" />
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about Blytz Hire
            </p>
          </div>

          {/* Employer FAQs */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl text-black tracking-tight mb-4">For Employers</h2>
              <p className="text-lg text-gray-600">Questions from companies hiring VAs</p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {employerFAQs.map((faq, index) => (
                <AccordionItem key={index} value={`employer-${index}`} className="border-2 border-gray-200 rounded-xl px-6 hover:border-black transition-all">
                  <AccordionTrigger className="text-left text-lg font-medium text-gray-900 hover:text-black">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* VA FAQs */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl text-black tracking-tight mb-4">For Virtual Assistants</h2>
              <p className="text-lg text-gray-600">Questions from VAs looking to work with us</p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {vaFAQs.map((faq, index) => (
                <AccordionItem key={index} value={`va-${index}`} className="border-2 border-gray-200 rounded-xl px-6 hover:border-black transition-all">
                  <AccordionTrigger className="text-left text-lg font-medium text-gray-900 hover:text-black">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Still have questions */}
          <div className="mt-20 text-center">
            <div className="bg-black text-white rounded-2xl p-12 max-w-2xl mx-auto">
              <h2 className="text-2xl tracking-tight mb-4">Still have questions?</h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <button className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black px-8 py-3 rounded-lg font-medium transition-all">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}