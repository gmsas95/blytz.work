import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Zap, X, Heart, Star, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface VA {
  id: string;
  name: string;
  role: string;
  rate: number;
  experience: string;
  skills: string[];
  timezone: string;
  rating: number;
  reviews: number;
  bio: string;
  avatar: string;
}

export default function EmployerDiscover() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock VA data
  const vas: VA[] = [
    {
      id: "1",
      name: "Maria Santos",
      role: "E-commerce Specialist",
      rate: 12,
      experience: "4 years",
      skills: ["Shopify", "Amazon FBA", "Product Listing", "Inventory Management"],
      timezone: "GMT+8",
      rating: 4.9,
      reviews: 127,
      bio: "Experienced e-commerce VA specializing in Shopify store management and Amazon FBA operations. I've helped scale multiple DTC brands.",
      avatar: "MS",
    },
    {
      id: "2",
      name: "John Reyes",
      role: "Marketing VA",
      rate: 15,
      experience: "5 years",
      skills: ["Facebook Ads", "Google Ads", "Email Marketing", "Analytics"],
      timezone: "GMT+8",
      rating: 5.0,
      reviews: 89,
      bio: "Digital marketing specialist with proven track record in paid advertising and email campaigns. ROI-focused approach.",
      avatar: "JR",
    },
    {
      id: "3",
      name: "Sarah Lee",
      role: "Admin Assistant",
      rate: 10,
      experience: "3 years",
      skills: ["Calendar Management", "Email", "Data Entry", "Scheduling"],
      timezone: "GMT+8",
      rating: 4.8,
      reviews: 156,
      bio: "Detail-oriented admin assistant who keeps busy founders organized. Proficient in all major productivity tools.",
      avatar: "SL",
    },
  ];

  const currentVA = vas[currentIndex];

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      console.log("Liked:", currentVA.name);
      // TODO: Save match to Firebase
    }
    
    if (currentIndex < vas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reset or show "no more VAs" message
      setCurrentIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link to="/employer/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#FFD600]" fill="#FFD600" />
              </div>
              <span className="text-xl text-black tracking-tight">Blytz Hire</span>
            </Link>
            <Link to="/employer/dashboard">
              <Button variant="outline" size="sm" className="border-black text-black">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 max-w-4xl py-12">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl text-black tracking-tight">Discover VAs</h1>
            <p className="text-gray-600 text-lg">
              Swipe right to connect, left to pass
            </p>
          </div>

          {/* Swipe Cards */}
          <div className="relative h-[600px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentVA && (
                <motion.div
                  key={currentVA.id}
                  initial={{ scale: 0.9, opacity: 0, rotateY: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  exit={{ scale: 0.9, opacity: 0, rotateY: -90 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-2xl"
                >
                  <Card className="p-8 border-2 border-gray-200 bg-white shadow-2xl">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD600] to-[#FFB800] flex items-center justify-center text-black text-2xl">
                            {currentVA.avatar}
                          </div>
                          <div>
                            <h2 className="text-3xl text-black tracking-tight mb-1">
                              {currentVA.name}
                            </h2>
                            <p className="text-gray-600 text-lg">{currentVA.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl text-black">${currentVA.rate}/hr</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-5 h-5 fill-[#FFD600] text-[#FFD600]" />
                            <span className="text-lg">
                              {currentVA.rating} ({currentVA.reviews})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-5 h-5" />
                          <span>{currentVA.experience} experience</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-5 h-5" />
                          <span>{currentVA.timezone}</span>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-lg text-gray-700 leading-relaxed">{currentVA.bio}</p>

                      {/* Skills */}
                      <div className="space-y-3">
                        <h3 className="text-lg text-black">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {currentVA.skills.map((skill, i) => (
                            <Badge
                              key={i}
                              className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 text-sm border-0"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6">
            <motion.button
              onClick={() => handleSwipe("left")}
              className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 hover:border-red-500 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-8 h-8" />
            </motion.button>

            <motion.button
              onClick={() => handleSwipe("right")}
              className="w-20 h-20 rounded-full bg-[#FFD600] hover:bg-[#FFD600]/90 flex items-center justify-center text-black transition-all shadow-xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Zap className="w-10 h-10" fill="black" />
            </motion.button>

            <motion.button
              onClick={() => handleSwipe("right")}
              className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 hover:border-green-500 flex items-center justify-center text-gray-400 hover:text-green-500 transition-all shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className="w-8 h-8" />
            </motion.button>
          </div>

          {/* Progress */}
          <div className="text-center text-gray-500">
            {currentIndex + 1} / {vas.length}
          </div>
        </div>
      </main>
    </div>
  );
}
