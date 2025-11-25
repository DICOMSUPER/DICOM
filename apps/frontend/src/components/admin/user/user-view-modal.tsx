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
import { Skeleton } from '@/components/ui/skeleton';
import { User } from '@/interfaces/user/user.interface';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  Building2,
  Badge as BadgeIcon,
} from 'lucide-react';
import { getBooleanStatusBadge } from '@/utils/status-badge';

interface UserViewModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (user: User) => void;
}

export function UserViewModal({ user, isOpen, onClose, onEdit }: UserViewModalProps) {

  const formatDateTime = (dateValue?: string | Date | null) => {
    if (!dateValue) return '—';
    const date = typeof dateValue === 'string' || dateValue instanceof Date ? new Date(dateValue) : null;
    if (!date || Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return '—';
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">User Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          {!user ? (
            <div className="space-y-8 pr-4 pb-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="space-y-4 pr-4 pb-2">
              <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
                    <UserIcon className="h-3.5 w-3.5" />
                    {user.username}
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-foreground leading-tight">
                      {user.firstName} {user.lastName}
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-foreground">
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  {getBooleanStatusBadge(user.isActive ?? true)}
                </div>
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <UserIcon className="h-5 w-5" />
                Personal & Contact Information
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <UserIcon className="h-4 w-4" />
                    Username
                  </div>
                  <p className="text-base font-semibold text-foreground">{user.username}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <UserIcon className="h-4 w-4" />
                    First Name
                  </div>
                  <p className="text-base font-semibold text-foreground">{user.firstName}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <UserIcon className="h-4 w-4" />
                    Last Name
                  </div>
                  <p className="text-base font-semibold text-foreground">{user.lastName}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="text-base font-semibold text-foreground">{user.email}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                  <p className="text-base font-semibold text-foreground">{user.phone || '—'}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="h-5 w-5" />
                Role, Department & Additional Information
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Shield className="h-4 w-4" />
                    Role
                  </div>
                  <p className="text-base font-semibold text-foreground">{getRoleLabel(user.role)}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Building2 className="h-4 w-4" />
                    Department
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {user.department?.departmentName || '—'}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <BadgeIcon className="h-4 w-4" />
                    Employee ID
                  </div>
                  <p className="text-base font-semibold text-foreground">{user.employeeId || '—'}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Shield className="h-4 w-4" />
                    Verified
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {user.isVerified ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5" />
                Timestamps
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <p className="text-sm text-foreground">Created At</p>
                  <p className="text-base font-semibold text-foreground">
                    {formatDateTime(user.createdAt)}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
                  <p className="text-sm text-foreground">Updated At</p>
                  <p className="text-base font-semibold text-foreground">
                    {formatDateTime(user.updatedAt)}
                  </p>
                </div>
              </div>
            </section>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && user && (
            <Button variant="default" onClick={() => onEdit(user)}>
              Edit User
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

