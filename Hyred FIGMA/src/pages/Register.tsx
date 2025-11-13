import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Firebase auth
    console.log("Register:", formData);
    // After registration, redirect to role selection
    navigate("/select-role");
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center">
                <Zap className="w-7 h-7 text-[#FFD600]" fill="#FFD600" />
              </div>
              <span className="text-2xl text-black tracking-tight">Blytz Hire</span>
            </Link>
            <h1 className="text-4xl text-black tracking-tight mb-2">Get started</h1>
            <p className="text-gray-600">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-gray-300 focus:border-black focus:ring-[#FFD600]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-gray-300 focus:border-black focus:ring-[#FFD600]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border-gray-300 focus:border-black focus:ring-[#FFD600]"
                required
              />
              <p className="text-sm text-gray-500">At least 8 characters</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black shadow-lg"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <div className="text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-black hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-black items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#FFD60008_1px,transparent_1px),linear-gradient(to_bottom,#FFD60008_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#FFD600] rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#FFD600] rounded-full blur-[120px] opacity-20" />
        
        <div className="relative text-center space-y-6 max-w-lg">
          <h2 className="text-5xl text-white tracking-tight leading-tight">
            Join the future of{" "}
            <span className="relative inline-block">
              <span className="relative z-10">remote hiring</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-[#FFD600] -z-0" />
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Whether you're hiring or looking for work, Blytz makes it fast and fun.
          </p>
        </div>
      </div>
    </div>
  );
}
