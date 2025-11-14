'use client';

import { Zap, ShieldCheck, Gamepad2 } from "lucide-react";

export function WhyBlytz() {
  const features = [
    {
      icon: Zap,
      emoji: "⚡",
      title: "Speed",
      description: "Swipe-based hiring — find your VA in minutes, not weeks.",
    },
    {
      icon: ShieldCheck,
      emoji: "🤝",
      title: "Trust",
      description: "Every VA is verified, pre-vetted, and time-zone ready.",
    },
    {
      icon: Gamepad2,
      emoji: "🎮",
      title: "Experience",
      description: "A fun, intuitive interface that makes hiring feel human.",
    },
  ];

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-5xl lg:text-6xl text-black tracking-tight">
            Why founders love Blytz Hire.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="relative p-10 rounded-2xl border-2 border-gray-200 hover:border-black transition-all bg-white group overflow-hidden hover:-translate-y-2"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#FFD600] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

                <div className="text-6xl mb-6">
                  {feature.emoji}
                </div>
                <h3 className="text-3xl mb-4 text-black tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </p>

                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FFD600] rounded-full opacity-0 group-hover:opacity-10 transition-opacity blur-2xl" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}