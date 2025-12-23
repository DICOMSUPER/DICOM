import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImagingOrderStatus } from "@/common/enums/image-dicom.enum";
import type { ImagingOrder } from "@/common/interfaces/image-dicom/imaging-order.interface";
import { formatDate, formatTime } from "@/common/lib/formatTimeDate";
import {
  Beaker,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type React from "react";
import ModalCancel from "./modal-cancel";
import { useState } from "react";
import { useUpdateImagingOrderMutation } from "@/store/imagingOrderApi";
import { toast } from "sonner";
import { FileX } from "lucide-react";

interface ImagingOrderItemProps {
  order: ImagingOrder;
  onViewReport?: (id: string) => void;
  isLoading?: boolean;
}

const ImagingOrderItem = ({ order, onViewReport }: ImagingOrderItemProps) => {
  const [open, setIsOpen] = useState(false);
  const [updateImagingOrder, { isLoading }] = useUpdateImagingOrderMutation();
  const onCancel = async () => {
    try {
      await updateImagingOrder({
        id: order.id,
        body: { orderStatus: ImagingOrderStatus.CANCELLED },
      }).unwrap();

      setIsOpen(false);
      toast.success("Imaging order cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel imaging order");
      console.error("Cancel error:", error);
    }
  };
  const onClose = () => {
    setIsOpen(false);
  };
  const onOpen = () => {
    setIsOpen(true);
  };
  const getOrderStatusBadge = (status: ImagingOrderStatus) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactNode; label: string }
    > = {
      [ImagingOrderStatus.PENDING]: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Pending",
        icon: <AlertCircle className="w-3.5 h-3.5" />,
      },
      [ImagingOrderStatus.COMPLETED]: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Completed",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      },
      [ImagingOrderStatus.CANCELLED]: {
        color: "bg-red-50 text-red-700 border-red-200",
        label: "Cancelled",
        icon: <AlertCircle className="w-3.5 h-3.5" />,
      },
      [ImagingOrderStatus.IN_PROGRESS]: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        label: "In Progress",
        icon: <Clock className="w-3.5 h-3.5" />,
      },
    };

    const config = statusConfig[status] || {
      color: "bg-slate-50 text-slate-700 border-slate-200",
      label: status,
      icon: null,
    };

    return (
      <Badge
        className={`${config.color} px-3 py-1.5 text-xs font-semibold border flex items-center gap-1.5 w-fit`}
      >
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="group relative bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-slate-900 mb-2 truncate">
            {order.procedure?.name || "Unknown Procedure"}
          </h4>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Badge className="bg-slate-100 text-slate-800 border-slate-200 px-3 py-1.5 text-xs font-medium">
              <span className="font-medium">
                Order Number: #{order.orderNumber}
              </span>
            </Badge>
          </div>
          <div className="flex-shrink-0">
            {getOrderStatusBadge(order.orderStatus as ImagingOrderStatus)}
          </div>
          {/* Cancel button */}
        </div>
      </div>
      <Separator className="mb-4" />

      <div className="mb-4 pb-4 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Clinical Indication
        </p>
        {order.clinicalIndication ? (
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {order.clinicalIndication}
          </p>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <div className="p-2 bg-slate-100 rounded-lg">
              <FileX className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400 italic">No clinical indication provided</p>
          </div>
        )}
      </div>
      <div className="mb-4 pb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Special Instructions
        </p>
        {order.specialInstructions ? (
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {order.specialInstructions}
          </p>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <div className="p-2 bg-slate-100 rounded-lg">
              <FileX className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400 italic">No special instructions provided</p>
          </div>
        )}
      </div>

      {/* <div className="bg-indigo-50 rounded-lg p-4 mb-4 border border-indigo-100">
        <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wide mb-2">
          Special Instructions
        </p>
        <p className="text-sm text-indigo-800 leading-relaxed whitespace-pre-wrap">
          {order.specialInstructions || "No special instructions provided."}
        </p>
      </div> */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Created {formatDate(order.createdAt)}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{formatTime(order.createdAt)}</span>
        </div>
        <div className="flex items-center gap-3">
          {order.orderStatus === ImagingOrderStatus.PENDING && (
            <Button
              onClick={onOpen}
              className="text-sm bg-red-400 text-white hover:underline"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>
      <ModalCancel
        isOpen={open}
        onConfirm={onCancel}
        isLoading={isLoading}
        onClose={onClose}
      />
    </div>
  );
};

export default ImagingOrderItem;
