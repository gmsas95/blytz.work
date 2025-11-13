import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Zap, Calendar, Clock, DollarSign, CheckCircle, ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function Contract() {
  const { id } = useParams();

  // Mock contract data - replace with Firebase
  const contract = {
    id: id,
    employer: "TechStart Inc.",
    va: "Maria Santos",
    role: "E-commerce Specialist",
    rate: 12,
    weekStart: new Date("2024-01-08"),
    weekEnd: new Date("2024-01-14"),
    hoursWorked: 32,
    status: "active" as const,
    tasks: [
      { id: "1", title: "Product listing updates", completed: true, hours: 8 },
      { id: "2", title: "Inventory management", completed: true, hours: 6 },
      { id: "3", title: "Customer service emails", completed: true, hours: 10 },
      { id: "4", title: "Analytics reporting", completed: false, hours: 8 },
    ],
  };

  const totalAmount = contract.hoursWorked * contract.rate;
  const completedHours = contract.tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.hours, 0);

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
            <Button variant="outline" size="sm" className="border-black text-black" asChild>
              <Link to="/employer/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 max-w-5xl py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl text-black tracking-tight mb-2">Contract Details</h1>
              <p className="text-gray-600 text-lg">
                {contract.employer} ↔ {contract.va}
              </p>
            </div>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-4 py-2 text-sm border-0">
              {contract.status === "active" ? "Active" : "Completed"}
            </Badge>
          </div>

          {/* Overview Card */}
          <Card className="p-8 border-2 border-gray-200">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Week Period</span>
                </div>
                <p className="text-xl text-black">
                  {contract.weekStart.toLocaleDateString()} - {contract.weekEnd.toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>Hours Worked</span>
                </div>
                <p className="text-3xl text-black">{completedHours}h</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-5 h-5" />
                  <span>Hourly Rate</span>
                </div>
                <p className="text-3xl text-black">${contract.rate}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="w-5 h-5" />
                  <span>Total Amount</span>
                </div>
                <p className="text-3xl text-[#FFD600]">${totalAmount}</p>
              </div>
            </div>
          </Card>

          {/* Role Details */}
          <Card className="p-8 border-2 border-gray-200">
            <h2 className="text-2xl text-black tracking-tight mb-4">Role: {contract.role}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg text-gray-600 mb-2">Employer</h3>
                <p className="text-xl text-black">{contract.employer}</p>
              </div>
              <div>
                <h3 className="text-lg text-gray-600 mb-2">Virtual Assistant</h3>
                <p className="text-xl text-black">{contract.va}</p>
              </div>
            </div>
          </Card>

          {/* Tasks */}
          <div className="space-y-4">
            <h2 className="text-2xl text-black tracking-tight">Weekly Tasks</h2>
            <div className="grid gap-4">
              {contract.tasks.map((task) => (
                <Card
                  key={task.id}
                  className={`p-6 border-2 transition-all ${
                    task.completed
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          task.completed ? "bg-green-500" : "bg-gray-200"
                        }`}
                      >
                        {task.completed && <CheckCircle className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-lg text-black mb-1">{task.title}</h3>
                        <p className="text-gray-600">{task.hours} hours</p>
                      </div>
                    </div>
                    <Badge
                      className={`${
                        task.completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      } hover:bg-current px-4 py-2 border-0`}
                    >
                      {task.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <Card className="p-8 border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl text-black tracking-tight mb-2">Contract Actions</h3>
                <p className="text-gray-600">Manage this weekly contract</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="border-2 border-black text-black">
                  Extend Week
                </Button>
                <Button className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black shadow-lg">
                  Mark Complete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
