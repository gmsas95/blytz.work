"use client";

import { Zap, ShieldCheck, DollarSign, FileText, RefreshCw, Headphones } from "lucide-react";
import { motion } from "framer-motion";

export function WhyBlytzWork() {
  const features = [
    {
      icon: Zap,
      emoji: "⚡",
      title: "Fastest Matching",
      description:
        "Most clients get a VA in less than 24 hours.",
    },
    {
      icon: ShieldCheck,
      emoji: "🛡",
      title: "Vetted Talent",
      description:
        "Verified skills and reliability checks.",
    },
    {
      icon: DollarSign,
      emoji: "💳",
      title: "Hassle-Free Payments",
      description:
        "Weekly invoicing, transparent rates.",
    },
    {
      icon: FileText,
      emoji: "📄",
      title: "We Handle Paperwork",
      description:
        "Contracts, time tracking, compliance.",
    },
    {
      icon: RefreshCw,
      emoji: "🔄",
      title: "Flexible Hours",
      description:
        "Part-time or full-time, you choose.",
    },
    {
      icon: Headphones,
      emoji: "🎧",
      title: "24/7 Support",
      description:
        "Dedicated support team whenever you need us.",
    },
  ];

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          className="text-center space-y-4 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl lg:text-6xl text-black tracking-tight">
            Speed Meets Quality
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="relative p-6 rounded-xl border-2 border-gray-200 hover:border-black transition-all bg-white group overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                }}
                whileHover={{ y: -8 }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#FFD600] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-black group-hover:bg-[#FFD600] flex items-center justify-center transition-all">
                    <Icon className="w-6 h-6 text-[#FFD600] group-hover:text-black transition-all" />
                  </div>
                  <div>
                    <h3 className="text-xl mb-2 text-black tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FFD600] rounded-full opacity-0 group-hover:opacity-10 transition-opacity blur-2xl" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}