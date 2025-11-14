"use client";

import { Button } from "./ui/button";
import { ShoppingCart, Megaphone, Calendar, Headphones } from "lucide-react";
import { motion } from "framer-motion";

export function ForEmployers() {
  const services = [
    {
      icon: ShoppingCart,
      text: "E-commerce operations",
    },
    {
      icon: Megaphone,
      text: "Marketing and ads management",
    },
    {
      icon: Calendar,
      text: "Admin, data entry, scheduling",
    },
    {
      icon: Headphones,
      text: "Customer service & inbox management",
    },
  ];

  return (
    <section className="py-32 bg-gray-50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFD600] rounded-3xl blur-2xl opacity-20" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-400">hyred.blytz.app</div>
                  </div>
                  <div className="text-2xl text-black mb-4">🎯 Instant Match Found!</div>
                  <div className="space-y-3">
                    {["Maria Santos", "John Reyes", "Sarah Lee"].map((name, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD600] to-[#FFB800]" />
                        <div>
                          <div className="text-black">{name}</div>
                          <div className="text-sm text-gray-500">95% Match</div>
                        </div>
                        <div className="ml-auto text-xl">⚡</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl lg:text-6xl text-black tracking-tight leading-tight">
              Built for busy founders, solopreneurs, and small teams.
            </h2>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              You're too busy running your startup to screen 50 resumes.
              We help you skip the noise — and instantly match with trusted VAs from Southeast Asia who can handle:
            </p>

            <div className="space-y-4">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div 
                    key={index} 
                    className="flex items-center gap-4 group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-black group-hover:bg-[#FFD600] flex items-center justify-center transition-all">
                      <Icon className="w-7 h-7 text-[#FFD600] group-hover:text-black transition-all" />
                    </div>
                    <span className="text-xl text-gray-700">{service.text}</span>
                  </motion.div>
                );
              })}
            </div>

            <Button size="lg" className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black text-lg px-10 shadow-xl mt-8">
              Find Your VA Now
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
