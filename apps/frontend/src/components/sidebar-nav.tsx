"use client";

import { Button } from "@/components/ui/button";
import { getNavigationForRole } from "@/config/navigation";
import { detectRoleFromPath } from "@/utils/role-detection";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNav() {
  const pathname = usePathname();
  const userRole = detectRoleFromPath(pathname);
  const allNavItems = getNavigationForRole(userRole);

  // Sort by href length (longer = more specific) to prioritize specific matches
  const sortedNavItems = [...allNavItems].sort(
    (a, b) => b.href.length - a.href.length
  );

  const navItems = allNavItems.map((item) => {
    // Check if this item should be active
    const isExactMatch = pathname === item.href;
    const isPrefixMatch =
      item.href !== "/" && pathname.startsWith(item.href + "/");

    // If it's a prefix match, check if there's a more specific nav item that also matches
    let isActive = isExactMatch;
    if (isPrefixMatch) {
      // Check if any more specific nav item also matches this pathname
      const moreSpecificMatch = sortedNavItems.find(
        (otherItem) =>
          otherItem.href !== item.href &&
          otherItem.href.startsWith(item.href + "/") &&
          (pathname === otherItem.href ||
            pathname.startsWith(otherItem.href + "/"))
      );
      // Only active if no more specific match exists
      isActive = !moreSpecificMatch;
    }

    return {
      ...item,
      active: isActive,
    };
  });

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
    </nav>
  );
}
