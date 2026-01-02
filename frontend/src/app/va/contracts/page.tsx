"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardNav } from '@/components/DashboardNav';
import { FileText } from 'lucide-react';

const VAContracts = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userRole="va" />
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Contracts</h1>
          <p className="text-slate-600">View and manage your active and past contracts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Management
            </CardTitle>
            <CardDescription>Track deliverables and payments for your contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No contracts yet</h3>
              <p className="text-slate-600">Contracts will appear here when you're hired</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VAContracts;
