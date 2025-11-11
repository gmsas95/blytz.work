'use client';

import { AlertContainer } from "@/components/ui/Alert";

export default function SimplePage() {
  return (
    <>
      <AlertContainer />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page Coming Soon</h1>
          <p>This page is being updated...</p>
        </div>
      </div>
    </>
  );
}
