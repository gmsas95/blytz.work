import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/components/AuthProvider';
import { AlertContainer } from '@/components/ui/Alert';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VA Matching Platform',
  description: 'Connect with talented Virtual Assistants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <AlertContainer>
              <div className="min-h-screen bg-gray-50">
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