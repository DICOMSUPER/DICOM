"use client";

import { useMemo, useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole = useMemo(() => {
    if (!user?.role) return undefined;
    return getNavigationRoleFromUserRole(user.role);
  }, [user?.role]);

  const allNavItems = useMemo(() => {
    return getNavigationForRole(userRole);
  }, [userRole]);

  const navItemsToUse = allNavItems;

  const sortedNavItems = useMemo(
    () => [...navItemsToUse].sort((a, b) => b.href.length - a.href.length),
    [navItemsToUse]
  );

  const navItems = useMemo(() => {
    if (!navItemsToUse || navItemsToUse.length === 0) {
      return [];
    }
    return navItemsToUse.map((item) => {
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
  }, [navItemsToUse, sortedNavItems, pathname]);

  if (!mounted || !user) {
    return (
      <nav className="p-4">
        <div className="space-y-2">
          <div className="h-10 w-full bg-slate-200 animate-pulse rounded" />
          <div className="h-10 w-full bg-slate-200 animate-pulse rounded" />
          <div className="h-10 w-full bg-slate-200 animate-pulse rounded" />
        </div>
      </nav>
    );
  }

  if (navItems.length === 0) {
    return (
      <nav className="p-4">
        <div className="space-y-2">
          <div className="h-10 w-full bg-slate-200 animate-pulse rounded" />
          <div className="h-10 w-full bg-slate-200 animate-pulse rounded" />
          <div className="h-10 w-full bg-slate-200 animate-pulse rounded" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="p-4" key={`nav-${userRole || 'none'}-${user?.id || 'no-user'}`}>
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block w-full`}
            >
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
