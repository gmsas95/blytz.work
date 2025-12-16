import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center space-y-8">
            {/* 404 Number */}
            <div className="relative inline-block">
              <div className="text-9xl lg:text-[12rem] font-black text-gray-200 tracking-wider font-bold">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl lg:text-8xl font-bold text-[#FFD600]">!</span>
              </div>
            </div>
            
            {/* Error Message */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-black tracking-tight mb-4">
                Page Not Found
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Oops! The page you're looking for seems to have vanished into the digital void.
              </p>
              <p className="text-lg text-gray-500">
                Don't worry though - our virtual assistants are excellent at finding things!
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Back to Homepage
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg">
                <Link href="#" className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search for VAs
                </Link>
              </Button>
            </div>
            
            {/* Help Text */}
            <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-black mb-2">
                Still can't find what you're looking for?
              </h3>
              <p className="text-gray-600 mb-4">
                Try checking our FAQ page or searching for virtual assistants with specific skills.
              </p>
              <div className="space-y-2">
                <Link href="/faq" className="text-[#FFD600] hover:text-[#FFD600]/80 font-medium transition-colors">
                  → Visit FAQ
                </Link>
                <br />
                <Link href="/" className="text-[#FFD600] hover:text-[#FFD600]/80 font-medium transition-colors">
                  → Browse Available VAs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}