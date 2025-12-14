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
import { Department } from '@/common/interfaces/user/department.interface';
import { Building, Mail, Phone, User, Calendar, Users } from 'lucide-react';
import { formatStatus, formatRole, modalStyles, getStatusBadgeColor } from '@/common/utils/format-status';

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

  const getStatusBadge = (isActive: boolean) => {
    const colorKey = getStatusBadgeColor(isActive);
    return (
      <Badge className={`${modalStyles.badge[colorKey]} px-3 py-1 text-xs font-medium border flex items-center gap-1.5`}>
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
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
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden bg-slate-50">
        {/* Fixed Header */}
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>Department Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
          {!department ? (
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
                      <Building className="h-3.5 w-3.5 inline mr-1" />
                      {department.departmentCode}
                    </div>
                    <div>
                      <p className={modalStyles.heroTitle}>
                        {department.departmentName}
                      </p>
                      <div className="mt-3 space-y-2">
                        <p className={modalStyles.heroSubtitle}>
                          <Users className="h-4 w-4 text-teal-600" />
                          {department.rooms?.length || 0} room{department.rooms?.length !== 1 ? 's' : ''} assigned
                        </p>
                        {department.headDepartment && (
                          <p className={modalStyles.heroSubtitle}>
                            <User className="h-4 w-4 text-teal-600" />
                            Head: {department.headDepartment.firstName} {department.headDepartment.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(department.isActive)}
                  </div>
                </div>
              </section>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Building className={modalStyles.gridCardIcon} />
                    Department Code
                  </div>
                  <p className={modalStyles.gridCardValue}>
                    {department.departmentCode}
                  </p>
                </div>

                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <Users className={modalStyles.gridCardIcon} />
                    Total Rooms
                  </div>
                  <p className={modalStyles.gridCardValue}>
                    {department.rooms?.length || 0}
                  </p>
                </div>

                <div className={modalStyles.gridCard}>
                  <div className={modalStyles.gridCardLabel}>
                    <User className={modalStyles.gridCardIcon} />
                    Head Department
                  </div>
                  <p className={modalStyles.gridCardValue}>
                    {department.headDepartment
                      ? `${department.headDepartment.firstName} ${department.headDepartment.lastName}`
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Description Section */}
              {department.description && (
                <section className={modalStyles.section}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <Building className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Description</h3>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <p className={modalStyles.infoCardValue}>{department.description}</p>
                  </div>
                </section>
              )}

              {/* Head Department Information */}
              {department.headDepartment && (
                <section className={modalStyles.section}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <User className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Head Department</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={modalStyles.infoCard}>
                      <div className={modalStyles.infoCardLabel}>Name</div>
                      <p className={modalStyles.infoCardLarge}>
                        {department.headDepartment.firstName} {department.headDepartment.lastName}
                      </p>
                    </div>
                    <div className={modalStyles.infoCard}>
                      <div className={modalStyles.infoCardLabel}>Role</div>
                      <p className={modalStyles.infoCardLarge}>
                        {formatRole(department.headDepartment.role) || '—'}
                      </p>
                    </div>
                    {department.headDepartment.email && (
                      <div className={modalStyles.infoCard}>
                        <div className={modalStyles.infoCardLabel}>
                          <Mail className="w-3 h-3 inline mr-1" />
                          Email
                        </div>
                        <p className={modalStyles.infoCardValue}>{department.headDepartment.email}</p>
                      </div>
                    )}
                    {department.headDepartment.phone && (
                      <div className={modalStyles.infoCard}>
                        <div className={modalStyles.infoCardLabel}>
                          <Phone className="w-3 h-3 inline mr-1" />
                          Phone
                        </div>
                        <p className={modalStyles.infoCardValue}>{department.headDepartment.phone}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Timestamps */}
              <section className={modalStyles.section}>
                <div className={modalStyles.sectionHeader}>
                  <div className={modalStyles.sectionIconContainer}>
                    <Calendar className={modalStyles.sectionIcon} />
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
                      {formatDateTime(department.createdAt)}
                    </p>
                  </div>
                  <div className={modalStyles.infoCard}>
                    <div className={modalStyles.infoCardLabel}>
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Updated At
                    </div>
                    <p className={modalStyles.infoCardValue}>
                      {formatDateTime(department.updatedAt)}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className={modalStyles.dialogFooter}>
          <Button variant="outline" onClick={onClose} className={modalStyles.secondaryButton}>
            Close
          </Button>
          {onEdit && department && (
            <Button onClick={() => onEdit(department)} className={modalStyles.primaryButton}>
              Edit Department
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
