"use client";

import { Button } from "./ui/button";
import { Globe, DollarSign, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function ForVAs() {
  const benefits = [
    {
      icon: Globe,
      text: "Work with top U.S. founders",
    },
    {
      icon: Clock,
      text: "Weekly contracts, fully remote",
    },
    {
      icon: DollarSign,
      text: "Secure payments managed for you",
    },
  ];

  return (
    <section id="vas" className="py-32 bg-white scroll-mt-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="space-y-8 order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl lg:text-6xl text-black tracking-tight leading-tight">
              Work with top U.S. founders — weekly, remote, flexible.
            </h2>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Join a growing pool of Southeast Asian VAs trusted by international clients.
              You bring the skills, we handle the exposure, matching, and payments.
            </p>

            <div className="space-y-4 pt-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
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
                    <span className="text-xl text-gray-700">{benefit.text}</span>
                  </motion.div>
                );
              })}
            </div>

            <Button size="lg" variant="outline" className="text-lg px-10 mt-8 border-2 border-black text-black hover:bg-black hover:text-[#FFD600] transition-all">
              Apply as VA
            </Button>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFD600] rounded-3xl blur-2xl opacity-20" />
              <img
                src="https://images.unsplash.com/photo-1594501252028-2bb7b21d01b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aXJ0dWFsJTIwYXNzaXN0YW50JTIwd29ya3NwYWNlfGVufDF8fHx8MTc2Mjk1NjE3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Virtual assistant workspace"
                className="relative rounded-3xl shadow-2xl w-full border-2 border-gray-200"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
