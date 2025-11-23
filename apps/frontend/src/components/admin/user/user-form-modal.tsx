'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { User } from '@/interfaces/user/user.interface';
import { useCreateUserMutation, useCreateStaffAccountMutation, useUpdateUserMutation, useGetCurrentProfileQuery } from '@/store/userApi';
import { useGetDepartmentsQuery } from '@/store/departmentApi';
import { Department } from '@/interfaces/user/department.interface';
import { Roles } from '@/enums/user.enum';
import { User as UserIcon } from 'lucide-react';

interface UserFormModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserFormModal({ user, isOpen, onClose, onSuccess }: UserFormModalProps) {
  const isEdit = !!user;
  const [createUser] = useCreateUserMutation();
  const [createStaffAccount] = useCreateStaffAccountMutation();
  const [updateUser] = useUpdateUserMutation();
  const { data: departmentsData } = useGetDepartmentsQuery({ page: 1, limit: 1000 });
  const { data: currentUserData } = useGetCurrentProfileQuery();
  const departments: Department[] = departmentsData?.data ?? [];
  const currentUser = currentUserData?.data;
  const isSystemAdmin = currentUser?.role === Roles.SYSTEM_ADMIN;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    employeeId: '',
    role: '',
    departmentId: '',
    isActive: true,
    isVerified: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        employeeId: user.employeeId || '',
        role: user.role || '',
        departmentId: user.departmentId || '',
        isActive: user.isActive ?? true,
        isVerified: user.isVerified ?? false,
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        employeeId: '',
        role: '',
        departmentId: '',
        isActive: true,
        isVerified: false,
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async () => {
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!isEdit && !formData.password.trim()) {
      toast.error('Password is required');
      return;
    }
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (!formData.role) {
      toast.error('Role is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        employeeId: formData.employeeId || undefined,
        role: formData.role,
        departmentId: formData.departmentId || undefined,
        isActive: formData.isActive,
        isVerified: formData.isVerified,
      };

      if (!isEdit) {
        payload.password = formData.password;
      }

      if (isEdit && user) {
        await updateUser({ id: user.id, updates: payload }).unwrap();
        toast.success('User updated successfully');
      } else {
        if (isSystemAdmin) {
          await createStaffAccount(payload).unwrap();
          toast.success('Staff account created successfully');
        } else {
          await createUser(payload).unwrap();
          toast.success('User created successfully');
        }
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = Object.values(Roles).map(role => ({
    value: role,
    label: role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? 'Edit User' : 'Create New User'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          <div className="space-y-8 pr-4 pb-2">
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <UserIcon className="h-5 w-5" />
                Basic Information
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g., johndoe"
                    className="text-foreground"
                    disabled={isEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g., john.doe@example.com"
                    className="text-foreground"
                  />
                </div>
                {!isEdit && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password"
                      className="text-foreground"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g., John"
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="e.g., Doe"
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g., +1234567890"
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-foreground">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="e.g., EMP001"
                    className="text-foreground"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <UserIcon className="h-5 w-5" />
                Role & Department
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-foreground">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departmentId" className="text-foreground">Department</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger className="text-foreground">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <UserIcon className="h-5 w-5" />
                Status
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked as boolean })
                    }
                  />
                  <Label htmlFor="isActive" className="text-foreground cursor-pointer">
                    Active
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVerified"
                    checked={formData.isVerified}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isVerified: checked as boolean })
                    }
                  />
                  <Label htmlFor="isVerified" className="text-foreground cursor-pointer">
                    Verified
                  </Label>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

