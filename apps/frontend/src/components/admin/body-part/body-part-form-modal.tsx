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
import { BodyPart } from '@/interfaces/imaging/body-part.interface';
import { useCreateBodyPartMutation, useUpdateBodyPartMutation } from '@/store/bodyPartApi';
import { Activity } from 'lucide-react';

interface BodyPartFormModalProps {
  bodyPart: BodyPart | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const bodyPartFormSchema = z.object({
  name: z.string().min(1, 'Body part name is required'),
  description: z.string().optional(),
});

type BodyPartFormValues = z.infer<typeof bodyPartFormSchema>;

export function BodyPartFormModal({
  bodyPart,
  isOpen,
  onClose,
  onSuccess,
}: BodyPartFormModalProps) {
  const isEdit = !!bodyPart;
  const [createBodyPart] = useCreateBodyPartMutation();
  const [updateBodyPart] = useUpdateBodyPartMutation();

  const form = useForm<BodyPartFormValues>({
    resolver: zodResolver(bodyPartFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (bodyPart) {
      form.reset({
        name: bodyPart.name || '',
        description: bodyPart.description || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
      });
    }
  }, [bodyPart, form]);

  const onSubmit = async (values: BodyPartFormValues) => {
    try {
      if (isEdit && bodyPart) {
        await updateBodyPart({
          id: bodyPart.id,
          data: values,
        }).unwrap();
        toast.success(`Body part ${values.name} updated successfully`);
      } else {
        await createBodyPart(values).unwrap();
        toast.success(`Body part ${values.name} created successfully`);
      }
      form.reset();
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        `Failed to ${isEdit ? 'update' : 'create'} body part`;
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[50vw] max-w-[700px] sm:max-w-[50vw] h-auto max-h-[85vh] flex flex-col border-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 shrink-0 px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Activity className="h-5 w-5" />
            {isEdit ? 'Edit Body Part' : 'Create New Body Part'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 min-h-0 h-full px-6">
              <div className="space-y-6 pr-4 py-6">
                <section className="rounded-2xl p-6 shadow border-border border space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Activity className="h-5 w-5" />
                    Basic Information
                  </div>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter body part name"
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
                            placeholder="Enter description (optional)"
                            rows={4}
                            className="text-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              </div>
            </ScrollArea>

            <DialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? 'Update' : 'Create'} Body Part
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

