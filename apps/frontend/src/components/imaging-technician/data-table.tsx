import { DicomStudyStatus, ImagingOrderStatus } from "@/enums/image-dicom.enum";
import { ImagingOrder } from "@/interfaces/image-dicom/imaging-order.interface";
import { useRouter } from "next/navigation";
import StatusButton from "./status-button";
import { useUpdateImagingOrderMutation } from "@/store/imagingOrderApi";
import { toast } from "sonner";
import OrderStatus from "./order-status";
import { useUpdateDicomStudyMutation } from "@/store/dicomStudyApi";

// Helper function to format date (e.g., "2025-09-19T07:38:34.275Z" to "9/19/25")
const formatDate = (date: string | Date): string => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}/${d
    .getFullYear()
    .toString()
    .slice(2)}`;
};

// Helper function to format time (e.g., "2025-09-19T07:38:34.275Z" to "07:38")
const formatTime = (date: string): string => {
  const d = new Date(date);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

export const formatOrderNumber = (
  n: string | number | null | undefined,
  pad = 0
) => {
  const s = String(n ?? "");
  return `ORD${pad ? s.padStart(pad, "0") : s}`;
};

export const formatDateShort = (iso: string | Date | null | undefined) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function DataTable({
  orders,
  isLoading,
  error,
  refetch,
}: {
  orders: ImagingOrder[];
  isLoading: boolean;
  error: boolean | Error;
  refetch: () => void;
}) {
  const tableData = orders || [];
  const router = useRouter();
  const [updateImagingOrder] = useUpdateImagingOrderMutation();
  const [updateDicomStudy] = useUpdateDicomStudyMutation();
  if (isLoading) {
    return <div className="flex-1 bg-white p-4">Loading...</div>;
  }

  if (error) {
    return <div className="flex-1 bg-white p-4">Error loading orders</div>;
  }

  const changImagingOrderStatus = async (
    id: string,
    status: ImagingOrderStatus
  ) => {
    try {
      await updateImagingOrder({ id, body: { orderStatus: status } }).unwrap();
      toast.success("Order status updated successfully");
      // Force refetch after successful update
      if (typeof refetch === "function") {
        await refetch();
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to process order");
    }
  };

  const OnCallIn = async (id: string) => {
    await changImagingOrderStatus(id, ImagingOrderStatus.IN_PROGRESS);
  };

  const OnViewDetail = async (id: string) => {
    router.push(`/imaging-technician/order-details/${id}`);
  };

  const onMarkCompleted = async (id: string) => {
    await changImagingOrderStatus(id, ImagingOrderStatus.COMPLETED);
  };

  const onMarkCancelled = async (id: string) => {
    await changImagingOrderStatus(id, ImagingOrderStatus.CANCELLED);
  };

  return (
    <div className="flex-1 bg-white">
      <div className="w-full overflow-x-scroll horizontal-scrollbar">
        <table className="min-w-[1200px] w-full border-collapse text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                No.
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Order Number
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                MRN
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Patient Last Name
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Patient First Name
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Physician
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Body Part
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Modality
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Procedure
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Clinical Indication
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Contrast
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Special Instructions
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Order Status
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Completed Date
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Notes
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          {tableData && tableData.length > 0 ? (
            <tbody>
              {tableData.map((row: ImagingOrder, idx: number) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700 align-top">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {formatOrderNumber(row.orderNumber, 4)}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        ({String(formatDateShort(row.createdAt))})
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.patient?.patientCode}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.patient?.lastName}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700 font-medium">
                    {row.patient?.firstName}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {"Dr. " +
                      row.orderPhysician?.lastName +
                      " " +
                      row.orderPhysician?.firstName}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.procedure?.bodyPart?.name}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.procedure?.modality?.modalityName || "N/A"}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.procedure?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.clinicalIndication || "N/A"}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.contrastRequired ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.specialInstructions || "N/A"}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700 text-center">
                    <OrderStatus
                      status={row.orderStatus as ImagingOrderStatus}
                    />
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.completedDate ? formatDate(row.completedDate) : "N/A"}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.notes || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-gray-600 text-xs">
                    {row.orderStatus && (
                      <StatusButton
                        status={row?.orderStatus}
                        orderId={row.id}
                        onCallIn={OnCallIn}
                        onMarkCancelled={onMarkCancelled}
                        onMarkCompleted={onMarkCompleted}
                        onViewDetail={OnViewDetail}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tr>
              <td colSpan={14} className="px-4 py-8 text-center text-gray-500">
                No imaging orders found
              </td>
            </tr>
          )}
        </table>
      </div>
    </div>
  );
}
