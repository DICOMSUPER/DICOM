"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { XCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const rejectFormSchema = z.object({
  rejectionReason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

type RejectFormValues = z.infer<typeof rejectFormSchema>;

interface ModalRejectReportProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (rejectionReason: string) => void;
  isLoading?: boolean;
}

export function ModalRejectReport({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: ModalRejectReportProps) {
  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      rejectionReason: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = (data: RejectFormValues) => {
    onConfirm(data.rejectionReason);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="sm:max-w-[500px]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Reject Diagnosis Report
          </DialogTitle>
          <DialogDescription>
           
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="rejectionReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rejection Reason *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please explain why this report is being rejected..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Reject Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
