import React, { useMemo, forwardRef, useImperativeHandle } from "react";
import {
  useGetOrderStatsForRoomInDateQuery,
  useGetOrderStatsForRoomQuery,
} from "@/store/imagingOrderApi";
import { Clock, Activity, CheckCircle, XCircle, Users } from "lucide-react";
import { StatsCards } from "@/components/ui/stats-cards";

interface CurrentStatusProps {
  roomId: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface CurrentStatusRef {
  refetch: () => void;
}

const CurrentStatus = forwardRef<CurrentStatusRef, CurrentStatusProps>(
  ({ roomId, startDate, endDate }, ref) => {
    const dateParams = useMemo(() => {
      const today = new Date();
      return {
        id: roomId,
        startDate: startDate || today.toISOString(),
        endDate: endDate || today.toISOString(),
      };
    }, [roomId, startDate, endDate]);

  const {
    data: todayData,
    isLoading: isLoadingToday,
    error,
    refetch,
  } = useGetOrderStatsForRoomInDateQuery(dateParams);
  const { data: allTimeData, isLoading: isLoadingAllTime } =
    useGetOrderStatsForRoomQuery(roomId);

    useImperativeHandle(ref, () => ({
      refetch,
    }));

  if (error) {
    return (
      <div className="bg-red-50 border-b border-red-300 p-4">
        <p className="text-red-600 text-sm">Failed to load room statistics</p>
      </div>
    );
  }

  const todayStats = todayData?.data?.stats;
  const allTimeStats = allTimeData?.data?.stats;

  const statsToday = [
    {
      title: 'Today\'s Orders',
      value: todayStats?.total || 0,
      description: 'Today\'s registered orders',
      icon: Users,
      isLoading: isLoadingToday,
    },
    {
      title: 'Waiting',
      value: todayStats?.waiting || 0,
      description: 'Currently in queue',
      icon: Clock,
      isLoading: isLoadingToday,
    },
    {
      title: 'In Progress',
      value: todayStats?.inProgress || 0,
      description: 'Being processed',
      icon: Activity,
      isLoading: isLoadingToday,
    },
    {
      title: 'Completed',
      value: todayStats?.completed || 0,
      description: 'Finished orders',
      icon: CheckCircle,
      isLoading: isLoadingToday,
    },
    {
      title: 'Cancelled',
      value: todayStats?.cancelled || 0,
      description: 'Cancelled orders',
      icon: XCircle,
      isLoading: isLoadingToday,
    },
  ];

  const statsAllTime = [
    {
      title: 'Total Orders',
      value: allTimeStats?.total || 0,
      description: 'All registered orders',
      icon: Users,
      isLoading: isLoadingAllTime,
    },
    {
      title: 'Waiting',
      value: allTimeStats?.waiting || 0,
      description: 'All-time waiting',
      icon: Clock,
      isLoading: isLoadingAllTime,
    },
    {
      title: 'In Progress',
      value: allTimeStats?.inProgress || 0,
      description: 'All-time in progress',
      icon: Activity,
      isLoading: isLoadingAllTime,
    },
    {
      title: 'Completed',
      value: allTimeStats?.completed || 0,
      description: 'All-time finished orders',
      icon: CheckCircle,
      isLoading: isLoadingAllTime,
    },
    {
      title: 'Cancelled',
      value: allTimeStats?.cancelled || 0,
      description: 'All-time cancelled orders',
      icon: XCircle,
      isLoading: isLoadingAllTime,
    },
  ];

  return (
    <div className="space-y-4">
      <StatsCards
        stats={statsToday}
        className="grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
      />
      <StatsCards
        stats={statsAllTime}
        className="grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
      />
    </div>
  );
  }
);

CurrentStatus.displayName = 'CurrentStatus';

export default CurrentStatus;
