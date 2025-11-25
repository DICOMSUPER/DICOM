'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Department } from '@/interfaces/user/department.interface';
import { Building, Mail, Phone, User, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface DepartmentViewModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (department: Department) => void;
}

export function DepartmentViewModal({
  department,
  isOpen,
  onClose,
  onEdit,
}: DepartmentViewModalProps) {

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-rose-100 text-rose-700 border-rose-200';
  };

  const formatDateTime = (dateValue?: string | Date | null) => {
    if (!dateValue) return '—';
    const date = typeof dateValue === 'string' || dateValue instanceof Date ? new Date(dateValue) : null;
    if (!date || Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">Department Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          {!department ? (
            <div className="space-y-8 pr-4 pb-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="space-y-8 pr-4 pb-2">
              <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    <Building className="h-3.5 w-3.5" />
                    {department.departmentCode}
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground leading-tight">
                      {department.departmentName}
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-foreground">
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {department.rooms?.length || 0} room{department.rooms?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <Badge className={`${getStatusColor(department.isActive)} px-4 py-1 text-xs font-semibold shadow-sm`}>
                    {department.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {department.rooms && department.rooms.length > 0 && (
                    <div className="rounded-2xl bg-background/70 px-4 py-3 text-sm text-foreground shadow">
                      <p className="uppercase text-xs tracking-wide">Total Rooms</p>
                      <p className="text-base font-semibold text-foreground flex items-center gap-1 justify-end">
                        <Users className="h-4 w-4" />
                        {department.rooms.length}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground">Department Code</p>
                    <p className="text-lg font-semibold text-foreground">{department.departmentCode}</p>
                    <p className="text-xs text-foreground">Identifier</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground">Total Rooms</p>
                    <p className="text-lg font-semibold text-foreground">
                      {department.rooms?.length || 0}
                    </p>
                    <p className="text-xs text-foreground">Assigned rooms</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-foreground">Head Department</p>
                    <p className="text-lg font-semibold text-foreground">
                      {department.headDepartment
                        ? `${department.headDepartment.firstName} ${department.headDepartment.lastName}`
                        : 'Not assigned'}
                    </p>
                    <p className="text-xs text-foreground">Lead contact</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Overview Section */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building className="h-5 w-5" />
                Department Overview
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Building className="h-4 w-4" />
                    Department Code
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {department.departmentCode}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Users className="h-4 w-4" />
                    Room Count
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {department.rooms?.length || 0} rooms
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <p className="text-sm text-foreground">Status</p>
                  <Badge className={`${getStatusColor(department.isActive)} px-4 py-1 text-xs font-semibold shadow-sm`}>
                    {department.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 space-y-6">
                {/* Description */}
                {department.description && (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-3">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Building className="h-5 w-5" />
                      Description
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-primary/10 p-4 rounded-2xl shadow-sm">
                      {department.description}
                    </p>
                  </section>
                )}

                {/* Head Department */}
                {department.headDepartment && (
                  <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <User className="h-5 w-5" />
                      Head Department
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Name</p>
                        <p className="text-base font-semibold text-foreground flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {department.headDepartment.firstName} {department.headDepartment.lastName}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                        <p className="text-sm text-foreground">Role</p>
                        <p className="text-base font-semibold text-foreground">
                          {department.headDepartment.role || 'N/A'}
                        </p>
                      </div>
                      {department.headDepartment.email && (
                        <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                          <p className="text-sm text-foreground">Email</p>
                          <p className="text-base font-semibold text-foreground flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {department.headDepartment.email}
                          </p>
                        </div>
                      )}
                      {department.headDepartment.phone && (
                        <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                          <p className="text-sm text-foreground">Phone</p>
                          <p className="text-base font-semibold text-foreground flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {department.headDepartment.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>

              <div className="space-y-6">
                {/* Timestamps */}
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Calendar className="h-5 w-5" />
                    Timestamps
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <p className="text-sm text-foreground">Created At</p>
                      <p className="text-base font-semibold text-foreground">
                        {formatDateTime(department.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                      <p className="text-sm text-foreground">Updated At</p>
                      <p className="text-base font-semibold text-foreground">
                        {formatDateTime(department.updatedAt)}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
            </div>
          )}
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && department && (
            <Button variant="default" onClick={() => onEdit(department)}>
              Edit Department
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
