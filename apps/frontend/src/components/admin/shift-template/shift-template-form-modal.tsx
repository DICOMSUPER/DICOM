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
import { Textarea } from '@/components/ui/textarea';
import { TimePicker } from '@/components/ui/time-picker';
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
import { ShiftTemplate } from '@/interfaces/user/shift-template.interface';
import { ShiftType } from '@/enums/schedule.enum';
import { useCreateShiftTemplateMutation, useUpdateShiftTemplateMutation } from '@/store/scheduleApi';
import { Clock } from 'lucide-react';

interface ShiftTemplateFormModalProps {
  template: ShiftTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const shiftTemplateFormSchema = z.object({
  shift_name: z.string().min(1, 'Shift name is required').max(100, 'Shift name must not exceed 100 characters'),
  shift_type: z.nativeEnum(ShiftType),
  start_time: z.string().min(1, 'Start time is required').regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  end_time: z.string().min(1, 'End time is required').regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  break_start_time: z.string().optional().refine((val) => !val || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
    message: 'Invalid time format (HH:MM)',
  }),
  break_end_time: z.string().optional().refine((val) => !val || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
    message: 'Invalid time format (HH:MM)',
  }),
  description: z.string().optional(),
  is_active: z.boolean(),
}).refine((data) => {
  if (data.break_start_time && !data.break_end_time) {
    return false;
  }
  if (!data.break_start_time && data.break_end_time) {
    return false;
  }
  return true;
}, {
  message: 'Both break start and end times must be provided together',
  path: ['break_end_time'],
});

type ShiftTemplateFormValues = z.infer<typeof shiftTemplateFormSchema>;

export function ShiftTemplateFormModal({ template, isOpen, onClose, onSuccess }: ShiftTemplateFormModalProps) {
  const isEdit = !!template;
  const [createTemplate] = useCreateShiftTemplateMutation();
  const [updateTemplate] = useUpdateShiftTemplateMutation();

  const form = useForm<ShiftTemplateFormValues>({
    resolver: zodResolver(shiftTemplateFormSchema),
    defaultValues: {
      shift_name: '',
      shift_type: ShiftType.MORNING,
      start_time: '',
      end_time: '',
      break_start_time: '',
      break_end_time: '',
      description: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    
    if (template) {
      form.reset({
        shift_name: template.shift_name || '',
        shift_type: template.shift_type || ShiftType.MORNING,
        start_time: template.start_time || '',
        end_time: template.end_time || '',
        break_start_time: template.break_start_time || '',
        break_end_time: template.break_end_time || '',
        description: template.description || '',
        is_active: template.is_active ?? true,
      });
    } else {
      form.reset({
        shift_name: '',
        shift_type: ShiftType.MORNING,
        start_time: '',
        end_time: '',
        break_start_time: '',
        break_end_time: '',
        description: '',
        is_active: true,
      });
    }
  }, [isOpen, template?.shift_template_id]);

  const onSubmit = async (data: ShiftTemplateFormValues) => {
    try {
      const payload: any = {
        shift_name: data.shift_name,
        shift_type: data.shift_type,
        start_time: data.start_time,
        end_time: data.end_time,
        break_start_time: data.break_start_time || null,
        break_end_time: data.break_end_time || null,
        description: data.description || null,
        is_active: data.is_active,
      };

      if (isEdit && template) {
        await updateTemplate({ id: template.shift_template_id, updates: payload }).unwrap();
        toast.success('Shift template updated successfully');
      } else {
        await createTemplate(payload).unwrap();
        toast.success('Shift template created successfully');
      }
      onSuccess?.();
      onClose();
      form.reset();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} shift template`);
    }
  };

  const shiftTypeOptions = Object.values(ShiftType).map(type => ({
    value: type,
    label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
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
            {isEdit ? 'Edit Shift Template' : 'Create New Shift Template'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 min-h-0 h-full px-6">
              <div className="space-y-8 pr-4 pb-2">
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock className="h-5 w-5" />
                    Basic Information
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shift_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Shift Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Morning Shift"
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
                      name="shift_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Shift Type *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="text-foreground">
                                <SelectValue placeholder="Select shift type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {shiftTypeOptions.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
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
                    <Clock className="h-5 w-5" />
                    Time Schedule
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Start Time *</FormLabel>
                          <FormControl>
                            <TimePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select start time"
                              error={!!form.formState.errors.start_time}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">End Time *</FormLabel>
                          <FormControl>
                            <TimePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select end time"
                              error={!!form.formState.errors.end_time}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="break_start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Break Start Time</FormLabel>
                          <FormControl>
                            <TimePicker
                              value={field.value || ''}
                              onChange={(value) => field.onChange(value || undefined)}
                              placeholder="Select break start time"
                              error={!!form.formState.errors.break_start_time}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="break_end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Break End Time</FormLabel>
                          <FormControl>
                            <TimePicker
                              value={field.value || ''}
                              onChange={(value) => field.onChange(value || undefined)}
                              placeholder="Select break end time"
                              error={!!form.formState.errors.break_end_time}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    Additional Information
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter description..."
                            className="text-foreground"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_active"
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
                {form.formState.isSubmitting ? 'Saving...' : isEdit ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

