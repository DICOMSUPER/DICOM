import { ImagingOrderStatus } from "@/enums/image-dicom.enum";
import React, { useState } from "react";
import { ChevronDown, Eye, XCircle, CheckCircle, MoreHorizontal, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StatusButtonProps {
  status: ImagingOrderStatus;
  orderId: string;
  onCallIn?: (orderId: string) => void;
  onViewDetail?: (orderId: string) => void;
  onMarkCompleted?: (orderId: string) => void;
  onMarkCancelled?: (orderId: string) => void;
}

type ConfirmationType = "completed" | "cancelled" | null;

export default function StatusButton({
  status,
  orderId,
  onCallIn,
  onViewDetail,
  onMarkCompleted,
  onMarkCancelled,
}: StatusButtonProps) {
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>(null);

  const handleConfirmAction = () => {
    if (confirmationType === "completed") {
      onMarkCompleted?.(orderId);
    } else if (confirmationType === "cancelled") {
      onMarkCancelled?.(orderId);
    }
    setConfirmationType(null);
  };

  // Pending status - Call In button
  if (status === ImagingOrderStatus.PENDING) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
        onClick={() => onCallIn?.(orderId)}
      >
        Call In
      </Button>
    );
  }

  // In Progress status - dropdown with options
  if (status === ImagingOrderStatus.IN_PROGRESS) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-gray-700 hover:bg-gray-100 border-gray-300"
            >
              Actions
              <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => onViewDetail?.(orderId)}
              className="cursor-pointer"
            >
              <Eye className="h-4 w-4 text-gray-600" />
              View Detail
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => setConfirmationType("completed")}
              className="cursor-pointer text-green-700 focus:text-green-700 focus:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              Mark as Completed
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => setConfirmationType("cancelled")}
              className="cursor-pointer text-red-700 focus:text-red-700 focus:bg-red-50"
              variant="destructive"
            >
              <XCircle className="h-4 w-4 text-red-600" />
              Mark as Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Confirmation Dialog */}
        <AlertDialog open={confirmationType !== null} onOpenChange={(open) => !open && setConfirmationType(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-full ${confirmationType === "cancelled" ? "bg-red-100" : "bg-green-100"}`}>
                  {confirmationType === "cancelled" ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <AlertDialogTitle>
                  {confirmationType === "completed" 
                    ? "Mark Order as Completed?" 
                    : "Cancel this Order?"}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-left">
                {confirmationType === "completed" ? (
                  <>
                    This will mark the imaging order as <strong>completed</strong>. 
                    Make sure all required scans and studies have been uploaded before proceeding.
                  </>
                ) : (
                  <>
                    This will mark the imaging order as <strong>cancelled</strong>. 
                    This action may not be reversible. Are you sure you want to cancel this order?
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Go Back</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmAction}
                className={confirmationType === "cancelled" 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-green-600 hover:bg-green-700 text-white"}
              >
                {confirmationType === "completed" 
                  ? "Yes, Mark Completed" 
                  : "Yes, Cancel Order"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Completed or Cancelled status - no actions available
  if (
    status === ImagingOrderStatus.COMPLETED ||
    status === ImagingOrderStatus.CANCELLED
  ) {
    return (
      <span className="text-xs text-gray-500 italic px-2 py-1 bg-gray-50 rounded">
        No action available
      </span>
    );
  }

  return null;
}
