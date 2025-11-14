"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, MessageCircle, Clock, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VADashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  // Mock data - replace with real data from Firebase
  const activeContracts = [
    {
      id: "1",
      employerName: "TechStart Inc.",
      role: "E-commerce Specialist",
      rate: 12,
      hoursThisWeek: 32,
      status: "active",
    },
  ];

  const totalEarningsThisWeek = activeContracts.reduce(
    (sum, contract) => sum + contract.rate * contract.hoursThisWeek,
    0
  );

  const stats = {
    totalHours: 156,
    totalEarnings: 1872,
    activeClients: 1,
    rating: 4.9,
  };

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please sign in to access your dashboard");
      router.push("/auth");
      return;
    }

    // Check user role
    const role = localStorage.getItem("userRole");
    setUserRole(role);

    if (role && role !== "va") {
      toast.error("This dashboard is for virtual assistants only");
      router.push("/employer/dashboard");
      return;
    }

    // If no role set, redirect to role selection
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
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== "va") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#FFD600]" fill="#FFD600" />
              </div>
              <span className="text-xl text-black tracking-tight">Blytz Hire</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="border-black text-black">
                <MessageCircle className="w-4 h-4 mr-2" />
                Messages
              </Button>
              <div className="w-10 h-10 rounded-full bg-[#FFD600] flex items-center justify-center text-black">
                {user.displayName?.substring(0, 2) || user.email?.substring(0, 2) || "MS"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 max-w-7xl py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-4xl text-black tracking-tight mb-2">Dashboard</h1>
            <p className="text-gray-600 text-lg">Your VA workspace</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 border-2 border-gray-200">
              <div className="space-y-2">
                <p className="text-gray-600">This Week</p>
                <p className="text-3xl text-black">${totalEarningsThisWeek}</p>
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12% from last week</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-gray-200">
              <div className="space-y-2">
                <p className="text-gray-600">Hours This Week</p>
                <p className="text-3xl text-black">
                  {activeContracts.reduce((sum, c) => sum + c.hoursThisWeek, 0)}
                </p>
              </div>
            </Card>

            <Card className="p-6 border-2 border-gray-200">
              <div className="space-y-2">
                <p className="text-gray-600">Active Clients</p>
                <p className="text-3xl text-black">{stats.activeClients}</p>
              </div>
            </Card>

            <Card className="p-6 border-2 border-gray-200">
              <div className="space-y-2">
                <p className="text-gray-600">Rating</p>
                <p className="text-3xl text-black">⭐ {stats.rating}</p>
              </div>
            </Card>
          </div>

          {/* Active Contracts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-black tracking-tight">Active Contracts</h2>
            </div>

            <div className="grid gap-4">
              {activeContracts.map((contract) => (
                <Card
                  key={contract.id}
                  className="p-6 border-2 border-gray-200 hover:border-black transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD600] to-[#FFB800] flex items-center justify-center text-black text-xl">
                        {contract.employerName.substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-xl text-black mb-1">{contract.employerName}</h3>
                        <p className="text-gray-600">{contract.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-gray-600 text-sm">This Week</p>
                        <p className="text-2xl text-black">{contract.hoursThisWeek}h</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 text-sm">Rate</p>
                        <p className="text-2xl text-black">${contract.rate}/hr</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-black text-black">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button className="bg-black text-[#FFD600]" size="sm">
                          View Contract
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {activeContracts.length === 0 && (
                <Card className="p-12 border-2 border-dashed border-gray-300 text-center">
                  <p className="text-gray-600 text-lg mb-4">No active contracts yet</p>
                  <p className="text-gray-500 mb-6">
                    Keep your profile updated and you'll get matched with employers soon!
                  </p>
                  <Link href="/va/profile">
                    <Button className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                      Update Profile
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>

          {/* All Time Stats */}
          <Card className="p-8 border-2 border-gray-200 bg-gradient-to-br from-black to-gray-900 text-white">
            <h2 className="text-2xl mb-6 tracking-tight">All Time Stats</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="text-gray-400 mb-2">Total Hours</p>
                <p className="text-4xl">{stats.totalHours}h</p>
              </div>
              <div>
                <p className="text-gray-400 mb-2">Total Earnings</p>
                <p className="text-4xl text-[#FFD600]">${stats.totalEarnings}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-2">Completed Contracts</p>
                <p className="text-4xl">12</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}