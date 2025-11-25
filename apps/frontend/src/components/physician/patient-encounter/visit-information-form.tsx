import {
  visitInformationFormSchema,
  VisitInformationFormValues,
} from "@/lib/validation/visit-information-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
interface VisitInformationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<VisitInformationFormValues> | null;
  onSubmit?: (values: VisitInformationFormValues) => void;
  isLoading?: boolean;
  mode?: "create" | "update";
}

export function VisitInformationForm({
  open,
  onOpenChange,
  initialData = null,
  onSubmit,
  isLoading = false,
  mode = "create",
}: VisitInformationFormProps) {
  const form = useForm<VisitInformationFormValues>({
    resolver: zodResolver(visitInformationFormSchema),
    defaultValues: {
      chiefComplaint: "",
      symptoms: "",
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        chiefComplaint: initialData.chiefComplaint || "",
        symptoms: initialData.symptoms || "",
      });
    } else if (open) {
      // Reset form for create mode
      form.reset({
        chiefComplaint: "",
        symptoms: "",
      });
    }
  }, [initialData, open]);

  const handleFormSubmit = (values: VisitInformationFormValues) => {
    if (onSubmit) {
      onSubmit(values);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    form.reset({
      chiefComplaint: initialData?.chiefComplaint || "",
      symptoms: initialData?.symptoms || "",
    });
    onOpenChange(false);
  };

  const isUpdateMode = mode === "update";
  const title = isUpdateMode
    ? "Update Visit Information"
    : "Add Visit Information";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1  gap-4">
              {/* Chief Complaint */}
              <FormField
                control={form.control}
                name="chiefComplaint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chief Complaint</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter chief complaint"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Symptoms */}
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter symptoms"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        rows={3}

                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isUpdateMode ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
