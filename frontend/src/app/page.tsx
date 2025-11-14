import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyBlytz } from "@/components/WhyBlytz";
import { RolesWeFill } from "@/components/RolesWeFill";
import { Testimonials } from "@/components/Testimonials";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyBlytz />
      <RolesWeFill />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}