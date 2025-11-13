import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthProvider';
import { ImprovedAlertContainer, useImprovedAlert } from '@/contexts/ImprovedAlertContext';
import { EnvironmentStatus } from '@/components/EnvironmentStatus';

export const metadata: Metadata = {
  title: 'BlytzHire - Professional VA Marketplace',
  description: 'Connect with world-class Virtual Assistants. Scale your business with pre-vetted talent.',
  keywords: ['virtual assistant', 'remote work', 'freelance', 'marketplace'],
  authors: [{ name: 'BlytzHire' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const { alerts } = useImprovedAlert();
    
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>{children}</main>
        <EnvironmentStatus />
        <ImprovedAlertContainer alerts={alerts} onClose={(id) => {}} />
      </div>
    );
  }

  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}