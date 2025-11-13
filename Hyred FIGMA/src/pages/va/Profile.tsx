import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Zap, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function VAProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    hourlyRate: "",
    experience: "",
    timezone: "",
    availability: "",
    bio: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Firebase
    console.log("Profile data:", { ...formData, skills });
    navigate("/va/dashboard");
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
            <h1 className="text-4xl text-black tracking-tight">Set up your VA profile</h1>
            <p className="text-gray-600 text-lg">
              Create your profile to get matched with top employers
            </p>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="border-gray-300 focus:border-black focus:ring-[#FFD600]"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="12"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="border-gray-300 focus:border-black focus:ring-[#FFD600]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Select
                    value={formData.experience}
                    onValueChange={(value) => setFormData({ ...formData, experience: value })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-black focus:ring-[#FFD600]">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2">1-2 years</SelectItem>
                      <SelectItem value="3-4">3-4 years</SelectItem>
                      <SelectItem value="5+">5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={formData.availability}
                    onValueChange={(value) => setFormData({ ...formData, availability: value })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-black focus:ring-[#FFD600]">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time (40+ hrs/week)</SelectItem>
                      <SelectItem value="part-time">Part-time (20-40 hrs/week)</SelectItem>
                      <SelectItem value="hourly">Hourly (Flexible)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    placeholder="Add a skill (e.g., Shopify, Facebook Ads)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    className="border-gray-300 focus:border-black focus:ring-[#FFD600]"
                  />
                  <Button type="button" onClick={addSkill} variant="outline" className="border-black">
                    Add
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill, i) => (
                      <Badge
                        key={i}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2 border-0 flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Introduction</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell employers about yourself, your experience, and what you're great at..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="border-gray-300 focus:border-black focus:ring-[#FFD600] min-h-32"
                  required
                />
                <p className="text-sm text-gray-500">
                  This will be shown to employers when they browse your profile
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
                  Save & Continue
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
