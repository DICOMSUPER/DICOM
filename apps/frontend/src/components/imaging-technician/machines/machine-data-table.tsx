import { MachineStatus } from "@/enums/machine-status.enum";
import { ModalityMachine } from "@/interfaces/image-dicom/modality-machine.interface";
import { useEffect, useState } from "react";
// Helper function to format date
const formatDateShort = (iso?: string | Date): string => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return typeof iso === "string" ? iso : iso.toISOString();
  }
};

export default function MachineDataTable({
  machines,
  isLoading,
  error,
  onUpdateStatus,
}: {
  machines: ModalityMachine[];
  isLoading?: boolean;
  error?: unknown;
  onUpdateStatus: (id: string, status: MachineStatus) => void;
}) {
  const [tableData, setTableData] = useState<ModalityMachine[]>(machines ?? []);
  const [pendingStatus, setPendingStatus] = useState<
    Record<string, MachineStatus>
  >({});

  useEffect(() => {
    setTableData(machines ?? []);
  }, [machines]);

  if (isLoading) {
    return <div className="flex-1 bg-white p-4">Loading...</div>;
  }

  if (error) {
    return <div className="flex-1 bg-white p-4">Error loading machines</div>;
  }

  const machineStatusArray = Object.values(MachineStatus);
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
                Machine Name
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Modality
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Manufacturer
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Model
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Serial Number
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Status
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Created Date
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Last Updated
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          {tableData && tableData.length > 0 ? (
            <tbody>
              {tableData.map((row, idx) => {
                const currentStatus = pendingStatus[row.id] ?? row.status;
                const hasPendingChange = currentStatus !== row.status;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200 text-gray-700 font-medium">
                      {row.name}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {row.modality?.modalityCode || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {row.modality?.modalityName || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                      {row.manufacturer || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                      {row.model || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200 text-gray-700 font-mono text-xs">
                      {row.serialNumber || "N/A"}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200 text-center flex">
                      <select
                        name="status"
                        value={currentStatus}
                        onChange={(e) => {
                          const nextStatus = e.target.value as MachineStatus;
                          setPendingStatus((prev) => {
                            if (nextStatus === row.status) {
                              const updated = { ...prev };
                              delete updated[row.id];
                              return updated;
                            }
                            return {
                              ...prev,
                              [row.id]: nextStatus,
                            };
                          });
                        }}
                      >
                        {machineStatusArray.map((status) => (
                          <option value={status} key={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200 text-gray-700 text-xs">
                      {formatDateShort(row.createdAt)}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200 text-gray-700 text-xs">
                      {formatDateShort(row.updatedAt)}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200 text-gray-700 text-xs">
                      <button
                        disabled={!hasPendingChange}
                        onClick={() => {
                          const nextStatus = pendingStatus[row.id];
                          if (!nextStatus) return;
                          setTableData((prev) =>
                            prev.map((machine) =>
                              machine.id === row.id
                                ? { ...machine, status: nextStatus }
                                : machine
                            )
                          );
                          onUpdateStatus(row.id, nextStatus);
                          setPendingStatus((prev) => {
                            const updated = { ...prev };
                            delete updated[row.id];
                            return updated;
                          });
                        }}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          hasPendingChange
                            ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No machines found
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
