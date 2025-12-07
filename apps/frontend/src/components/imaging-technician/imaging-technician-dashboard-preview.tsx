"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, Activity, ArrowRight, Camera, Inbox } from "lucide-react";
import { ImagingOrder } from "@/interfaces/image-dicom/imaging-order.interface";
import { ImagingOrderStatus } from "@/enums/image-dicom.enum";
import { useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/lib/formatTimeDate";
import { Skeleton } from "@/components/ui/skeleton";

interface ImagingTechnicianDashboardPreviewProps {
  orders: ImagingOrder[];
  onViewOrders: () => void;
  onViewMachines: () => void;
  isLoading?: boolean;
}

export function ImagingTechnicianDashboardPreview({
  orders,
  onViewOrders,
  onViewMachines,
  isLoading = false,
}: ImagingTechnicianDashboardPreviewProps) {
  const router = useRouter();

  const getStatusColor = (status?: ImagingOrderStatus) => {
    switch (status) {
      case ImagingOrderStatus.COMPLETED:
        return "bg-green-100 text-green-800 border-green-200";
      case ImagingOrderStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case ImagingOrderStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case ImagingOrderStatus.CANCELLED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Imaging Orders */}
      <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center text-lg">
            <Image className="w-5 h-5 mr-2 text-primary" />
            Recent Imaging Orders
          </CardTitle>
          <CardDescription className="text-foreground">
            Latest imaging orders
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          <div className="space-y-2 flex-1">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 ml-2" />
                </div>
              ))
            ) : (
              orders?.slice(0, 5).map((order, index) => {
              const orderDate = order?.createdAt
                ? new Date(order.createdAt)
                : null;
              const formattedDate = orderDate
                ? formatDate(orderDate)
                : "Unknown date";
              const formattedTime = orderDate
                ? formatTime(orderDate)
                : "Unknown time";

              return (
                <div
                  onClick={() => {
                    router.push(`/imaging-technician/order-details/${order.id}`);
                  }}
                  key={order.id}
                  className="group flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/30 hover:shadow-sm"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 min-w-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <span className="text-sm font-semibold text-primary text-center leading-none">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">
                        {order?.patient?.lastName && order?.patient?.firstName
                          ? `${order.patient.lastName} ${order.patient.firstName}`
                          : order?.patient?.lastName
                          ? order.patient.lastName
                          : order?.patient?.firstName
                          ? order.patient.firstName
                          : order?.patient?.patientCode || order?.patientId || "Unknown Patient"}
                      </p>
                      <p className="text-xs text-foreground">
                        {order.orderNumber || order.id} • {formattedDate} • {formattedTime}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`shrink-0 ml-2 font-medium ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus
                      ? order.orderStatus
                          .charAt(0)
                          .toUpperCase() +
                        order.orderStatus.slice(1).toLowerCase().replace(/_/g, " ")
                      : "Unknown"}
                  </Badge>
                </div>
              );
            })
            )}
            {!isLoading && (!orders || orders.length === 0) && (
              <div className="flex flex-col items-center justify-center flex-1 py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                  <Inbox className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No recent imaging orders</p>
                <p className="text-xs text-slate-400 mt-1">No imaging orders found</p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={onViewOrders}
          >
            View All Orders
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center text-lg">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-foreground">
            Access frequently used features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onViewOrders}
            >
              <Image className="w-4 h-4" />
              View All Imaging Orders
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onViewMachines}
            >
              <Activity className="w-4 h-4" />
              Manage Modality Machines
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/imaging-technician/schedule")}
            >
              <Camera className="w-4 h-4" />
              View Schedule
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

