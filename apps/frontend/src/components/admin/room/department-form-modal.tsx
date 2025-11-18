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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Department } from '@/interfaces/user/department.interface';
import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from '@/store/departmentApi';
import { Building } from 'lucide-react';

interface DepartmentFormModalProps {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DepartmentFormModal({
  department,
  isOpen,
  onClose,
  onSuccess,
}: DepartmentFormModalProps) {
  const isEdit = !!department;
  const [createDepartment] = useCreateDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (department) {
      setFormData({
        code: department.departmentCode || '',
        name: department.departmentName || '',
        description: department.description || '',
        isActive: department.isActive ?? true,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        isActive: true,
      });
    }
  }, [department, isOpen]);

  const handleSubmit = async () => {
    if (!formData.code.trim()) {
      toast.error('Department code is required');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Department name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit && department) {
        const payload = {
          code: formData.code,
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        };
        await updateDepartment({ id: department.id, data: payload }).unwrap();
        toast.success('Department updated successfully');
      } else {
        const payload = {
          code: formData.code,
          name: formData.name,
          description: formData.description,
        };
        await createDepartment(payload).unwrap();
        toast.success('Department created successfully');
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} department`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? 'Edit Department' : 'Create New Department'}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0 h-full px-6">
          <div className="space-y-8 pr-4 pb-2">
            {/* Basic Information */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building className="h-5 w-5" />
                Basic Information
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-foreground">Department Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., DEP001"
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Department Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Cardiology"
                    className="text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-foreground">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Department description..."
                    rows={4}
                    className="text-foreground"
                  />
                </div>
              </div>
            </section>

            {/* Status */}
            <section className="rounded-2xl p-6 shadow border-border border space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building className="h-5 w-5" />
                Status
              </div>
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
            </section>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Department' : 'Create Department'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
