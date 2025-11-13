import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { AuthProvider } from '@/components/AuthProvider';
import { LayoutWrapper } from '@/components/LayoutWrapper';

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
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}