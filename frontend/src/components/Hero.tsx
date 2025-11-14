"use client";

import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  const mockVAs = [
    { name: "Maria Santos", role: "E-commerce Specialist", rate: "$12/hr", skills: "Shopify, Amazon FBA", timezone: "GMT+8" },
    { name: "John Reyes", role: "Marketing VA", rate: "$15/hr", skills: "Facebook Ads, Google Ads", timezone: "GMT+8" },
    { name: "Sarah Lee", role: "Admin Assistant", rate: "$10/hr", skills: "Calendar, Email, Data Entry", timezone: "GMT+8" },
  ];

  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      
      {/* Yellow accent circles */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#FFD600] rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#FFD600] rounded-full blur-[120px] opacity-20" />
      
      <div className="relative container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-black text-[#FFD600] px-4 py-2 rounded-full">
              <Zap className="w-4 h-4" fill="#FFD600" />
              <span>Blytz Speed Hiring</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl tracking-tight text-black leading-[1.1]">
              Hire your next VA in under{" "}
              <span className="relative inline-block">
                <span className="relative z-10">5 minutes.</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] -z-0" />
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
              Pre-vetted Southeast Asian virtual assistants, ready for short-term weekly contracts.
              <br />
              No interviews. No recruiter fees. Just <strong className="text-black">speed, trust, and experience</strong> — powered by Blytz.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="yellow" size="lg" className="text-lg px-8 shadow-lg hover:shadow-xl transition-all">
                Get Matches Now
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 border-2 border-black text-black hover:bg-black hover:text-[#FFD600] transition-all">
                See How It Works
              </Button>
            </div>
          </motion.div>
          
          {/* Swipe Interface Mockup */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative max-w-md mx-auto">
              {/* Phone Frame */}
              <div className="relative bg-black rounded-[3rem] p-4 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Status Bar */}
                  <div className="bg-black text-white px-6 py-3 flex justify-between items-center text-sm">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-white rounded-full" />
                      <div className="w-4 h-4 bg-white rounded-full" />
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  
                  {/* App Content */}
                  <div className="p-6 space-y-4 min-h-[600px] bg-gradient-to-b from-white to-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl text-black">Find Your VA</h3>
                      <Zap className="w-6 h-6 text-[#FFD600]" fill="#FFD600" />
                    </div>
                    
                    {/* VA Cards Stack */}
                    <div className="relative h-[400px]">
                      {mockVAs.map((va, index) => (
                        <motion.div
                          key={index}
                          className="absolute w-full"
                          initial={{ scale: 1 - index * 0.05, y: index * 10, opacity: 1 - index * 0.3 }}
                          animate={{ 
                            scale: 1 - index * 0.05, 
                            y: index * 10,
                            rotate: index === 0 ? [-1, 1, -1] : 0
                          }}
                          transition={{ 
                            rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                          }}
                        >
                          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-xl">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD600] to-[#FFB800] mb-4" />
                            <h4 className="text-xl text-black mb-2">{va.name}</h4>
                            <p className="text-gray-600 mb-3">{va.role}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {va.skills.split(", ").map((skill, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                              <span className="text-2xl text-black">{va.rate}</span>
                              <span className="text-sm text-gray-500">{va.timezone}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Swipe Actions */}
                    <div className="flex justify-center gap-6 pt-4">
                      <motion.button 
                        className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ✕
                      </motion.button>
                      <motion.button 
                        className="w-16 h-16 rounded-full bg-[#FFD600] flex items-center justify-center text-2xl shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ⚡
                      </motion.button>
                      <motion.button 
                        className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-2xl text-white"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ♥
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
