"use client";

import { Button } from "./ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-32 bg-[#FFD600] relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div className="absolute top-20 left-20 w-96 h-96 bg-black rounded-full blur-[120px] opacity-5" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-black rounded-full blur-[120px] opacity-5" />

      <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
        <motion.div
          className="space-y-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 bg-black text-[#FFD600] px-6 py-3 rounded-full">
            <Zap className="w-5 h-5" fill="#FFD600" />
            <span className="text-lg">
              Stop Wasting Time. Start Working.
            </span>
          </div>

          <h2 className="text-5xl lg:text-7xl text-black tracking-tight leading-tight">
            Ready to hire your next VA?
          </h2>

          <p className="text-3xl text-black/80 max-w-3xl mx-auto">
            Swipe. Match. Hire. Done.
          </p>

          <div className="flex flex-wrap justify-center gap-6 pt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-black text-[#FFD600] hover:bg-gray-900 text-xl px-12 py-7 shadow-2xl"
              >
                Get Matched in Under 24 Hours
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="text-xl px-12 py-7 border-2 border-black text-black hover:bg-black hover:text-[#FFD600] bg-white/50 backdrop-blur-sm"
              >
                See Pricing
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}