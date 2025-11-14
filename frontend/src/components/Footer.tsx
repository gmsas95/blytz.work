"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const links = [
    { label: "About", type: "link" as const, to: "/about" as const },
    { label: "Pricing", type: "scroll" as const, sectionId: "pricing" as const },
    { label: "FAQ", type: "link" as const, to: "/faq" as const },
    { label: "Terms", type: "link" as const, to: "/terms" as const },
    { label: "Privacy", type: "link" as const, to: "/privacy" as const },
  ];

  return (
    <footer className="py-16 bg-black text-gray-400 border-t border-gray-900">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#FFD600] flex items-center justify-center">
              <Zap className="w-7 h-7 text-black" fill="black" />
            </div>
            <span className="text-2xl text-white tracking-tight">Blytz Hire</span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-8">
            {links.map((link, index) => (
              link.type === "link" ? (
                <Link
                  key={index}
                  href={link.to}
                  className="hover:text-[#FFD600] transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={() => scrollToSection(link.sectionId!)}
                  className="hover:text-[#FFD600] transition-colors"
                >
                  {link.label}
                </button>
              )
            ))}
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-900 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Blytz Hire. All rights reserved. Powered by Blytz speed ⚡</p>
        </div>
      </div>
    </footer>
  );
}
