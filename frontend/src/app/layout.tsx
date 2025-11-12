import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthProvider';
import { AlertContainer } from '@/components/ui/Alert';

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
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>
            <AlertContainer>
              <div className="min-h-screen bg-white">
                <Navbar />
                <main>{children}</main>
              </div>
            </AlertContainer>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}