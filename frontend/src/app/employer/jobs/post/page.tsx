"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardNav } from '@/components/DashboardNav';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PostJob = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userRole="employer" />
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Post New Job</h1>
          <p className="text-slate-600">Fill in the details to post a new job opportunity</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Provide information about the job you're posting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-slate-600 mb-6">Job posting form coming soon</p>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostJob;
