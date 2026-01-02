"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Briefcase,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  Home,
  Bookmark
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface DashboardNavProps {
  userRole: 'employer' | 'va';
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem("userRole");
    toast.success("Signed out successfully");
    setMobileMenuOpen(false);
  };

  const employerNavItems = [
    { label: "Dashboard", href: "/employer/dashboard", icon: Home },
    { label: "My Jobs", href: "/employer/jobs", icon: Briefcase },
    { label: "Saved VAs", href: "/employer/saved", icon: Bookmark },
    { label: "Messages", href: "/employer/messages", icon: MessageSquare },
    { label: "Contracts", href: "/employer/contracts", icon: FileText },
    { label: "Analytics", href: "/employer/analytics", icon: BarChart3 },
  ];

  const vaNavItems = [
    { label: "Dashboard", href: "/va/dashboard", icon: Home },
    { label: "My Profile", href: "/va/profile", icon: Users },
    { label: "Job Applications", href: "/va/applications", icon: Briefcase },
    { label: "Messages", href: "/va/messages", icon: MessageSquare },
    { label: "My Contracts", href: "/va/contracts", icon: FileText },
    { label: "Analytics", href: "/va/analytics", icon: BarChart3 },
  ];

  const navItems = userRole === 'employer' ? employerNavItems : vaNavItems;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#FFD600]" />
            </div>
            <span className="text-lg font-semibold text-black tracking-tight">
              BlytzWork
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {userRole === 'employer' ? 'Employer' : 'VA'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <div className="border-t border-gray-200 my-2"></div>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
