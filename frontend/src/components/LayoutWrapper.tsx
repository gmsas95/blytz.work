'use client';

import { useImprovedAlert } from '@/contexts/ImprovedAlertContext';
import { ImprovedAlertContainer } from '@/components/ui/ImprovedAlert';
import { Navbar } from '@/components/Navbar';
import { EnvironmentStatus } from '@/components/EnvironmentStatus';
import { usePathname } from 'next/navigation';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { alerts, removeAlert } = useImprovedAlert();
  const pathname = usePathname();
  
  // Don't show navbar and environment status on landing page
  const isLandingPage = pathname === '/';
  
  return (
    <div className="min-h-screen bg-white">
      {!isLandingPage && <Navbar />}
      <main>{children}</main>
      {!isLandingPage && <EnvironmentStatus />}
      <ImprovedAlertContainer alerts={alerts} onClose={removeAlert} />
    </div>
  );
}