import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthProvider';
import { AlertContainer } from '@/components/ui/Alert';

// Modern font stack
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

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
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-white text-gray-900`}>
        <Providers>
          <AuthProvider>
            <AlertContainer>
              <div className="relative min-h-screen">
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
              </div>
            </AlertContainer>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}