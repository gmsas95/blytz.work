"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Clock, DollarSign, MessageCircle, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EmployerDiscover() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");

  // Mock data for VAs - replace with real data from Firebase
  const virtualAssistants = [
    {
      id: "1",
      name: "Maria Santos",
      role: "E-commerce Specialist",
      rate: 12,
      experience: "3 years",
      rating: 4.8,
      reviews: 24,
      hoursCompleted: 1250,
      skills: ["Shopify", "Customer Service", "Data Entry", "Social Media"],
      availability: "Full-time",
      responseTime: "2 hours",
      avatar: "MS",
      featured: true,
    },
    {
      id: "2", 
      name: "John Reyes",
      role: "Marketing VA",
      rate: 15,
      experience: "5 years",
      rating: 4.9,
      reviews: 18,
      hoursCompleted: 890,
      skills: ["Content Creation", "SEO", "Email Marketing", "Analytics"],
      availability: "Part-time",
      responseTime: "1 hour",
      avatar: "JR",
      featured: true,
    },
    {
      id: "3",
      name: "Anna Garcia",
      role: "Administrative Assistant",
      rate: 10,
      experience: "2 years", 
      rating: 4.7,
      reviews: 15,
      hoursCompleted: 680,
      skills: ["Calendar Management", "Email Handling", "Document Preparation", "Research"],
      availability: "Full-time",
      responseTime: "3 hours",
      avatar: "AG",
      featured: false,
    },
    {
      id: "4",
      name: "David Chen",
      role: "Tech Support VA",
      rate: 18,
      experience: "4 years",
      rating: 4.9,
      reviews: 31,
      hoursCompleted: 1520,
      skills: ["Technical Support", "Troubleshooting", "Software Training", "IT Documentation"],
      availability: "Full-time",
      responseTime: "1 hour",
      avatar: "DC",
      featured: true,
    },
    {
      id: "5",
      name: "Lisa Rodriguez",
      role: "Social Media Manager",
      rate: 14,
      experience: "3 years",
      rating: 4.6,
      reviews: 12,
      hoursCompleted: 450,
      skills: ["Instagram", "Facebook", "Content Planning", "Community Management"],
      availability: "Part-time", 
      responseTime: "2 hours",
      avatar: "LR",
      featured: false,
    },
  ];

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please sign in to access discover page");
      router.push("/auth");
      return;
    }

    const role = localStorage.getItem("userRole");
    setUserRole(role);

    if (role && role !== "employer") {
      toast.error("This page is for employers only");
      router.push("/va/dashboard");
      return;
    }

    if (!role && user) {
      router.push("/select-role");
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading discover page...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== "employer") {
    return null;
  }

  // Filter VAs based on search and filters
  const filteredVAs = virtualAssistants.filter((va) => {
    const matchesSearch = va.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         va.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         va.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
                           (selectedCategory === "ecommerce" && va.role.includes("E-commerce")) ||
                           (selectedCategory === "marketing" && va.role.includes("Marketing")) ||
                           (selectedCategory === "admin" && va.role.includes("Administrative")) ||
                           (selectedCategory === "tech" && va.role.includes("Tech")) ||
                           (selectedCategory === "social" && va.role.includes("Social"));
    
    const matchesExperience = selectedExperience === "all" ||
                            (selectedExperience === "entry" && parseInt(va.experience) <= 2) ||
                            (selectedExperience === "mid" && parseInt(va.experience) > 2 && parseInt(va.experience) <= 4) ||
                            (selectedExperience === "senior" && parseInt(va.experience) > 4);

    return matchesSearch && matchesCategory && matchesExperience;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/employer/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-black">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="border-black text-black">
                <MessageCircle className="w-4 h-4 mr-2" />
                Messages
              </Button>
              <div className="w-10 h-10 rounded-full bg-[#FFD600] flex items-center justify-center text-black">
                {user.displayName?.substring(0, 2) || user.email?.substring(0, 2) || "JD"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 max-w-7xl py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-4xl text-black tracking-tight mb-4">Discover Virtual Assistants</h1>
            <p className="text-gray-600 text-lg">Find the perfect virtual assistant for your business needs</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, role, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-black"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48 border-black">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="admin">Administrative</SelectItem>
                  <SelectItem value="tech">Tech Support</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger className="w-full md:w-48 border-black">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid (3-4 years)</SelectItem>
                  <SelectItem value="senior">Senior (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured VAs */}
          <div className="space-y-4">
            <h2 className="text-2xl text-black tracking-tight">Featured Virtual Assistants</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVAs.filter(va => va.featured).map((va) => (
                <Card key={va.id} className="border-2 border-gray-200 hover:border-black transition-all overflow-hidden">
                  {/* Featured Badge */}
                  <div className="bg-[#FFD600] px-3 py-1 text-black text-sm font-medium text-center">
                    ⭐ Featured
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {/* VA Profile */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD600] to-[#FFB800] flex items-center justify-center text-black text-xl font-medium">
                        {va.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl text-black font-medium">{va.name}</h3>
                        <p className="text-gray-600">{va.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{va.rating}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{va.reviews} reviews</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-black font-medium">${va.rate}/hr</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-black">{va.experience}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-gray-400" />
                        <span className="text-black">{va.responseTime} response</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={va.availability === "Full-time" ? "default" : "secondary"}>
                          {va.availability}
                        </Badge>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {va.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {va.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{va.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="text-black font-medium">{va.hoursCompleted}+ hours</span> completed
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-black text-black">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button className="flex-1 bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                        Hire Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* All VAs */}
          <div className="space-y-4">
            <h2 className="text-2xl text-black tracking-tight">All Virtual Assistants ({filteredVAs.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVAs.filter(va => !va.featured).map((va) => (
                <Card key={va.id} className="border-2 border-gray-200 hover:border-black transition-all overflow-hidden">
                  <div className="p-6 space-y-4">
                    {/* VA Profile */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD600] to-[#FFB800] flex items-center justify-center text-black text-xl font-medium">
                        {va.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl text-black font-medium">{va.name}</h3>
                        <p className="text-gray-600">{va.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{va.rating}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{va.reviews} reviews</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-black font-medium">${va.rate}/hr</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-black">{va.experience}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-gray-400" />
                        <span className="text-black">{va.responseTime} response</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={va.availability === "Full-time" ? "default" : "secondary"}>
                          {va.availability}
                        </Badge>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {va.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {va.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{va.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="text-black font-medium">{va.hoursCompleted}+ hours</span> completed
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-black text-black">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button className="flex-1 bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                        Hire Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* No Results */}
          {filteredVAs.length === 0 && (
            <Card className="p-12 border-2 border-dashed border-gray-300 text-center">
              <p className="text-gray-600 text-lg mb-4">No virtual assistants found matching your criteria</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedExperience("all");
                }}
                className="border-black text-black"
              >
                Clear Filters
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}