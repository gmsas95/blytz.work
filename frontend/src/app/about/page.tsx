import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Zap, Target, Heart, Rocket } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Zap,
      title: "Speed",
      description: "We believe hiring shouldn't take weeks. Our swipe-based platform gets you matched in minutes.",
    },
    {
      icon: Heart,
      title: "Trust",
      description: "Every VA is thoroughly vetted. We build trust through transparency and quality.",
    },
    {
      icon: Target,
      title: "Experience",
      description: "Hiring should feel human, not robotic. We've designed an interface that's intuitive and fun.",
    },
    {
      icon: Rocket,
      title: "Growth",
      description: "We're committed to helping both founders and VAs grow together through fair, flexible work.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-24 pb-32">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Hero */}
          <div className="text-center space-y-6 mb-20">
            <h1 className="text-5xl lg:text-7xl text-black tracking-tight leading-tight">
              About{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Blytz Hire</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] z-0" />
              </span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're building the fastest way for busy founders to hire pre-vetted Southeast Asian virtual assistants.
            </p>
          </div>

          {/* Story */}
          <div className="max-w-4xl mx-auto space-y-8 mb-32">
            <div className="bg-gray-50 rounded-2xl p-12 border-2 border-gray-200">
              <h2 className="text-3xl text-black tracking-tight mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Blytz Hire was born from a simple frustration: hiring virtual assistants was way too slow and complicated.
                </p>
                <p>
                  As founders ourselves, we spent weeks posting jobs, screening resumes, and conducting endless interviews — just to find someone to handle basic tasks. Meanwhile, talented VAs in Southeast Asia were struggling to connect with international clients.
                </p>
                <p>
                  We knew there had to be a better way. So we built it.
                </p>
                <p>
                  Blytz Hire combines the speed of modern matching apps with the trust of a vetted talent network. Swipe through profiles, find your match, and start working — all in under 5 minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-4xl lg:text-5xl text-black tracking-tight mb-4">Our Values</h2>
              <p className="text-xl text-gray-600">What drives us every day</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="p-8 rounded-2xl border-2 border-gray-200 hover:border-black transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-[#FFD600] flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-2xl text-black tracking-tight mb-3">{value.title}</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Note */}
          <div className="mt-32 text-center">
            <div className="bg-black text-white rounded-2xl p-12 max-w-4xl mx-auto">
              <h2 className="text-3xl tracking-tight mb-4">Built by founders, for founders</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                We're a small team obsessed with making remote hiring feel effortless. Got feedback? We'd love to hear from you.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}