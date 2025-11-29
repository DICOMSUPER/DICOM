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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {isEdit ? 'Edit Body Part' : 'Create New Body Part'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter body part name"
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description (optional)"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEdit ? 'Update' : 'Create'} Body Part
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

