"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  LogOut, 
  Home, 
  Users, 
  FileText, 
  Settings,
  Bell,
  Search
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  userRole: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
  headerActions?: React.ReactNode;
}

export function DashboardLayout({
  title,
  subtitle,
  userRole,
  children,
  showBackButton = false,
  onBackClick,
  headerActions
}: DashboardLayoutProps) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-border"
                  onClick={onBackClick}
                >
                  ← Back
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
                <p className="text-slate-500">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                {userRole}
              </Badge>
              <Button variant="outline" size="sm" className="border-border">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <div className="flex">
        <aside className="w-64 border-r border-border bg-card min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <Link href="/reception" className="block">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start hover:bg-slate-100 hover:text-slate-700 transition-colors ${
                    pathname === "/reception" 
                      ? "bg-slate-100 text-slate-700 font-medium" 
                      : "text-slate-600"
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Reception
                </Button>
              </Link>
              <Link href="/reception/patients" className="block">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start hover:bg-slate-100 hover:text-slate-700 transition-colors ${
                    pathname === "/reception/patients" 
                      ? "bg-slate-100 text-slate-700 font-medium" 
                      : "text-slate-600"
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Patients
                </Button>
              </Link>
              <Link href="/reports" className="block">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start hover:bg-slate-100 hover:text-slate-700 transition-colors ${
                    pathname === "/reports" 
                      ? "bg-slate-100 text-slate-700 font-medium" 
                      : "text-slate-600"
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Reports
                </Button>
              </Link>
              <Link href="/search" className="block">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start hover:bg-slate-100 hover:text-slate-700 transition-colors ${
                    pathname === "/search" 
                      ? "bg-slate-100 text-slate-700 font-medium" 
                      : "text-slate-600"
                  }`}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </Link>
              <Link href="/notifications" className="block">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start hover:bg-slate-100 hover:text-slate-700 transition-colors ${
                    pathname === "/notifications" 
                      ? "bg-slate-100 text-slate-700 font-medium" 
                      : "text-slate-600"
                  }`}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
              </Link>
              <Link href="/settings" className="block">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start hover:bg-slate-100 hover:text-slate-700 transition-colors ${
                    pathname === "/settings" 
                      ? "bg-slate-100 text-slate-700 font-medium" 
                      : "text-slate-600"
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {headerActions && (
            <div className="mb-6 flex justify-end">
              {headerActions}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
