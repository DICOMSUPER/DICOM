"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetServiceByIdQuery } from "@/store/serviceApi";
import { formatDate } from "@/lib/formatTimeDate";

interface ModalServiceDetailProps {
  open: boolean;
  onClose: () => void;
  serviceId: string;
}

export function ModalServiceDetail({
  open,
  onClose,
  serviceId,
}: ModalServiceDetailProps) {
  const { data, isLoading } = useGetServiceByIdQuery(serviceId, {
    skip: !serviceId || !open,
  });

  const service = data?.data;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Service Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : service ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Service Code</p>
                <p className="text-base font-semibold">{service.serviceCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                {service.isActive ? (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Service Name</p>
              <p className="text-base font-semibold">{service.serviceName}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-base">{service.description || "N/A"}</p>
            </div>

            {/* <div>
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="text-base font-semibold">
                {service.department?.departmentName || "N/A"}
              </p>
            </div> */}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-sm">{formatDate(service.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Updated At</p>
                <p className="text-sm">{formatDate(service.updatedAt)}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Service not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}