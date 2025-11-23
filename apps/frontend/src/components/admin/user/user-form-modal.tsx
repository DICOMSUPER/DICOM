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
import { Label } from '@/components/ui/label';
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
import { useGetDepartmentsQuery, useUpdateDepartmentMutation } from '@/store/departmentApi';
import { Department } from '@/interfaces/user/department.interface';
import { Roles } from '@/enums/user.enum';
import { User as UserIcon } from 'lucide-react';

interface UserFormModalProps {
  user: User | null;
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
  departmentId: z.string().optional().refine((val) => !val || /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val), {
    message: 'Department ID must be a valid UUID',
  }),
  headDepartmentId: z.string().optional().refine((val) => !val || /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val), {
    message: 'Head Department ID must be a valid UUID',
  }),
  isActive: z.boolean(),
  isVerified: z.boolean(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function UserFormModal({ user, isOpen, onClose, onSuccess }: UserFormModalProps) {
  const isEdit = !!user;
  const [createUser] = useCreateUserMutation();
  const [createStaffAccount] = useCreateStaffAccountMutation();
  const [updateUser] = useUpdateUserMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const { data: departmentsData } = useGetDepartmentsQuery({ page: 1, limit: 10000 });
  const { data: currentUserData } = useGetCurrentProfileQuery();
  const departments: Department[] = departmentsData?.data ?? [];
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
      headDepartmentId: '',
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
        headDepartmentId: headDepartment?.id || '',
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
        headDepartmentId: '',
        isActive: true,
        isVerified: false,
      });
    }
  }, [isOpen, user?.id, form, departments]);

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
        departmentId: data.departmentId || undefined,
        isActive: data.isActive,
        isVerified: data.isVerified,
      };

      if (!isEdit) {
        payload.password = data.password;
      }

      let userId: string;
      if (isEdit && user) {
        await updateUser({ id: user.id, updates: payload }).unwrap();
        userId = user.id;
        toast.success('User updated successfully');
      } else {
        let result;
        if (isSystemAdmin) {
          result = await createStaffAccount(payload).unwrap();
          toast.success('Staff account created successfully');
        } else {
          result = await createUser(payload).unwrap();
          toast.success('User created successfully');
        }
        userId = (result as any).id || (result as any).user?.id || '';
      }

      if (userId) {
        const currentHeadDepartments = departments.filter(dept => dept.headDepartmentId === userId);
        
        for (const dept of currentHeadDepartments) {
          if (dept.id !== data.headDepartmentId) {
            await updateDepartment({ 
              id: dept.id, 
              data: { headDepartmentId: undefined } as any
            }).unwrap();
          }
        }

        if (data.headDepartmentId) {
          await updateDepartment({ 
            id: data.headDepartmentId, 
            data: { headDepartmentId: userId } as any
          }).unwrap();
        }
      }

      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
    }
  };

  const roleOptions = Object.values(Roles)
    .filter(role => isEdit || role !== Roles.SYSTEM_ADMIN)
    .map(role => ({
      value: role,
      label: role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? 'Edit User' : 'Create New User'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 min-h-0 h-full px-6">
              <div className="space-y-8 pr-4 pb-2">
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <UserIcon className="h-5 w-5" />
                    Basic Information
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Username *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., johndoe"
                              className="text-foreground"
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
                          <FormLabel className="text-foreground">Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="e.g., john.doe@example.com"
                              className="text-foreground"
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
                            <FormLabel className="text-foreground">Password *</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter password"
                                className="text-foreground"
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
                          <FormLabel className="text-foreground">First Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., John"
                              className="text-foreground"
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
                          <FormLabel className="text-foreground">Last Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Doe"
                              className="text-foreground"
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
                          <FormLabel className="text-foreground">Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., +1234567890"
                              className="text-foreground"
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
                          <FormLabel className="text-foreground">Employee ID</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., EMP001"
                              className="text-foreground"
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
                      <FormItem className="flex items-center space-x-2 pt-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-foreground cursor-pointer">
                          Active
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </section>

                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <UserIcon className="h-5 w-5" />
                    Role & Department
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Role *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="text-foreground">
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
                          <FormLabel className="text-foreground">Department</FormLabel>
                          <Select
                            value={field.value || "none"}
                            onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                          >
                            <FormControl>
                              <SelectTrigger className="text-foreground">
                                <SelectValue placeholder="Select department" />
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
                    <FormField
                      control={form.control}
                      name="headDepartmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Head of Department</FormLabel>
                          <Select
                            value={field.value || "none"}
                            onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                          >
                            <FormControl>
                              <SelectTrigger className="text-foreground">
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

                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <UserIcon className="h-5 w-5" />
                    Verification
                  </div>
                  <FormField
                    control={form.control}
                    name="isVerified"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-foreground cursor-pointer">
                          Verified
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </section>
              </div>
            </ScrollArea>

            <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <Button type="button" variant="outline" onClick={handleClose} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

