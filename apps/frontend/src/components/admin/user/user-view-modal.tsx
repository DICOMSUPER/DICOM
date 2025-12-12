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
import { User } from '@/interfaces/user/user.interface';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  Building2,
  BadgeCheck,
  Clock,
} from 'lucide-react';
import { formatStatus, formatRole, modalStyles, getStatusBadgeColor, shouldAnimateDot } from '@/utils/format-status';

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

  const getActiveStatusBadge = (isActive: boolean) => {
    const color = getStatusBadgeColor(isActive);
    const dotClass = isActive ? modalStyles.statusDot.green : modalStyles.statusDot.slate;
    return (
      <Badge className={modalStyles.badge[color]}>
        <div className={dotClass} />
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const getVerifiedStatusBadge = (isVerified: boolean) => {
    const color = isVerified ? 'blue' : 'slate';
    return (
      <Badge className={modalStyles.badge[color]}>
        <div className={isVerified ? modalStyles.statusDot.blue : modalStyles.statusDot.slate} />
        {isVerified ? 'Verified' : 'Not Verified'}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={modalStyles.dialogContent}>
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>User Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
          {!user ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hero Section */}
              <section className={modalStyles.heroSection}>
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-3">
                    <div className={modalStyles.heroLabel}>
                      <UserIcon className="h-3.5 w-3.5 inline mr-1" />
                      {user.username}
                    </div>
                    <div>
                      <p className={modalStyles.heroTitle}>
                        {user.firstName} {user.lastName}
                      </p>
                      <div className="mt-3 space-y-2">
                        <p className={modalStyles.heroSubtitle}>
                          <Mail className="h-4 w-4 text-teal-600" />
                          {user.email}
                        </p>
                        {user.phone && (
                          <p className={modalStyles.heroSubtitle}>
                            <Phone className="h-4 w-4 text-teal-600" />
                            {user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getActiveStatusBadge(user.isActive ?? true)}
                    {getVerifiedStatusBadge(user.isVerified ?? false)}
                  </div>
                </div>
              </section>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Shield className={modalStyles.gridCardIcon} />
                    Role
                  </div>
                  <Badge className={modalStyles.badge.teal}>
                    {formatRole(user.role)}
                  </Badge>
                </div>

                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Building2 className={modalStyles.gridCardIcon} />
                    Department
                  </div>
                  <p className={modalStyles.gridCardValue}>
                    {user.department?.departmentName || '—'}
                  </p>
                </div>

                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <BadgeCheck className={modalStyles.gridCardIcon} />
                    Employee ID
                  </div>
                  <p className={modalStyles.gridCardValue}>
                    {user.employeeId || '—'}
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <UserIcon className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Username</div>
                    <p className={modalStyles.infoCardLarge}>{user.username}</p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>First Name</div>
                    <p className={modalStyles.infoCardLarge}>{user.firstName}</p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>Last Name</div>
                    <p className={modalStyles.infoCardLarge}>{user.lastName}</p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Mail className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>
                      <Mail className="w-3 h-3 inline mr-1" />
                      Email
                    </div>
                    <p className={modalStyles.infoCardValue}>{user.email}</p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>
                      <Phone className="w-3 h-3 inline mr-1" />
                      Phone
                    </div>
                    <p className={modalStyles.infoCardValue}>{user.phone || '—'}</p>
                  </div>
                </div>
              </section>

              {/* Timestamps */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Clock className={modalStyles.sectionIcon} />
                  </div>
                  <h3 className={modalStyles.sectionTitle}>Timestamps</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Created At
                    </div>
                    <p className={modalStyles.infoCardValue}>
                      {formatDateTime(user.createdAt)}
                    </p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Updated At
                    </div>
                    <p className={modalStyles.infoCardValue}>
                      {formatDateTime(user.updatedAt)}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className={modalStyles.dialogFooter}>
          <Button variant="outline" onClick={onClose} className={modalStyles.secondaryButton}>
            Close
          </Button>
          {onEdit && user && (
            <Button onClick={() => onEdit(user)} className={modalStyles.primaryButton}>
              Edit User
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
