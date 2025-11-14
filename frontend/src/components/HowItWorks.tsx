import { Smartphone, Sparkles, RocketIcon } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

export function HowItWorks() {
  const steps = [
    {
      icon: Smartphone,
      number: "1",
      title: "Swipe",
      description: "Discover pre-vetted VAs by role, skill, and timezone. Our swipe interface makes shortlisting feel effortless.",
    },
    {
      icon: Sparkles,
      number: "2",
      title: "Match",
      description: "Our AI recommends your top fits instantly. No endless interviews — just clear matches that fit your workflow.",
    },
    {
      icon: RocketIcon,
      number: "3",
      title: "Hire",
      description: "Start a weekly contract — no recruiter, no delay. We handle the logistics so you can focus on running your business.",
    },
  ];

  return (
    <section id="how" className="py-32 bg-black text-white scroll-mt-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div 
          className="text-center space-y-4 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl lg:text-6xl tracking-tight">
            How hiring works —{" "}
            <span className="relative inline-block">
              <span className="relative z-10 no-underline text-[64px]">at Blytz speed.</span>
              <span className="absolute bottom-2 left-0 w-full h-2 bg-[#FFD600] -z-0" />
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                className="relative p-8 rounded-2xl border-2 border-gray-800 hover:border-[#FFD600] transition-all bg-gradient-to-b from-gray-900 to-black group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -8 }}
              >
                <div className="absolute -top-6 left-8 bg-[#FFD600] text-black w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-xl">
                  {step.number}
                </div>
                <div className="mt-6 space-y-4">
                  <Icon className="w-12 h-12 text-[#FFD600]" />
                  <h3 className="text-3xl tracking-tight">Step {index + 1} — {step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-[#FFD600] opacity-0 group-hover:opacity-5 transition-opacity" />
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Button size="lg" className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black text-lg px-10 shadow-xl hover:shadow-2xl transition-all">
            Start Matching
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
