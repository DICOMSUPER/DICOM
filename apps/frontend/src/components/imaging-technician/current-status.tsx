import React, { useMemo, forwardRef, useImperativeHandle } from "react";
import {
  useGetOrderStatsForRoomInDateQuery,
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

  const { data, isLoading, error, refetch } =
    useGetOrderStatsForRoomInDateQuery(dateParams);

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

  const stats = data?.data?.stats;

  const statsData = [
    {
      title: 'Total Orders',
      value: stats?.total || 0,
      description: 'All registered orders',
      icon: Users,
      isLoading,
    },
    {
      title: 'Waiting',
      value: stats?.waiting || 0,
      description: 'Currently in queue',
      icon: Clock,
      isLoading,
    },
    {
      title: 'In Progress',
      value: stats?.inProgress || 0,
      description: 'Being processed',
      icon: Activity,
      isLoading,
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      description: 'Finished orders',
      icon: CheckCircle,
      isLoading,
    },
    {
      title: 'Cancelled',
      value: stats?.cancelled || 0,
      description: 'Cancelled orders',
      icon: XCircle,
      isLoading,
    },
  ];

  return <StatsCards stats={statsData} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-5" />;
  }
);

CurrentStatus.displayName = 'CurrentStatus';

export default CurrentStatus;
