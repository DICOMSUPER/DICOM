import React, { useMemo } from "react";
import {
  useGetOrderStatsForRoomInDateQuery,
  useGetOrderStatsForRoomQuery,
} from "@/store/imagingOrderApi";
import { Clock, Activity, CheckCircle, XCircle, Users } from "lucide-react";

export default function CurrentStatus({
  roomId,
  startDate,
  endDate,
}: {
  roomId: string;
  startDate?: Date | string;
  endDate?: Date | string;
}) {
  const dateParams = useMemo(() => {
    const today = new Date();
    return {
      id: roomId,
      startDate: startDate || today.toISOString(),
      endDate: endDate || today.toISOString(),
    };
  }, [roomId, startDate, endDate]);

  const { data, isLoading, error } =
    useGetOrderStatsForRoomInDateQuery(dateParams);

  if (isLoading) {
    return (
      <div className="bg-white border-b border-gray-300 p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-b border-red-300 p-4">
        <p className="text-red-600 text-sm">Failed to load room statistics</p>
      </div>
    );
  }

  const stats = data?.data?.stats;
  const currentInProgress = data?.data?.currentInProgress;

  // Get the next waiting order by sorting by date (createdAt) first, then by orderNumber
  // const getNextWaitingOrder = () => {
  //   if (!data?.data?.maxWaiting?.entity) return null;

  //   // For now, we'll use the maxWaiting data provided by the API
  //   // In a real scenario, you might want to fetch all waiting orders and sort them
  //   return data.data.maxWaiting;
  // };

  // const nextWaiting = getNextWaitingOrder();

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Calculate progress percentages
  const total = stats?.total || 0;
  const completed = stats?.completed || 0;
  const cancelled = stats?.cancelled || 0;
  const inProgress = stats?.inProgress || 0;
  const waiting = stats?.waiting || 0;

  const completedPercent = total > 0 ? (completed / total) * 100 : 0;
  const cancelledPercent = total > 0 ? (cancelled / total) * 100 : 0;
  const inProgressPercent = total > 0 ? (inProgress / total) * 100 : 0;
  const waitingPercent = total > 0 ? (waiting / total) * 100 : 0;

  return (
    <div className="bg-white border-b border-gray-300">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">
          Room Status Overview
        </h3>
        <p className="text-xs text-gray-500 mt-1">Current Room: {roomId}</p>
      </div>

      {/* Stats Grid - Minimalist Design */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Total Orders */}
          <div className="bg-white border border-gray-300 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.total || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Orders</div>
          </div>

          {/* Waiting */}
          <div className="bg-white border border-gray-300 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Waiting</span>
            </div>
            <div className="text-2xl font-bold text-gray-700">
              {stats?.waiting || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Pending</div>
          </div>

          {/* In Progress */}
          <div className="bg-white border border-gray-300 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">
                In progress
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-700">
              {stats?.inProgress || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">In Progress</div>
          </div>

          {/* Completed */}
          <div className="bg-white border border-gray-300 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Done</span>
            </div>
            <div className="text-2xl font-bold text-gray-700">
              {stats?.completed || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>

          {/* Cancelled */}
          <div className="bg-white border border-gray-300 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">
                Cancelled
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-700">
              {stats?.cancelled || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Orders</div>
          </div>
        </div>

        {/* Progress Bar Section */}
        {stats && total > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">
                Overall Progress
              </span>
              <span className="text-xs text-gray-600">
                {completed + cancelled} of {total} processed (
                {(((completed + cancelled) / total) * 100).toFixed(1)}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full flex">
                {/* Completed - Green */}
                {completedPercent > 0 && (
                  <div
                    className="bg-green-500 h-full transition-all duration-300"
                    style={{ width: `${completedPercent}%` }}
                    title={`Completed: ${completed} (${completedPercent.toFixed(
                      1
                    )}%)`}
                  />
                )}
                {/* In Progress - Blue */}
                {inProgressPercent > 0 && (
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${inProgressPercent}%` }}
                    title={`In Progress: ${inProgress} (${inProgressPercent.toFixed(
                      1
                    )}%)`}
                  />
                )}
                {/* Cancelled - Red */}
                {cancelledPercent > 0 && (
                  <div
                    className="bg-red-400 h-full transition-all duration-300"
                    style={{ width: `${cancelledPercent}%` }}
                    title={`Cancelled: ${cancelled} (${cancelledPercent.toFixed(
                      1
                    )}%)`}
                  />
                )}
                {/* Waiting - remains as gray background */}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span>Completed ({completed})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                <span>In progress ({inProgress})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                <span>Cancelled ({cancelled})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                <span>Waiting ({waiting})</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
