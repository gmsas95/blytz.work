"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardNav } from '@/components/DashboardNav';
import { Briefcase, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EmployerJobs = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userRole="employer" />
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Jobs</h1>
            <p className="text-slate-600">Manage your job postings and applications</p>
          </div>
          <Button onClick={() => router.push('/employer/jobs/post')}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Postings
            </CardTitle>
            <CardDescription>View and manage all your job postings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs posted yet</h3>
              <p className="text-slate-600 mb-6">Start hiring by posting your first job</p>
              <Button onClick={() => router.push('/employer/jobs/post')}>
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Job
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployerJobs;
