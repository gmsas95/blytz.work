"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardNav } from '@/components/DashboardNav';
import { BarChart3 } from 'lucide-react';

const VAAnalytics = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userRole="va" />
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics</h1>
          <p className="text-slate-600">Track your performance and earnings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Overview
            </CardTitle>
            <CardDescription>View detailed analytics about your profile and jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-slate-600">Track metrics about your profile views, applications, and earnings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VAAnalytics;
