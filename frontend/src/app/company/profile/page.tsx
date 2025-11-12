'use client';

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AlertContainer } from "@/components/ui/Alert";

export default function CompanyProfilePage() {
  return (
    <ProtectedRoute>
      <AlertContainer />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Company Profile</h1>
          <p>This page is being updated...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
