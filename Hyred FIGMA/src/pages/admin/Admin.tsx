import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Zap, Users, Briefcase, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function Admin() {
  // Mock data - replace with Firebase queries
  const stats = {
    totalEmployers: 47,
    totalVAs: 156,
    activeContracts: 34,
    totalRevenue: 12840,
    weeklyGrowth: 12,
  };

  const recentEmployers = [
    { id: "1", name: "TechStart Inc.", email: "john@techstart.com", joinedDate: "2024-01-10", status: "active" },
    { id: "2", name: "DTC Brand Co", email: "sarah@dtcbrand.com", joinedDate: "2024-01-09", status: "active" },
  ];

  const recentVAs = [
    { id: "1", name: "Maria Santos", email: "maria@example.com", rate: 12, rating: 4.9, status: "active" },
    { id: "2", name: "John Reyes", email: "john@example.com", rate: 15, rating: 5.0, status: "active" },
  ];

  const recentMatches = [
    { id: "1", employer: "TechStart Inc.", va: "Maria Santos", role: "E-commerce", date: "2024-01-10" },
    { id: "2", employer: "DTC Brand Co", va: "John Reyes", role: "Marketing", date: "2024-01-09" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white border-b border-gray-800">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-[#FFD600] flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" fill="black" />
              </div>
              <span className="text-xl tracking-tight">Blytz Admin</span>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm" className="border-[#FFD600] text-[#FFD600] hover:bg-[#FFD600] hover:text-black">
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 max-w-7xl py-12">
        <div className="space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-4xl text-black tracking-tight mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 text-lg">Platform overview and management</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-5 gap-6">
            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-5 h-5 text-gray-600" />
                <p className="text-gray-600">Employers</p>
              </div>
              <p className="text-3xl text-black">{stats.totalEmployers}</p>
            </Card>

            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-gray-600" />
                <p className="text-gray-600">VAs</p>
              </div>
              <p className="text-3xl text-black">{stats.totalVAs}</p>
            </Card>

            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-gray-600" />
                <p className="text-gray-600">Active</p>
              </div>
              <p className="text-3xl text-black">{stats.activeContracts}</p>
            </Card>

            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <p className="text-gray-600">Revenue</p>
              </div>
              <p className="text-3xl text-[#FFD600]">${stats.totalRevenue}</p>
            </Card>

            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <p className="text-gray-600">Growth</p>
              </div>
              <p className="text-3xl text-green-600">+{stats.weeklyGrowth}%</p>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="employers" className="space-y-6">
            <TabsList className="bg-white border-2 border-gray-200">
              <TabsTrigger value="employers">Employers</TabsTrigger>
              <TabsTrigger value="vas">Virtual Assistants</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="employers" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl text-black tracking-tight">Employers</h2>
                <Button className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                  Add Employer
                </Button>
              </div>
              <div className="grid gap-4">
                {recentEmployers.map((employer) => (
                  <Card key={employer.id} className="p-6 border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl text-black mb-1">{employer.name}</h3>
                        <p className="text-gray-600">{employer.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Joined</p>
                          <p className="text-black">{employer.joinedDate}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                          {employer.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="vas" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl text-black tracking-tight">Virtual Assistants</h2>
                <Button className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                  Add VA
                </Button>
              </div>
              <div className="grid gap-4">
                {recentVAs.map((va) => (
                  <Card key={va.id} className="p-6 border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl text-black mb-1">{va.name}</h3>
                        <p className="text-gray-600">{va.email}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Rate</p>
                          <p className="text-xl text-black">${va.rate}/hr</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Rating</p>
                          <p className="text-xl text-black">⭐ {va.rating}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                          {va.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="matches" className="space-y-4">
              <h2 className="text-2xl text-black tracking-tight">Recent Matches</h2>
              <div className="grid gap-4">
                {recentMatches.map((match) => (
                  <Card key={match.id} className="p-6 border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Zap className="w-10 h-10 text-[#FFD600]" fill="#FFD600" />
                        <div>
                          <p className="text-lg text-black">
                            {match.employer} ↔ {match.va}
                          </p>
                          <p className="text-gray-600">{match.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-600">{match.date}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <h2 className="text-2xl text-black tracking-tight">Payments Overview</h2>
              <Card className="p-8 border-2 border-gray-200 text-center">
                <p className="text-gray-600 text-lg">Payment management coming soon</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
