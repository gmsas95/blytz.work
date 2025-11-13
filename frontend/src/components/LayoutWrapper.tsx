'use client';

import { useImprovedAlert } from '@/contexts/ImprovedAlertContext';
import { ImprovedAlertContainer } from '@/components/ui/ImprovedAlert';
import { Navbar } from '@/components/Navbar';
import { EnvironmentStatus } from '@/components/EnvironmentStatus';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { alerts, removeAlert } = useImprovedAlert();
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>{children}</main>
      <EnvironmentStatus />
      <ImprovedAlertContainer alerts={alerts} onClose={removeAlert} />
    </div>
  );
}