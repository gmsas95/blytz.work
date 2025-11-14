import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Calendar, Clock, DollarSign, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ContractPage({ params }: { params: { id: string } }) {
  // Mock contract data - replace with Firebase
  const contract = {
    id: params.id,
    employer: "TechStart Inc.",
    va: "Maria Santos",
    role: "E-commerce Specialist",
    startDate: "2024-01-15",
    endDate: "2024-01-22",
    rate: 15,
    totalHours: 40,
    status: "active",
    milestones: [
      {
        id: 1,
        title: "Store Setup",
        description: "Set up Shopify store with products",
        dueDate: "2024-01-17",
        status: "completed",
        hours: 12,
      },
      {
        id: 2,
        title: "Product Descriptions",
        description: "Write SEO-optimized product descriptions",
        dueDate: "2024-01-19",
        status: "completed",
        hours: 16,
      },
      {
        id: 3,
        title: "Email Campaign Setup",
        description: "Create welcome email sequence",
        dueDate: "2024-01-21",
        status: "in-progress",
        hours: 12,
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Review product catalog",
        completed: true,
      },
      {
        id: 2,
        title: "Install tracking pixels",
        completed: true,
      },
      {
        id: 3,
        title: "Test checkout process",
        completed: false,
      },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const completedMilestones = contract.milestones.filter(m => m.status === "completed");
  const totalCompletedHours = completedMilestones.reduce((sum, m) => sum + m.hours, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/employer/dashboard" className="inline-flex items-center text-gray-600 hover:text-black mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-black mb-2">Contract #{contract.id}</h1>
                <p className="text-gray-600">
                  {contract.employer} × {contract.va}
                </p>
              </div>
              <Badge 
                className={getStatusColor(contract.status)}
                variant="secondary"
              >
                {contract.status}
              </Badge>
            </div>
          </div>

          {/* Contract Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-black">
                      {contract.startDate} - {contract.endDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hourly Rate</p>
                    <p className="font-semibold text-black">${contract.rate}/hr</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="font-semibold text-black">
                      {totalCompletedHours}/{contract.totalHours}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Milestones</p>
                    <p className="font-semibold text-black">
                      {completedMilestones.length}/{contract.milestones.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Milestones & Tasks */}
            <div className="lg:col-span-2 space-y-8">
              {/* Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Milestones
                  </CardTitle>
                  <CardDescription>
                    Key deliverables for this contract
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contract.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className={`p-4 rounded-lg border-2 ${
                        milestone.status === "completed"
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-black mb-1">
                            {milestone.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-2">
                            {milestone.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-500">
                              Due: {milestone.dueDate}
                            </span>
                            <span className="text-gray-500">
                              {milestone.hours} hours
                            </span>
                          </div>
                        </div>
                        <Badge 
                          className={getStatusColor(milestone.status)}
                          variant="secondary"
                        >
                          {milestone.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Tasks</CardTitle>
                  <CardDescription>
                    Immediate action items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contract.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          readOnly
                          className="w-5 h-5 rounded border-gray-300"
                        />
                        <span
                          className={`flex-1 ${
                            task.completed
                              ? "text-gray-400 line-through"
                              : "text-black"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contract Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Contract Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium text-black">{contract.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Employer</p>
                    <p className="font-medium text-black">{contract.employer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Virtual Assistant</p>
                    <p className="font-medium text-black">{contract.va}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">
                    Log Hours
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Timesheet
                  </Button>
                  <Button variant="outline" className="w-full">
                    Message VA
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}