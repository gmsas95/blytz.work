import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { getAuth } from '@/lib/firebase';

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
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}