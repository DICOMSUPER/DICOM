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
import { Textarea } from '@/components/ui/textarea';
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
import { Department } from '@/interfaces/user/department.interface';
import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from '@/store/departmentApi';
import { Building } from 'lucide-react';

interface DepartmentFormModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const departmentFormSchema = z.object({
  code: z.string().min(1, 'Department code is required'),
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export function DepartmentFormModal({
  department,
  isOpen,
  onClose,
  onSuccess,
}: DepartmentFormModalProps) {
  const isEdit = !!department;
  const [createDepartment] = useCreateDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (department) {
      form.reset({
        code: department.departmentCode || '',
        name: department.departmentName || '',
        description: department.description || '',
        isActive: department.isActive ?? true,
      });
    } else {
      form.reset({
        code: '',
        name: '',
        description: '',
        isActive: true,
      });
    }
  }, [department, isOpen, form]);

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      if (isEdit && department) {
        const payload = {
          code: data.code,
          name: data.name,
          description: data.description,
          isActive: data.isActive,
        };
        await updateDepartment({ id: department.id, data: payload }).unwrap();
        toast.success('Department updated successfully');
      } else {
        const payload = {
          code: data.code,
          name: data.name,
          description: data.description,
        };
        await createDepartment(payload).unwrap();
        toast.success('Department created successfully');
      }
      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(
        error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} department`
      );
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? 'Edit Department' : 'Create New Department'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 min-h-0 h-full px-6">
              <div className="space-y-8 pr-4 pb-2">
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Building className="h-5 w-5" />
                    Basic Information
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Department Code *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., DEP001"
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Department Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Cardiology"
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
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Department description..."
                              rows={4}
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
              </div>
            </ScrollArea>

            <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <Button type="button" variant="outline" onClick={handleClose} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : isEdit ? 'Update Department' : 'Create Department'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
