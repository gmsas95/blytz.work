"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardNav } from '@/components/DashboardNav';
import { Star } from 'lucide-react';

const Reviews = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userRole="employer" />
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reviews</h1>
          <p className="text-slate-600">Manage reviews for VAs you've worked with</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Pending Reviews
            </CardTitle>
            <CardDescription>Leave reviews for completed contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No pending reviews</h3>
              <p className="text-slate-600">Leave a review for VAs after completing work together</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reviews;
