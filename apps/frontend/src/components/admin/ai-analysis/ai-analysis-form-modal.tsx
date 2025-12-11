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
import { AiAnalysis } from '@/interfaces/system/ai-analysis.interface';
import { Activity } from 'lucide-react';

interface AiAnalysisFormModalProps {
  aiAnalysis: AiAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const aiAnalysisFormSchema = z.object({
  studyId: z.string().min(1, 'Study ID is required'),
  findings: z.string().optional(),
  aiModelId: z.string().min(1, 'AI Model ID is required'),
});

type AiAnalysisFormValues = z.infer<typeof aiAnalysisFormSchema>;

export function AiAnalysisFormModal({
  aiAnalysis,
  isOpen,
  onClose,
  onSuccess,
}: AiAnalysisFormModalProps) {
  const isEdit = !!aiAnalysis;

  const form = useForm<AiAnalysisFormValues>({
    resolver: zodResolver(aiAnalysisFormSchema),
    defaultValues: {
      studyId: '',
      findings: '',
      aiModelId: '',
    },
  });

  useEffect(() => {
    if (aiAnalysis) {
      form.reset({
        studyId: aiAnalysis.studyId || '',

        aiModelId: aiAnalysis.aiModelId || '',
      });
    } else {
      form.reset({
        studyId: '',
        findings: '',
        aiModelId: '',
      });
    }
  }, [aiAnalysis, form]);

  const onSubmit = async (values: AiAnalysisFormValues) => {
    try {
      if (isEdit && aiAnalysis) {
        // Update logic here
        toast.success(`AI analysis updated successfully`);
      } else {
        // Create logic here
        toast.success(`AI analysis created successfully`);
      }
      form.reset();
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        `Failed to ${isEdit ? 'update' : 'create'} AI analysis`;
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {isEdit ? 'Edit AI Analysis' : 'Create New AI Analysis'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="studyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study ID *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter study ID"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aiModelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Model ID *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter AI model ID"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="findings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Findings</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter findings (optional)"
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
                  {isEdit ? 'Update' : 'Create'} AI Analysis
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

