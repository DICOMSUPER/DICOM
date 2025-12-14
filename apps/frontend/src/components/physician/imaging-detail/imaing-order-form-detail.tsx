"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImagingOrderStatus } from "@/common/enums/image-dicom.enum";
import {
  type IImagingOrderForm,
  OrderFormStatus,
} from "@/common/interfaces/image-dicom/imaging-order-form.interface";
import { formatDate, formatTime } from "@/common/lib/formatTimeDate";
import { useGetPatientByIdQuery } from "@/store/patientApi";
import { useGetRoomByIdQuery } from "@/store/roomsApi";
import {
  Calendar,
  Clock,
  Copy,
  FileText,
  Mail,
  Phone,
  RefreshCw,
  StickyNote,
  User,
  Beaker,
  AlertCircle,
  Disc,
  BookType,
} from "lucide-react";
import { toast } from "sonner";
import ImagingOrderItem from "./imaging-order-item";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useUpdateImagingOrderMutation } from "@/store/imagingOrderApi";
import { useState } from "react";

interface ImagingOrderFormDetailProps {
  imagingOrderForm: IImagingOrderForm;
  isLoadingOrderForm: boolean;
}

const ImagingOrderFormDetail = ({
  imagingOrderForm,
  isLoadingOrderForm,
}: ImagingOrderFormDetailProps) => {

  const [isOpen, setIsOpen] = useState(false);
  const getStatusBadge = (status: OrderFormStatus) => {
    const statusConfig = {
      [OrderFormStatus.IN_PROGRESS]: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      [OrderFormStatus.COMPLETED]: {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Completed",
      },
      [OrderFormStatus.CANCELLED]: {
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Cancelled",
      },
    };

    const config = statusConfig[status];
    return (
      <Badge className={`${config.color} px-3 py-1 text-sm font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const { data: patientData } = useGetPatientByIdQuery(
    imagingOrderForm?.patientId,
    {
      skip: !imagingOrderForm?.patientId,
    }
  );

  // get room by id
  const { data: roomData } = useGetRoomByIdQuery(
    imagingOrderForm?.roomId as string,
    {
      skip: !imagingOrderForm?.roomId,
    }
  );




  const onViewDiagnosticReport = (reportId: string) => {
    // Handle view diagnostic report action
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div>
      <div className="w-full ">
        <div className="mb-6">
          <div className="text-4xl font-bold text-gray-900">
            Imaging Order Form Details
          </div>

        </div>

        {!imagingOrderForm ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No imaging order form data available
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Patient Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <BookType className="w-5 h-5 mr-2" />
                  Information
                </h3>
                <div className="flex items-center gap-3">
                  {/* badge room */}
                  {roomData && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-200">
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Room: {roomData.data.room.roomCode}
                      </span>
                    </div>
                  )}
                  {/* {getStatusBadge(imagingOrderForm.orderFormStatus)} */}
                </div>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-1">
                    <User className="w-4 h-4 " />
                    Full Name
                  </label>
                  <p className="text-gray-900 font-normal">
                    {patientData?.data.firstName} {patientData?.data.lastName}
                  </p>
                </div>

                {/* Patient Code */}
                <div>
                  <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-1">
                    <Mail className="w-4 h-4 " />
                    Patient Code:
                  </label>
                  <p className="text-gray-900 font-normal">
                    {patientData?.data.patientCode}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-1">
                    <Phone className="w-4 h-4 " />
                    Phone
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-normal">
                      {patientData?.data.phoneNumber}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(patientData?.data.phoneNumber as string)
                      }
                      className="p-1 h-6 hover:bg-indigo-50"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-1">
                    <Disc className="w-4 h-4 " />
                    Diagnosis
                  </label>
                  <p className="text-gray-900 font-normal">
                    {imagingOrderForm?.diagnosis || "N/A"}
                  </p>
                </div>
                {/* Notes */}
                <div className="col-span-2">
                  <label className="flex items-center  gap-2 text-base font-semibold text-gray-700 mb-1">
                    <FileText className="w-4 h-4" />
                    Notes
                  </label>
                  <Textarea
                    disabled
                    value={imagingOrderForm?.notes || ""}
                    className="text-gray-900 bg-white border-gray-200 resize-none focus:ring-0 disabled:opacity-100 disabled:bg-white"
                    rows={5}
                  />
                </div>
              </div>
            </div>
            {/* Notes */}

            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <StickyNote className="w-5 h-5 mr-2" />
                  Imaging Orders ({imagingOrderForm?.imagingOrders?.length})
                </h3>
              </div>

              {isLoadingOrderForm ? (
                <div className="text-center py-6">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-500">Loading orders...</p>
                </div>
              ) : imagingOrderForm?.imagingOrders?.length === 0 ? (
                <div className="text-center py-6">
                  <StickyNote className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 mb-2">
                    No imaging orders found for this form
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {imagingOrderForm?.imagingOrders?.map((order) => (
                    <ImagingOrderItem key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagingOrderFormDetail;
