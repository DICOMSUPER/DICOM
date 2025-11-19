'use client';

import { Card, CardContent } from '@/components/ui/card';
import { QueueStats } from '@/interfaces/patient/patient-visit.interface';
import { Calendar, CheckCircle, Clock, Hash } from 'lucide-react';

interface QueueStatsProps {
  stats: QueueStats;
}

export function QueueStatsCards({ stats }: QueueStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-blue-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Appointments</p>
              <p className="text-3xl font-bold">{stats.appointments}</p>
              <p className="text-blue-100 text-xs mt-1">Nov 23, 2022</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Served Tokens</p>
              <p className="text-3xl font-bold">{stats.totalServedTokens}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Remaining Tokens</p>
              <p className="text-3xl font-bold">{stats.remainingTokens}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-teal-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Current Serving Token Number</p>
              <p className="text-lg font-bold">{stats.currentServingToken}</p>
            </div>
            <Hash className="w-8 h-8 text-teal-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}