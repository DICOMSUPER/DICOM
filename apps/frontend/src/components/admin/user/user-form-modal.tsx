'use client';

import { useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '@/interfaces/user/user.interface';
import { useCreateUserMutation, useCreateStaffAccountMutation, useUpdateUserMutation, useGetCurrentProfileQuery } from '@/store/userApi';
import { Department } from '@/interfaces/user/department.interface';
import { Roles } from '@/enums/user.enum';
import { User as UserIcon, Shield, BadgeCheck, Building2 } from 'lucide-react';
import { formatRole, modalStyles } from '@/utils/format-status';

interface UserFormModalProps {
  user: User | null;
  departments: Department[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const userFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must not exceed 50 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address').max(100, 'Email must not exceed 100 characters'),
  password: z.string().optional(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must not exceed 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must not exceed 50 characters'),
  phone: z.string().optional().refine((val) => !val || (val.length >= 10 && val.length <= 20), {
    message: 'Phone number must be between 10 and 20 characters',
  }),
  employeeId: z.string().optional().refine((val) => !val || (val.length >= 1 && val.length <= 20), {
    message: 'Employee ID must not exceed 20 characters',
  }),
  role: z.string().min(1, 'Role is required'),
  departmentId: z.string().min(1, 'Department is required').refine((val) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val), {
    message: 'Department ID must be a valid UUID',
  }),
  targetDepartmentId: z.string().optional().refine((val) => !val || /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val), {
    message: 'Target Department ID must be a valid UUID',
  }),
  isActive: z.boolean(),
  isVerified: z.boolean(),
}).refine((data) => {
  if (data.targetDepartmentId && data.departmentId) {
    return data.targetDepartmentId === data.departmentId;
  }
  return true;
}, {
  message: 'Target Department must match the Department where the user works',
  path: ['targetDepartmentId'],
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function UserFormModal({ user, departments, isOpen, onClose, onSuccess }: UserFormModalProps) {
  const isEdit = !!user;
  const [createUser] = useCreateUserMutation();
  const [createStaffAccount] = useCreateStaffAccountMutation();
  const [updateUser] = useUpdateUserMutation();
  const { data: currentUserData } = useGetCurrentProfileQuery();
  const currentUser = currentUserData?.data;
  const isSystemAdmin = currentUser?.role === Roles.SYSTEM_ADMIN;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      employeeId: '',
      role: '',
      departmentId: '',
      targetDepartmentId: '',
      isActive: true,
      isVerified: false,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    
    if (user) {
      const headDepartment = departments.find(dept => dept.headDepartmentId === user.id);
      form.reset({
        username: user.username || '',
        email: user.email || '',
        password: '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        employeeId: user.employeeId || '',
        role: user.role || '',
        departmentId: user.departmentId || '',
        targetDepartmentId: headDepartment?.id || '',
        isActive: user.isActive ?? true,
        isVerified: user.isVerified ?? false,
      });
    } else {
      form.reset({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        employeeId: '',
        role: '',
        departmentId: '',
        targetDepartmentId: '',
        isActive: true,
        isVerified: false,
      });
    }
  }, [isOpen, user?.id]);

  const onSubmit = async (data: UserFormValues) => {
    if (!isEdit && !data.password) {
      form.setError('password', { message: 'Password is required' });
      return;
    }
    if (!isEdit && data.role === Roles.SYSTEM_ADMIN) {
      form.setError('role', { message: 'Cannot create system admin users' });
      return;
    }
    try {
      const payload: any = {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        employeeId: data.employeeId || undefined,
        role: data.role,
        departmentId: data.departmentId,
        targetDepartmentId: data.targetDepartmentId ? data.targetDepartmentId : null,
        isActive: data.isActive,
        isVerified: data.isVerified,
      };

      if (!isEdit) {
        payload.password = data.password;
      }

      if (isEdit && user) {
        const result = await updateUser({ id: user.id, updates: payload }).unwrap();
        toast.success('User updated successfully');
        onSuccess?.();
        onClose();
        form.reset();
      } else {
        if (isSystemAdmin) {
          await createStaffAccount(payload).unwrap();
          toast.success('Staff account created successfully');
        } else {
          await createUser(payload).unwrap();
          toast.success('User created successfully');
        }
        onSuccess?.();
        onClose();
        form.reset();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
    }
  };

  const roleOptions = Object.values(Roles)
    .filter(role => isEdit || role !== Roles.SYSTEM_ADMIN)
    .map(role => ({
      value: role,
      label: formatRole(role),
    }));

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={modalStyles.dialogContent}>
        <DialogHeader className={modalStyles.dialogHeader}>
          <DialogTitle className={modalStyles.dialogTitle}>
            {isEdit ? 'Edit User' : 'Create New User'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 min-h-0 h-full px-6 py-4">
              <div className="space-y-6">
                {/* Basic Information */}
                <section className={modalStyles.formSection}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <UserIcon className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={modalStyles.formLabel}>Username *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., johndoe"
                              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                              disabled={isEdit}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={modalStyles.formLabel}>Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="e.g., john.doe@example.com"
                              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {!isEdit && (
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={modalStyles.formLabel}>Password *</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter password"
                                className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={modalStyles.formLabel}>First Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., John"
                              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={modalStyles.formLabel}>Last Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Doe"
                              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={modalStyles.formLabel}>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., +1234567890"
                              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={modalStyles.formLabel}>Employee ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., EMP001"
                              className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 pt-4 border-t border-slate-100 mt-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-teal-600"
                          />
                        </FormControl>
                        <FormLabel className={`${modalStyles.formLabel} cursor-pointer mt-0!`}>
                          Active Status
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </section>

                {/* Role & Department */}
                <section className={modalStyles.formSection}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <Shield className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Role & Department</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={modalStyles.formLabel}>Role *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roleOptions.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={modalStyles.formLabel}>Department *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500 w-full">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.departmentName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetDepartmentId"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className={modalStyles.formLabel}>Head of Department</FormLabel>
                          <Select
                            value={field.value || "none"}
                            onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                          >
                            <FormControl>
                              <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500">
                                <SelectValue placeholder="Select department to head" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.departmentName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                {/* Verification */}
                <section className={modalStyles.formSection}>
                  <div className={modalStyles.sectionHeader}>
                    <div className={modalStyles.sectionIconContainer}>
                      <BadgeCheck className={modalStyles.sectionIcon} />
                    </div>
                    <h3 className={modalStyles.sectionTitle}>Verification</h3>
                  </div>
                  <FormField
                    control={form.control}
                    name="isVerified"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 rounded-lg border border-slate-200 p-4 bg-slate-50/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                          />
                        </FormControl>
                        <FormLabel className={`${modalStyles.formLabel} cursor-pointer mt-0!`}>
                          Mark user as verified
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </section>
              </div>
            </ScrollArea>

            <DialogFooter className={modalStyles.dialogFooter}>
              <Button type="button" variant="outline" onClick={handleClose} disabled={form.formState.isSubmitting} className={modalStyles.secondaryButton}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className={modalStyles.primaryButton}>
                {form.formState.isSubmitting ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
