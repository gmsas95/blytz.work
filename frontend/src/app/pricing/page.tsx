"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Zap, Clock, ShieldCheck, RefreshCw, FileText, Users, Check } from "lucide-react";

export default function PricingPage() {
  const tiers = [
    {
      name: "Part-Time",
      hoursPerWeek: "20 hrs",
      vaPay: "$8–$10",
      clientPay: "$12–$15",
      platformFee: "$4–$5",
      fastHireFee: "$20",
      popular: false,
      notes: "Flexible, budget-friendly",
      features: [
        "Pre-vetted, verified VAs",
        "Weekly payments & invoicing",
        "Contracts, compliance & dispute support",
        "Replacement guarantee",
        "Dedicated support",
      ],
    },
    {
      name: "Full-Time",
      hoursPerWeek: "40 hrs",
      vaPay: "$12–$15",
      clientPay: "$18–$25",
      platformFee: "$6–$10",
      fastHireFee: "$25",
      popular: true,
      notes: "Reliable, vetted, fast match",
      features: [
        "All Part-Time features included",
        "Priority support",
        "Advanced filtering options",
        "Performance analytics",
      ],
    },
    {
      name: "Premium",
      hoursPerWeek: "40+ hrs",
      vaPay: "$15–$20",
      clientPay: "$25–$35",
      platformFee: "$10–$15",
      fastHireFee: "$50",
      popular: false,
      notes: "Specialized, urgent hire",
      features: [
        "All Full-Time features included",
        "White-glove service",
        "Custom screening criteria",
        "Dedicated account manager",
        "First 48 hours guarantee",
      ],
    },
  ];

  const includedFeatures = [
    {
      icon: Zap,
      title: "Instant matching",
      description: "Get matched in under 24 hours",
    },
    {
      icon: ShieldCheck,
      title: "Pre-vetted, verified VAs",
      description: "Skills and reliability checks included",
    },
    {
      icon: Clock,
      title: "Weekly payments & invoicing",
      description: "Transparent billing and automated payments",
    },
    {
      icon: FileText,
      title: "Contracts, compliance & dispute support",
      description: "Full legal and administrative support",
    },
    {
      icon: RefreshCw,
      title: "Replacement guarantee",
      description: "Free VA replacement if needed",
    },
    {
      icon: Users,
      title: "Dedicated support",
      description: "Personal assistance when you need it",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            className="text-center space-y-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl text-black tracking-tight leading-tight">
              Transparent{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Pricing</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] -z-0" />
              </span>
              {" "}That Works for Everyone
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              You pay one rate. Your VA gets paid fairly. Optional fast-hire for instant matching.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] bg-white rounded-2xl shadow-xl border border-gray-200">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-6 text-left text-gray-600 font-medium">Tier</th>
                  <th className="p-6 text-center text-gray-600 font-medium">Hours / Week</th>
                  <th className="p-6 text-center text-gray-600 font-medium">VA Pay</th>
                  <th className="p-6 text-center text-gray-600 font-medium">Client Pay</th>
                  <th className="p-6 text-center text-gray-600 font-medium">Platform Fee</th>
                  <th className="p-6 text-center text-gray-600 font-medium">Fast-Hire Fee</th>
                  <th className="p-6 text-center text-gray-600 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, index) => (
                  <tr 
                    key={index}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      tier.popular ? 'bg-[#FFD600]/5' : ''
                    }`}
                  >
                    <td className="p-6 font-medium text-black">
                      {tier.name}
                      {tier.popular && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 bg-[#FFD600] text-black text-xs rounded-full">
                          Popular
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-center text-gray-700">{tier.hoursPerWeek}</td>
                    <td className="p-6 text-center text-gray-700">${tier.vaPay}</td>
                    <td className="p-6 text-center font-medium text-black">${tier.clientPay}</td>
                    <td className="p-6 text-center text-gray-700">${tier.platformFee}</td>
                    <td className="p-6 text-center text-gray-700">${tier.fastHireFee}</td>
                    <td className="p-6 text-center text-sm text-gray-600">{tier.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            className="text-center space-y-6 mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl lg:text-6xl text-black tracking-tight">
              What's{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Included</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] -z-0" />
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {includedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="p-8 rounded-2xl border-2 border-gray-200 hover:border-black transition-all bg-white group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  whileHover={{ y: -8 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-black group-hover:bg-[#FFD600] flex items-center justify-center transition-all">
                      <Icon className="w-7 h-7 text-[#FFD600] group-hover:text-black transition-all" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl mb-3 text-black tracking-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fast-Hire Option */}
      <section className="py-32 bg-[#FFD600] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
          <motion.div
            className="space-y-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 bg-black text-[#FFD600] px-6 py-3 rounded-full">
              <Zap className="w-5 h-5" fill="#FFD600" />
              <span className="text-lg">Need a VA Right Now?</span>
            </div>

            <h2 className="text-5xl lg:text-6xl text-black tracking-tight leading-tight">
              Skip the Queue. Add{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Fast-Hire</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-black -z-0" />
              </span>
            </h2>

            <p className="text-2xl text-black/80 max-w-3xl mx-auto">
              Add $20–$50 to get matched immediately. No waiting, no delays.
            </p>

            <Button
              size="lg"
              className="bg-black text-[#FFD600] hover:bg-gray-900 text-xl px-12 py-7 shadow-2xl"
            >
              Get Matched Immediately
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Fair Pay Promise */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl lg:text-6xl text-black tracking-tight leading-tight">
              Our{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Fair Pay</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] -z-0" />
              </span>
              {" "}Promise
            </h2>

            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              We pay VAs fairly. You see exactly what goes to your VA and what the platform fee covers. No hidden costs, no surprises — just transparent pricing that works for everyone.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <motion.div
                className="p-6 rounded-2xl border-2 border-gray-200 bg-white"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="text-3xl mb-2">🤝</div>
                <h3 className="text-xl font-medium text-black mb-2">Fair to VAs</h3>
                <p className="text-gray-600">Competitive wages that reflect skills and experience</p>
              </motion.div>

              <motion.div
                className="p-6 rounded-2xl border-2 border-gray-200 bg-white"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="text-3xl mb-2">💵</div>
                <h3 className="text-xl font-medium text-black mb-2">Transparent to You</h3>
                <p className="text-gray-600">See exactly where your money goes, no hidden fees</p>
              </motion.div>

              <motion.div
                className="p-6 rounded-2xl border-2 border-gray-200 bg-white"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="text-xl font-medium text-black mb-2">Sustainable Platform</h3>
                <p className="text-gray-600">Fair fees allow us to keep improving service</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-black text-white">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl lg:text-6xl tracking-tight">
              Start Your First{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Hire Today</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] -z-0" />
              </span>
            </h2>

            <Button
              size="lg"
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black text-xl px-12 py-7 shadow-2xl"
            >
              Get Matched in Under 24 Hours
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}