"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { getNavigationForRole } from "@/config/navigation";
import { getNavigationRoleFromUserRole } from "@/utils/role-formatter";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export function SidebarNav() {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = getNavigationRoleFromUserRole(user?.role);
  const allNavItems = getNavigationForRole(userRole);

  const sortedNavItems = useMemo(
    () => [...allNavItems].sort((a, b) => b.href.length - a.href.length),
    [allNavItems]
  );

  const navItems = useMemo(() => {
    return allNavItems.map((item) => {
      const isExactMatch = pathname === item.href;
      const isPrefixMatch = item.href !== "/" && pathname.startsWith(item.href + "/");

      let isActive = isExactMatch;
      if (isPrefixMatch) {
        const moreSpecificMatch = sortedNavItems.find(
          (otherItem) =>
            otherItem.href !== item.href &&
            otherItem.href.startsWith(item.href + "/") &&
            (pathname === otherItem.href || pathname.startsWith(otherItem.href + "/"))
        );
        isActive = !moreSpecificMatch;
      }

      return { ...item, active: isActive };
    });
  }, [allNavItems, sortedNavItems, pathname]);

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
                <Icon className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
