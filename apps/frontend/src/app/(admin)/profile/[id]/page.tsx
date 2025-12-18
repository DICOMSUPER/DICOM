"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Building2,
  Shield,
  Calendar,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetUserByIdQuery } from "@/store/userApi";
import { formatRole } from "@/common/utils/role-formatter";
import { cn } from "@/common/lib/utils";
import { ErrorAlert } from "@/components/ui/error-alert";
import { format } from "date-fns";
import { NotificationProvider } from "@/common/contexts/NotificationContext";

const initials = (firstName?: string, lastName?: string) => {
  const firstInitial = firstName?.[0]?.toUpperCase() || "";
  const lastInitial = lastName?.[0]?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}` || "U";
};

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const {
    data: userResponse,
    isLoading,
    isError,
    error,
  } = useGetUserByIdQuery(userId, {
    skip: !userId,
  });

  const user = userResponse?.data;

  return (
    <NotificationProvider>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Header */}
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">User Profile</h1>
            <p className="text-sm text-foreground">
              View detailed information about the user
            </p>
          </div>
        </div>

        {isError && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ErrorAlert
              title="Failed to load profile"
              message={
                error ? "User not found or an error occurred" : "Unknown error"
              }
            />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : user ? (
          <>
            {/* Profile Header Card */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              <Card className="border-border overflow-hidden transition-all hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                  <div className="flex items-start gap-6">
                    <div className="transition-transform hover:scale-105 active:scale-95 duration-200 cursor-pointer">
                      <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                        <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                          {initials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                          {user.firstName} {user.lastName}
                          {user.isActive ? (
                            <Badge variant="default" className="ml-2">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="ml-2">
                              Inactive
                            </Badge>
                          )}
                        </h2>
                        {user.role && (
                          <Badge variant="outline" className="mt-2">
                            <Shield className="h-3 w-3 mr-1" />
                            {formatRole(user.role)}
                          </Badge>
                        )}
                      </div>
                      {user.employeeId && (
                        <p className="text-sm text-foreground flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Employee ID:{" "}
                          <span className="font-medium">{user.employeeId}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Details Card */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
              <Card className="transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground uppercase tracking-wide flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        Email
                      </label>
                      <p className="text-sm font-medium">{user.email || "—"}</p>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground uppercase tracking-wide flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        Phone
                      </label>
                      <p className="text-sm font-medium">{user.phone || "—"}</p>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground uppercase tracking-wide flex items-center gap-2">
                        <User className="h-3 w-3" />
                        Username
                      </label>
                      <p className="text-sm font-medium">
                        {user.username || "—"}
                      </p>
                    </div>

                    {/* Department */}
                    {user.department && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground uppercase tracking-wide flex items-center gap-2">
                          <Building2 className="h-3 w-3" />
                          Department
                        </label>
                        <p className="text-sm font-medium">
                          {typeof user.department === "string"
                            ? user.department
                            : user.department.departmentName ||
                              user.department.departmentCode ||
                              "—"}
                        </p>
                      </div>
                    )}

                    {/* Verification Status */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground uppercase tracking-wide flex items-center gap-2">
                        <UserCheck className="h-3 w-3" />
                        Verification Status
                      </label>
                      <Badge
                        variant={user.isVerified ? "default" : "secondary"}
                      >
                        {user.isVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </div>

                    {/* Created Date */}
                    {user.createdAt && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-foreground uppercase tracking-wide flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Member Since
                        </label>
                        <p className="text-sm font-medium">
                          {format(new Date(user.createdAt), "PPp")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </NotificationProvider>
  );
}
