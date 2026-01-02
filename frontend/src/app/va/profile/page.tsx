"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardNav } from '@/components/DashboardNav';
import { User, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { apiCall } from '@/lib/api';

interface VAProfile {
  id: string;
  name: string;
  bio: string;
  country: string;
  hourlyRate: number;
  skills: string[];
  availability: boolean;
  avatarUrl?: string;
}

const VAProfilePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<VAProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiCall('/va/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <DashboardNav userRole="va" />
        <div className="container mx-auto px-4 max-w-7xl py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userRole="va" />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
            <p className="text-slate-600">View and manage your VA profile</p>
          </div>
          <Button onClick={() => router.push('/va/profile/create')}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your current profile details</CardDescription>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{profile.name}</h3>
                    <p className="text-slate-600 mt-1">{profile.country}</p>
                    <p className="text-lg font-bold text-blue-600 mt-2">${profile.hourlyRate}/hr</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-slate-600">{profile.bio}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Availability</h4>
                  <p className={profile.availability ? "text-green-600" : "text-red-600"}>
                    {profile.availability ? "Available for new work" : "Currently unavailable"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">No profile found</p>
                <Button onClick={() => router.push('/va/profile/create')}>
                  Create Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VAProfilePage;
