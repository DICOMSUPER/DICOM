"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { PatientSearch } from "@/components/reception/patient-search";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search } from "lucide-react";

export default function PatientSearchPage() {
  const router = useRouter();
  const [notificationCount] = useState(3);
  const [isLoading] = useState(true);

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handlePatientSelect = (patient: any) => {
    console.log("Selected patient:", patient);
    router.push(`/reception/patients/${patient.id}`);
  };

  const handleBackToPatients = () => {
    router.push('/reception/patients');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />
      <WorkspaceLayout sidebar={<SidebarNav />}>
        <div className="space-y-6">
          {/* Header */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBackToPatients}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Patients
                  </Button>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-6 h-6" />
                      Enhanced Patient Search
                    </CardTitle>
                    <CardDescription>
                      Advanced search functionality with filters, pagination, and real-time results
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Patient Search Component */}
          {isLoading ? (
            <div className="space-y-4">
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-32" />
                      <Skeleton className="h-10 w-32" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <PatientSearch 
              onPatientSelect={handlePatientSelect}
              showStats={true}
            />
          )}

          {/* Information Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Patient Search Features</CardTitle>
              <CardDescription>All search capabilities in one clean interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-primary mb-2">Quick Search</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Instant name search</li>
                    <li>• Real-time results</li>
                    <li>• Collapsible advanced filters</li>
                    <li>• One-click clear</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-primary mb-2">Advanced Search</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Multiple filter criteria</li>
                    <li>• Gender and blood type</li>
                    <li>• Patient code & phone</li>
                    <li>• Active status filtering</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-primary mb-2">Paginated Search</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Large dataset support</li>
                    <li>• Configurable page sizes</li>
                    <li>• Smart pagination</li>
                    <li>• Result count display</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </WorkspaceLayout>
    </div>
  );
}
