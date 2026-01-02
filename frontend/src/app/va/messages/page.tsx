"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardNav } from '@/components/DashboardNav';
import { MessageSquare } from 'lucide-react';

const VAMessages = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav userRole="va" />
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Communicate with employers and manage conversations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
            <CardDescription>View and manage your message threads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages yet</h3>
              <p className="text-slate-600">Messages from employers will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VAMessages;
