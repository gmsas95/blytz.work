"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

export function Testimonials() {
  const testimonials = [
    {
      quote:
        "We got our VA within hours. The fastest hiring experience ever.",
      author: "Chris M.",
      role: "DTC Brand Owner, LA",
    },
    {
      quote: "Better than Upwork — I just swiped and hired.",
      author: "Jenny R.",
      role: "SaaS Founder, Austin",
    },
    {
      quote:
        "BlytzWork saved me weeks of interviewing. Unreal speed.",
      author: "Marcus T.",
      role: "E-commerce Entrepreneur, NYC",
    },
  ];

  return (
    <section className="py-32 bg-black text-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          className="text-center space-y-4 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl lg:text-6xl tracking-tight">
            See What Our Client{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Says.</span>
              <span className="absolute bottom-2 left-0 w-full h-2 bg-[#FFD600] -z-0" />
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="p-8 rounded-2xl border-2 border-gray-800 bg-gradient-to-b from-gray-900 to-black hover:border-[#FFD600] transition-all group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
              }}
              whileHover={{ y: -8 }}
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-[#FFD600] text-[#FFD600]"
                  />
                ))}
              </div>

              <blockquote className="text-xl text-white mb-8 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              <div className="pt-6 border-t border-gray-800">
                <div className="text-white mb-1">
                  {testimonial.author}
                </div>
                <div className="text-gray-400">
                  {testimonial.role}
                </div>
              </div>

              <div className="absolute inset-0 rounded-2xl bg-[#FFD600] opacity-0 group-hover:opacity-5 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}