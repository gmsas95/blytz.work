import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";

export default function FAQ() {
  const employerFAQs = [
    {
      question: "How does Blytz Hire work?",
      answer: "Blytz Hire is a swipe-based platform that matches you with pre-vetted Southeast Asian virtual assistants. Simply create a profile, browse VA cards, swipe right on candidates you like, and start working together on weekly contracts.",
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
      question: "Can I work with multiple clients?",
      answer: "Yes! You can take on multiple contracts as long as you can manage the workload. Just make sure to update your availability in your profile.",
    },
    {
      question: "What if a client doesn't pay?",
      answer: "We handle all payments, so you never have to chase clients. If there's a payment dispute, our support team will mediate and ensure you're paid fairly for work completed.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-32">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Hero */}
          <div className="text-center space-y-6 mb-20">
            <h1 className="text-5xl lg:text-7xl text-black tracking-tight leading-tight">
              Frequently Asked{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Questions</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] -z-0" />
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about Blytz Hire
            </p>
          </div>

          {/* Employer FAQs */}
          <div className="mb-16">
            <h2 className="text-3xl text-black tracking-tight mb-8">For Employers</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {employerFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`employer-${index}`}
                  className="border-2 border-gray-200 rounded-xl px-6 data-[state=open]:border-black"
                >
                  <AccordionTrigger className="text-lg text-black hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* VA FAQs */}
          <div className="mb-16">
            <h2 className="text-3xl text-black tracking-tight mb-8">For Virtual Assistants</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {vaFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`va-${index}`}
                  className="border-2 border-gray-200 rounded-xl px-6 data-[state=open]:border-black"
                >
                  <AccordionTrigger className="text-lg text-black hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact CTA */}
          <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-gray-200">
            <h2 className="text-2xl text-black tracking-tight mb-4">Still have questions?</h2>
            <p className="text-lg text-gray-600 mb-6">
              Our team is here to help. Reach out anytime.
            </p>
            <a href="mailto:support@blytz.app" className="text-black hover:underline text-lg">
              support@blytz.app
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
