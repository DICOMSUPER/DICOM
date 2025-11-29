'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getBooleanStatusBadge } from '@/utils/status-badge';
import { useGetAllUsersQuery, useGetUserStatsQuery, useUpdateUserMutation, UserFilters } from '@/store/userApi';
import { useGetDepartmentsQuery } from '@/store/departmentApi';
import { UserTable } from '@/components/admin/user/UserTable';
import { UserStatsCards } from '@/components/admin/user/user-stats-cards';
import { UserFilters as UserFiltersComponent } from '@/components/admin/user/user-filters';
import { UserViewModal } from '@/components/admin/user/user-view-modal';
import { UserFormModal } from '@/components/admin/user/user-form-modal';
import { UserToggleStatusModal } from '@/components/admin/user/user-toggle-status-modal';
import { RefreshButton } from '@/components/ui/refresh-button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Pagination } from '@/components/common/PaginationV1';
import { User } from '@/interfaces/user/user.interface';
import { Department } from '@/interfaces/user/department.interface';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { extractApiData } from '@/utils/api';
import { Roles } from '@/enums/user.enum';

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
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryParams: UserFilters = useMemo(() => {
    const params: UserFilters = {
      page,
      limit,
      excludeRole: Roles.SYSTEM_ADMIN,
      includeInactive: true,
      includeDeleted: true,
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
    data: userStatsData,
    isLoading: userStatsLoading,
    refetch: refetchUserStats,
  } = useGetUserStatsQuery();

  const {
    data: departmentsData,
    isLoading: deptsLoading,
    refetch: refetchDepartments,
  } = useGetDepartmentsQuery({ page: 1, limit: 1000 });

  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

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

  const users: User[] = extractApiData<User>(usersRes);
  const departments: Department[] = extractApiData<Department>(departmentsData);

  const paginationMeta = usersRes ? {
    total: usersRes.total ?? 0,
    page: usersRes.page ?? 1,
    limit: usersRes.limit ?? limit,
    totalPages: usersRes.totalPages ?? 1,
    hasNextPage: usersRes.hasNextPage ?? false,
    hasPreviousPage: usersRes.hasPreviousPage ?? false,
  } : null;

  const stats = useMemo(() => {
    return {
      total: userStatsData?.totalUsers ?? 0,
      active: userStatsData?.activeUsers ?? 0,
      inactive: userStatsData?.inactiveUsers ?? 0,
      verified: userStatsData?.verifiedUsers ?? 0,
    };
  }, [userStatsData]);

  const getStatusBadge = (isActive: boolean) => {
    return getBooleanStatusBadge(isActive);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchUsers(), refetchUserStats(), refetchDepartments()]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
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

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setIsToggleStatusModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedUser) return;
    try {
      const newStatus = !(selectedUser.isActive ?? true);
      await updateUser({
        id: selectedUser.id,
        updates: { isActive: newStatus },
      }).unwrap();
      toast.success(`User ${newStatus ? 'enabled' : 'disabled'} successfully`);
      setIsToggleStatusModalOpen(false);
      setSelectedUser(null);
      await refetchUsers();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error?.data?.message || `Failed to ${selectedUser.isActive ? 'disable' : 'enable'} user`);
    }
  };

  const handleFormSuccess = async () => {
    const usersResult = await refetchUsers();
    await refetchDepartments();
    if (selectedUser && usersResult.data) {
      const updatedUsers = extractApiData<User>(usersResult.data);
      const updatedUser = updatedUsers.find(u => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
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
            loading={isRefreshing}
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
        isLoading={userStatsLoading}
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
        onToggleStatus={handleToggleStatus}
        page={paginationMeta?.page ?? page}
        limit={limit}
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
        departments={departments}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <UserToggleStatusModal
        user={selectedUser}
        isOpen={isToggleStatusModalOpen}
        onClose={() => {
          setIsToggleStatusModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmToggleStatus}
        isUpdating={isUpdatingUser}
      />
    </div>
  );
}

