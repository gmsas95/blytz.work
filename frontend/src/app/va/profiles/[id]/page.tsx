"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  DollarSign, 
  Star, 
  Calendar, 
  Award,
  Briefcase,
  Eye,
  MessageSquare,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Heart,
  Share2,
  FileText,
  Video,
  Linkedin,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';

// Type definitions for VA profile
interface VAProfile {
  id: string;
  name: string;
  bio: string;
  country: string;
  timezone: string;
  hourlyRate: number;
  skills: string[];
  availability: boolean;
  email?: string;
  phone?: string;
  languages?: Array<{ language: string; proficiency: string }>;
  workExperience?: Array<{ company: string; position: string; startDate: string; endDate?: string; current: boolean; description: string }>;
  education?: Array<{ institution: string; degree: string; field: string; startDate: string; endDate?: string; current: boolean }>;
  avatarUrl?: string;
  resumeUrl?: string;
  videoIntroUrl?: string;
  verificationLevel: 'basic' | 'professional' | 'premium';
  backgroundCheckPassed: boolean;
  featuredProfile: boolean;
  responseRate?: number;
  averageRating?: number;
  totalReviews?: number;
  completedJobs?: number;
  earnedAmount?: number;
  profileViews?: number;
  profileCompleted?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const VAProfileView = () => {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<VAProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [params.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/va/profiles/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Profile not found');
      }
      
      const data = await response.json();
      setProfile(data.data);
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load profile');
      router.push('/employer/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/va/profiles/${params.id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Profile removed from saved' : 'Profile saved');
      }
    } catch (error) {
      toast.error('Failed to save profile');
    }
  };

  const handleContactVA = async () => {
    if (!contactMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: profile.userId,
          message: contactMessage
        })
      });

      if (response.ok) {
        toast.success('Message sent successfully!');
        setShowContactForm(false);
        setContactMessage('');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const getVerificationBadge = (level: 'basic' | 'professional' | 'premium') => {
    switch (level) {
      case 'premium':
        return <Badge className="bg-yellow-500 text-white">Premium</Badge>;
      case 'professional':
        return <Badge className="bg-blue-500 text-white">Professional</Badge>;
      default:
        return <Badge variant="secondary">Basic</Badge>;
    }
  };

  const getAvailabilityStatus = (available: boolean) => {
    return available ? (
      <Badge className="bg-green-500 text-white flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Available Now
      </Badge>
    ) : (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Currently Unavailable
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
          <p className="text-slate-600 mb-4">This VA profile doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/employer/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {/* Profile Image */}
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {profile.name.charAt(0)}
                  </div>
                )}
                
                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
                    {getVerificationBadge(profile.verificationLevel)}
                    {getAvailabilityStatus(profile.availability)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ${profile.hourlyRate}/hr
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {profile.timezone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="text-lg font-semibold">
                        {profile.averageRating?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="text-slate-600">
                        ({profile.totalReviews || 0} reviews)
                      </span>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <span className="flex items-center gap-1 text-slate-600">
                      <Briefcase className="h-4 w-4" />
                      {profile.completedJobs || 0} jobs completed
                    </span>
                    <Separator orientation="vertical" className="h-6" />
                    <span className="flex items-center gap-1 text-slate-600">
                      <Eye className="h-4 w-4" />
                      {profile.profileViews?.toLocaleString() || 0} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveProfile}>
                  <Heart className={`h-4 w-4 mr-1 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => navigator.share && navigator.share({ url: window.location.href, title: `${profile.name} - VA Profile` })}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button onClick={() => setShowContactForm(true)}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Contact
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Work Experience */}
            {profile.workExperience && profile.workExperience.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.workExperience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold">{exp.position}</h4>
                          <p className="text-slate-600">{exp.company}</p>
                        </div>
                        {exp.current ? (
                          <Badge className="bg-green-500 text-white">Current</Badge>
                        ) : (
                          <span className="text-sm text-slate-600">
                            {new Date(exp.endDate).getFullYear()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-1">
                        {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-slate-700">{exp.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{edu.degree}</h4>
                        <p className="text-slate-600">{edu.institution}</p>
                        <p className="text-sm text-slate-600">{edu.field}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(edu.startDate).toLocaleDateString()} - {edu.current ? 'Present' : new Date(edu.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      {edu.current && (
                        <Badge className="bg-green-500 text-white">Current</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.languages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{lang.language}</span>
                        <Badge variant={lang.proficiency === 'native' ? 'default' : 'secondary'}>
                          {lang.proficiency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Response Rate</span>
                  <div className="flex items-center gap-2">
                    <Progress value={profile.responseRate || 0} className="w-16 h-2" />
                    <span className="font-medium">{profile.responseRate || 0}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Profile Views</span>
                  <span className="font-medium">{profile.profileViews?.toLocaleString() || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Earned</span>
                  <span className="font-medium text-green-600">
                    ${profile.earnedAmount?.toLocaleString() || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Member Since</span>
                  <span className="font-medium">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">ID Verification</span>
                  <Badge className={profile.verificationLevel !== 'basic' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
                    {profile.verificationLevel !== 'basic' ? 'Verified' : 'Not Verified'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Background Check</span>
                  <Badge className={profile.backgroundCheckPassed ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
                    {profile.backgroundCheckPassed ? 'Passed' : 'Not Checked'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Skills Assessment</span>
                  <Badge className={profile.verificationLevel === 'premium' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
                    {profile.verificationLevel === 'premium' ? 'Completed' : 'Not Assessed'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                )}
                
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                
                {profile.resumeUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      Download Resume
                    </a>
                  </Button>
                )}
                
                {profile.videoIntroUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={profile.videoIntroUrl} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-2" />
                      Watch Video Intro
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Contact {profile.name}</CardTitle>
                <CardDescription>
                  Send a message to discuss your project requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Hi {profile.name}, I'm interested in discussing..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setShowContactForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleContactVA}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VAProfileView;