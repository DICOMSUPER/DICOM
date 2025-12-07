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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetUserByIdQuery } from "@/store/userApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import * as z from "zod";
import SignatureDisplay from "@/components/common/signature-display";

const setUpFormSchema = z.object({
  pin: z.string().min(1, "PIN is required"),
});

type SetUpFormValues = z.infer<typeof setUpFormSchema>;
interface ModalApproveStudyProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (studyId: string, pin: string) => void;
  studyId: string;
  isLoading?: boolean;
}

export function ModalApproveStudy({
  open,
  onClose,
  onConfirm,
  studyId,
  isLoading = false,
}: ModalApproveStudyProps) {
  const [showPin, setShowPin] = useState(false);

  const userId = useSelector((state: RootState) => state.auth.user?.id) || null;

  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdQuery(
    userId!,
    { skip: !open }
  );
  const user = userData?.data;
  const form = useForm<SetUpFormValues>({
    resolver: zodResolver(setUpFormSchema),
    defaultValues: {
      pin: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setShowPin(false);
    }
  }, [open, form]);

  const handleSubmit = (data: SetUpFormValues) => {
    onConfirm(studyId, data.pin);
  };

  const handleClose = () => {
    form.reset();
    setShowPin(false);
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
            <CheckCircle className="w-5 h-5 text-green-600" />
            Approve Study
          </DialogTitle>
          <DialogDescription>
            Enter your pin to approve the study
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Signature
              </label>
              <div className="border-2 border-gray-300 rounded-md bg-gray-50 h-40 flex flex-col items-center justify-center">
                {isLoadingUserData ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
                ) : user ? (
                  <SignatureDisplay
                    firstName={user?.firstName}
                    lastName={user?.lastName}
                    role="Bác sĩ"
                  />
                ) : (
                  <p className="text-gray-400 text-sm">
                    No signature available
                  </p>
                )}
              </div>
            </div>
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPin ? "text" : "password"}
                        placeholder="Enter your pin to sign"
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPin ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
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
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Study
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
