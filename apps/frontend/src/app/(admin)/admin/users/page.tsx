'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getBooleanStatusBadge } from '@/utils/status-badge';
import { useGetAllUsersQuery, useDeleteUserMutation, UserFilters } from '@/store/userApi';
import { useGetDepartmentsQuery } from '@/store/departmentApi';
import { UserTable } from '@/components/admin/user/UserTable';
import { UserStatsCards } from '@/components/admin/user/user-stats-cards';
import { UserFilters as UserFiltersComponent } from '@/components/admin/user/user-filters';
import { UserViewModal } from '@/components/admin/user/user-view-modal';
import { UserFormModal } from '@/components/admin/user/user-form-modal';
import { UserDeleteModal } from '@/components/admin/user/user-delete-modal';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Pagination } from '@/components/common/PaginationV1';
import { User } from '@/interfaces/user/user.interface';
import { Department } from '@/interfaces/user/department.interface';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface ApiError {
  data?: {
    message?: string;
  };
}

export default function Page() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedRoleFilter, setAppliedRoleFilter] = useState('all');
  const [appliedDepartmentFilter, setAppliedDepartmentFilter] = useState('all');
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const queryParams: UserFilters = useMemo(() => {
    const params: UserFilters = {
      page,
      limit,
    };

    if (appliedSearchTerm.trim()) {
      params.search = appliedSearchTerm.trim();
    }

    if (appliedRoleFilter !== 'all') {
      params.role = appliedRoleFilter;
    }

    if (appliedDepartmentFilter !== 'all') {
      params.departmentId = appliedDepartmentFilter;
    }

    if (appliedStatusFilter !== 'all') {
      params.isActive = appliedStatusFilter === 'true';
    }

    return params;
  }, [page, limit, appliedSearchTerm, appliedRoleFilter, appliedDepartmentFilter, appliedStatusFilter]);

  const {
    data: usersRes,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetAllUsersQuery(queryParams);

  const {
    data: departmentsData,
    isLoading: deptsLoading,
    refetch: refetchDepartments,
  } = useGetDepartmentsQuery({ page: 1, limit: 1000 });

  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

  useEffect(() => {
    if (usersError) {
      const error = usersError as FetchBaseQueryError;
      const errorMessage = 
        error?.data && 
        typeof error.data === 'object' &&
        'message' in error.data
          ? (error.data as { message: string }).message
          : 'Failed to load user data. Please try again.';
      setError(errorMessage);
    } else {
      setError(null);
    }
  }, [usersError]);

  const users: User[] = usersRes?.data ?? [];
  const departments: Department[] = departmentsData?.data ?? [];
  const paginationMeta = usersRes ? {
    total: usersRes.total,
    page: usersRes.page,
    limit: usersRes.limit,
    totalPages: usersRes.totalPages,
    hasNextPage: usersRes.hasNextPage,
    hasPreviousPage: usersRes.hasPreviousPage,
  } : null;

  const stats = useMemo(() => {
    const total = usersRes?.total ?? 0;
    const active = users.filter((u) => u.isActive).length;
    const inactive = users.filter((u) => !u.isActive).length;
    const verified = users.filter((u) => u.isVerified).length;
    return { total, active, inactive, verified };
  }, [users, usersRes?.total]);

  const getStatusBadge = (isActive: boolean) => {
    return getBooleanStatusBadge(isActive);
  };

  const handleRefresh = async () => {
    await Promise.all([refetchUsers(), refetchDepartments()]);
  };

  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedRoleFilter(roleFilter);
    setAppliedDepartmentFilter(departmentFilter);
    setAppliedStatusFilter(statusFilter);
    setPage(1);
  }, [searchTerm, roleFilter, departmentFilter, statusFilter]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setRoleFilter('all');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setAppliedSearchTerm('');
    setAppliedRoleFilter('all');
    setAppliedDepartmentFilter('all');
    setAppliedStatusFilter('all');
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id).unwrap();
      toast.success(`User deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      await refetchUsers();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error?.data?.message || `Failed to delete user`);
    }
  };

  const handleFormSuccess = () => {
    refetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-foreground">Search and manage user records</p>
        </div>
        <div className="flex items-center gap-4">
          <RefreshButton
            onRefresh={handleRefresh}
            loading={usersLoading || deptsLoading}
          />
          <Button
            onClick={handleCreateUser}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert title="Failed to load users" message={error} className="mb-4" />
      )}

      <UserStatsCards
        totalCount={stats.total}
        activeCount={stats.active}
        inactiveCount={stats.inactive}
        verifiedCount={stats.verified}
        isLoading={usersLoading}
      />

      <UserFiltersComponent
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        departmentFilter={departmentFilter}
        onDepartmentChange={setDepartmentFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        departments={departments}
        onSearch={handleSearch}
        onReset={handleResetFilters}
        isSearching={usersLoading}
      />

      <UserTable
        users={users}
        getStatusBadge={getStatusBadge}
        isLoading={usersLoading}
        emptyStateIcon={<Users className="h-12 w-12" />}
        emptyStateTitle="No users found"
        emptyStateDescription="No users match your search criteria. Try adjusting your filters or search terms."
        onViewDetails={handleViewDetails}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />
      {paginationMeta && (
        <Pagination
          pagination={paginationMeta}
          onPageChange={handlePageChange}
        />
      )}

      <UserViewModal
        user={selectedUser}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
        onEdit={(user) => {
          setIsViewModalOpen(false);
          handleEditUser(user);
        }}
      />

      <UserFormModal
        user={selectedUser}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <UserDeleteModal
        user={selectedUser}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmDeleteUser}
        isDeleting={isDeletingUser}
      />
    </div>
  );
}

