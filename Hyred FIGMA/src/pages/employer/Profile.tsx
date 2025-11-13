import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function EmployerProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    budget: "",
    timezone: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Firebase
    console.log("Profile data:", formData);
    navigate("/employer/dashboard");
  };

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 max-w-3xl py-12">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl text-black tracking-tight">Set up your profile</h1>
            <p className="text-gray-600 text-lg">
              Tell us about your hiring needs so we can find the perfect matches
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Your startup or company name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="border-gray-300 focus:border-black focus:ring-[#FFD600]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">What role are you hiring for?</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="border-gray-300 focus:border-black focus:ring-[#FFD600]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ecommerce">E-commerce Specialist</SelectItem>
                    <SelectItem value="marketing">Marketing VA</SelectItem>
                    <SelectItem value="admin">Admin Assistant</SelectItem>
                    <SelectItem value="customer-service">Customer Service</SelectItem>
                    <SelectItem value="data-entry">Data Entry</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget per hour</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => setFormData({ ...formData, budget: value })}
                >
                  <SelectTrigger className="border-gray-300 focus:border-black focus:ring-[#FFD600]">
                    <SelectValue placeholder="Select your budget" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8-12">$8-12/hr</SelectItem>
                    <SelectItem value="12-15">$12-15/hr</SelectItem>
                    <SelectItem value="15-20">$15-20/hr</SelectItem>
                    <SelectItem value="20+">$20+/hr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Preferred Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                >
                  <SelectTrigger className="border-gray-300 focus:border-black focus:ring-[#FFD600]">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmt+8">GMT+8 (Philippines, Singapore)</SelectItem>
                    <SelectItem value="gmt+7">GMT+7 (Vietnam, Thailand)</SelectItem>
                    <SelectItem value="gmt+5.5">GMT+5.5 (India)</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description of tasks</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you need help with..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-gray-300 focus:border-black focus:ring-[#FFD600] min-h-32"
                  required
                />
                <p className="text-sm text-gray-500">
                  Be specific about daily tasks, tools you use, and what success looks like
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-2 border-gray-300"
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#FFD600] hover:bg-[#FFD600]/90 text-black shadow-lg"
                >
                  Continue to Dashboard
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
