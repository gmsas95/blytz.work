import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Zap, Plus, MessageCircle, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmployerDashboard() {
  // Mock data - replace with real data from Firebase
  const activeVAs = [
    {
      id: "1",
      name: "Maria Santos",
      role: "E-commerce Specialist",
      rate: 12,
      hoursThisWeek: 28,
      avatar: "MS",
    },
    {
      id: "2",
      name: "John Reyes",
      role: "Marketing VA",
      rate: 15,
      hoursThisWeek: 35,
      avatar: "JR",
    },
  ];

  const totalSpendThisWeek = activeVAs.reduce((sum, va) => sum + va.rate * va.hoursThisWeek, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#FFD600]" fill="#FFD600" />
              </div>
              <span className="text-xl text-black tracking-tight">Blytz Hire</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/messages">
                <Button variant="outline" size="sm" className="border-black text-black">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>
              <Link to="/employer/profile">
                <div className="w-10 h-10 rounded-full bg-[#FFD600] flex items-center justify-center text-black">
                  JD
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 max-w-7xl py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl text-black tracking-tight mb-2">Dashboard</h1>
              <p className="text-gray-600 text-lg">Manage your virtual assistants</p>
            </div>
            <Link to="/employer/discover">
              <Button className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black shadow-lg" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Hire New VA
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#FFD600]" />
                </div>
                <div>
                  <p className="text-gray-600">Active VAs</p>
                  <p className="text-3xl text-black">{activeVAs.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#FFD600]" />
                </div>
                <div>
                  <p className="text-gray-600">Hours This Week</p>
                  <p className="text-3xl text-black">
                    {activeVAs.reduce((sum, va) => sum + va.hoursThisWeek, 0)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-[#FFD600]" />
                </div>
                <div>
                  <p className="text-gray-600">Week Spend</p>
                  <p className="text-3xl text-black">${totalSpendThisWeek}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Active VAs */}
          <div className="space-y-4">
            <h2 className="text-2xl text-black tracking-tight">Active Virtual Assistants</h2>
            <div className="grid gap-4">
              {activeVAs.map((va) => (
                <Card key={va.id} className="p-6 border-2 border-gray-200 hover:border-black transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD600] to-[#FFB800] flex items-center justify-center text-black text-xl">
                        {va.avatar}
                      </div>
                      <div>
                        <h3 className="text-xl text-black mb-1">{va.name}</h3>
                        <p className="text-gray-600">{va.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-gray-600 text-sm">This Week</p>
                        <p className="text-2xl text-black">{va.hoursThisWeek}h</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 text-sm">Rate</p>
                        <p className="text-2xl text-black">${va.rate}/hr</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/chat/${va.id}`}>
                          <Button variant="outline" size="sm" className="border-black text-black">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/contracts/${va.id}`}>
                          <Button className="bg-black text-[#FFD600]" size="sm">
                            View Contract
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {activeVAs.length === 0 && (
                <Card className="p-12 border-2 border-dashed border-gray-300 text-center">
                  <p className="text-gray-600 text-lg mb-4">No active VAs yet</p>
                  <Link to="/employer/discover">
                    <Button className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                      Start Hiring
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>
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
