"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardNav } from '@/components/DashboardNav';
import { Bookmark } from 'lucide-react';

const SavedVAs = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userRole="employer" />
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Saved VAs</h1>
          <p className="text-slate-600">View and manage your saved virtual assistants</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Saved Profiles
            </CardTitle>
            <CardDescription>Access VAs you've saved for later</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Bookmark className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No saved VAs yet</h3>
              <p className="text-slate-600">Save profiles from the marketplace to review later</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SavedVAs;
