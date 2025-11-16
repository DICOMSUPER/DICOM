"use client";

// WorkspaceLayout and SidebarNav moved to layout.tsx
import { 
  AdminStats, 
  AdminQuickActions, 
  AdminSystemStatus, 
  AdminRecentActivity 
} from "@/components/admin";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  const handleQuickAction = (action: string) => {
    console.log(`Quick action clicked: ${action}`);
    // Add navigation logic here
    switch (action) {
      case 'users':
        router.push('/admin/users');
        break;
      case 'schedule':
        router.push('/admin/schedule');
        break;
      case 'settings':
        router.push('/admin/settings');
        break;
      case 'configurations':
        router.push('/admin/configurations');
        break;
      case 'analytics':
        router.push('/admin/reports');
        break;
      case 'security':
        router.push('/admin/security');
        break;
      case 'database':
        router.push('/admin/database');
        break;
      case 'docs':
        router.push('/admin/docs');
        break;
      case 'monitoring':
        router.push('/admin/monitoring');
        break;
      case 'rooms':
        router.push('/admin/rooms');
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  return (
    <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-foreground">
            System administration and management overview
          </p>
        </div>

        {/* Stats Overview */}
        <AdminStats
          totalUsers={1234}
          activeSessions={89}
          systemHealth={99.9}
          storageUsed="2.4 TB"
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <AdminQuickActions onActionClick={handleQuickAction} />
          </div>

          {/* System Status */}
          <AdminSystemStatus />
        </div>

        {/* Recent Activity */}
        <AdminRecentActivity />
    </div>
  );
}