"use client";

import { Button } from "@/components/ui/button";
import { getNavigationForRole } from "@/config/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavProps {
  userRole?: string;
}

export function SidebarNav({ userRole = "Administrator" }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = getNavigationForRole(userRole).map(item => ({
    ...item,
    active: pathname === item.href || pathname.startsWith(item.href + "/")
  }));

  return (
    <nav className="p-4">
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link href={item.href} key={item.href} className="block">
              <Button 
                variant="ghost" 
                className={`w-full justify-start hover:bg-slate-100 hover:text-slate-700 transition-colors ${
                  item.active 
                    ? "bg-slate-100 text-slate-700 font-medium" 
                    : "text-slate-600"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </div>
      
      {/* User Role Badge */}
      <div className="mt-8 pt-4 border-t border-border">
        <div className="text-xs text-slate-500 mb-2">Current Role</div>
        <div className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-2 rounded-md">
          {userRole}
        </div>
      </div>
    </nav>
  );
}
