"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardNav } from '@/components/DashboardNav';
import { Briefcase } from 'lucide-react';

const VAApplications = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userRole="va" />
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Job Applications</h1>
          <p className="text-slate-600">Track your job applications and their status</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              My Applications
            </CardTitle>
            <CardDescription>View all jobs you've applied to</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications yet</h3>
              <p className="text-slate-600">Browse jobs and start applying to opportunities</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VAApplications;
