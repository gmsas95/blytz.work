"use client";

import { Button } from "./ui/button";
import { ShoppingCart, Megaphone, Calendar, Headphones, Users, BarChart, Briefcase, Phone } from "lucide-react";
import { motion } from "framer-motion";

export function RolesWeFill() {
  const roles = [
    {
      icon: Users,
      title: "Virtual Assistants",
    },
    {
      icon: Megaphone,
      title: "Marketing",
    },
    {
      icon: ShoppingCart,
      title: "E-commerce",
    },
    {
      icon: Calendar,
      title: "Admin",
    },
    {
      icon: Headphones,
      title: "Customer Support",
    },
    {
      icon: Phone,
      title: "Social Media",
    },
    {
      icon: BarChart,
      title: "Operations",
    },
    {
      icon: Briefcase,
      title: "Executive Assistance",
    },
  ];

  return (
    <section className="py-32 bg-gray-50">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          className="text-center space-y-4 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl lg:text-6xl text-black tracking-tight">
            Roles We Can{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Fill.</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] -z-0" />
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={index}
                className="p-6 rounded-xl border-2 border-gray-200 hover:border-black transition-all bg-white group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-black group-hover:bg-[#FFD600] flex items-center justify-center transition-all">
                    <Icon className="w-6 h-6 text-[#FFD600] group-hover:text-black transition-all" />
                  </div>
                  <span className="text-lg text-gray-700">{role.title}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-xl text-gray-600 mb-6">
            ...and many more specialized roles.
          </p>
        </motion.div>
      </div>
    </section>
  );
}