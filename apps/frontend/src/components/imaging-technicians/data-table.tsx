import { ImagingOrder } from "@/interfaces/image-dicom/imaging-order.interface";
import { useRouter } from "next/navigation";
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
  if (isLoading) {
    return <div className="flex-1 bg-white p-4">Loading...</div>;
  }

  if (error) {
    return <div className="flex-1 bg-white p-4">Error loading orders</div>;
  }

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
              </th>{" "}
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
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.orderNumber}
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
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.orderStatus}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.completedDate ? formatDate(row.completedDate) : "N/A"}
                  </td>
                  <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                    {row.notes || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-gray-600 text-xs">
                    <button
                      className="text-blue-500 cursor-pointer"
                      onClick={() => {}}
                    >
                      View
                    </button>
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
