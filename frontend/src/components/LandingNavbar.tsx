'use client';

import Link from 'next/link';
import { Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui-shadcn/button';

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "How It Works", id: "how" },
    { label: "Pricing", id: "pricing" },
    { label: "For VAs", id: "vas" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
              <Zap
                className="w-6 h-6 text-[#FFD600]"
                fill="#FFD600"
              />
            </div>
            <span className="text-xl text-black tracking-tight">
              Blytz Hire
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(link.id)}
                className="text-gray-600 hover:text-black transition-colors"
              >
                {link.label}
              </button>
            ))}
            <Link href="/auth">
              <Button
                variant="outline"
                size="sm"
                className="border-black text-black hover:bg-gray-50"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button
                size="sm"
                className="bg-[#FFD600] text-black hover:bg-[#FFD600]/90 shadow-md"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-black" />
            ) : (
              <Menu className="w-6 h-6 text-black" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(link.id)}
                  className="text-gray-600 hover:text-black transition-colors px-2 text-left"
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-black text-black hover:bg-gray-50 w-full"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    size="sm"
                    className="bg-[#FFD600] text-black hover:bg-[#FFD600]/90 w-full"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}