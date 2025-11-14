import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyBlytz } from "@/components/WhyBlytz";
import { ForEmployers } from "@/components/ForEmployers";
import { ForVAs } from "@/components/ForVAs";
import { Testimonials } from "@/components/Testimonials";
import { Pricing } from "@/components/Pricing";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyBlytz />
      <ForEmployers />
      <ForVAs />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}