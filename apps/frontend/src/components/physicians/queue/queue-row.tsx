'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  FileText,
  Edit,
  Copy,
  X,
  Phone,
  User,
  Clock,
} from 'lucide-react';
import { QueueStatus } from '@/enums/patient.enum';
import { QueueAssignment } from '@/interfaces/patient/queue.interface';

interface QueueRowProps {
  queueItem: QueueAssignment;
  index: number;
  onStartServing: (id: string) => void;
  onEdit: (id: string) => void;
  onCancel: (id: string) => void;
}

export function QueueRow({
  queueItem,
  index,
  onStartServing,
  onEdit,
  onCancel,
}: QueueRowProps) {
  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case QueueStatus.WAITING:
        return (
          <span className="text-blue-600 font-medium">Waiting</span>
        );
      case QueueStatus.COMPLETED:
        return (
          <span className="text-green-600 font-medium">Completed</span>
        );
    //   case QueueStatus.SERVING_ENDED:
    //     return (
    //       <span className="text-gray-600 font-medium">Serving ended</span>
    //     );
      default:
        return <span className="text-gray-700 font-medium">{status}</span>;
    }
  };

  const getStatusIcon = (status: QueueStatus) => {
    switch (status) {
      case QueueStatus.WAITING:
        return <div className="w-3 h-3 bg-blue-500 rounded-full" />;
      case QueueStatus.COMPLETED:
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
    //   case QueueStatus.SERVING_ENDED:
    //     return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const formatTime = (date?: Date) => {
    if (!date) return '—';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date?: Date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* STT */}
      <td className="px-6 py-4 text-center font-medium text-gray-900">
        {index + 1}
      </td>

      {/* Queue Number */}
      <td className="px-6 py-4 font-medium text-gray-900">
        {queueItem.queue_number}
      </td>

      {/* Patient Info */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-900">
              {queueItem.visit.patient.first_name}{' '}
              {queueItem.visit.patient.last_name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{queueItem.visit.patient.gender === 'Male' ? '♂' : '♀'}</span>
            <span>{queueItem.visit.patient.insurance_number} </span>
          </div>
        </div>
      </td>

      {/* Registration + Phone */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          {/* <span className="font-medium text-gray-900">
            {queueItem.visit.patient.phone}
          </span> */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-3 h-3" />
            <span>{queueItem.visit.patient.phone ?? '—'}</span>
          </div>
        </div>
      </td>

      {/* Assigned At */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <span className="font-medium text-gray-900">
            {formatDate(queueItem.assigned_at)}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{formatTime(queueItem.assigned_at)}</span>
          </div>
        </div>
      </td>

      {/* Visit Type */}
      <td className="px-6 py-4">
        <Badge variant="outline" className="bg-gray-50">
          {queueItem.visit.visit_type}
        </Badge>
      </td>

      {/* Status Icon */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">{getStatusIcon(queueItem.status)}</div>
      </td>

      {/* Status Badge */}
      <td className="px-6 py-4">{getStatusBadge(queueItem.status)}</td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {queueItem.status === QueueStatus.WAITING && (
            <Button
              variant="outline"
              size="sm"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
              onClick={() => onStartServing(queueItem.queue_id)}
            >
              Start Serving
            </Button>
          )}


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(queueItem.queue_id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCancel(queueItem.queue_id)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
