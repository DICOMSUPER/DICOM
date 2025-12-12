import React from 'react';
import { formatStatus } from './format-status';

export interface StatusBadgeConfig {
  label: string;
  colorClass: string;
  dotColorClass?: string;
  shouldAnimate?: boolean;
}

export type StatusValue = string | boolean | number | null | undefined;

export const getStatusBadge = (
  status: StatusValue,
  config: Record<string, StatusBadgeConfig> | ((status: StatusValue) => StatusBadgeConfig | undefined)
): React.ReactNode => {
  let configResult: StatusBadgeConfig | undefined;

  if (typeof config === 'function') {
    configResult = config(status);
  } else {
    const statusKey = String(status ?? '');
    configResult = config[statusKey] || config[statusKey.toLowerCase()] || config[statusKey.toUpperCase()];
  }

  if (!configResult) {
    return null;
  }

  return (
    <span className={`text-xs px-2 py-1 rounded inline-flex items-center gap-1.5 ${configResult.colorClass}`}>
      {configResult.dotColorClass && (
        <span className={`w-1.5 h-1.5 rounded-full ${configResult.dotColorClass} ${configResult.shouldAnimate ? 'animate-pulse' : ''}`} />
      )}
      {configResult.label}
    </span>
  );
};

export const getBooleanStatusBadge = (isActive: boolean): React.ReactNode => {
  return getStatusBadge(isActive, {
    'true': {
      label: 'Active',
      colorClass: 'bg-green-100 text-green-700',
      dotColorClass: 'bg-green-500',
      shouldAnimate: true,
    },
    'false': {
      label: 'Inactive',
      colorClass: 'bg-slate-100 text-slate-700',
      dotColorClass: 'bg-slate-400',
      shouldAnimate: false,
    },
  });
};

export const getRoomStatusBadge = (status: string): React.ReactNode => {
  const statusConfig: Record<string, StatusBadgeConfig> = {
    'AVAILABLE': {
      label: formatStatus('available'),
      colorClass: 'bg-green-100 text-green-700',
      dotColorClass: 'bg-green-500',
      shouldAnimate: true,
    },
    'OCCUPIED': {
      label: formatStatus('occupied'),
      colorClass: 'bg-red-100 text-red-700',
      dotColorClass: 'bg-red-500',
      shouldAnimate: false,
    },
    'MAINTENANCE': {
      label: formatStatus('maintenance'),
      colorClass: 'bg-yellow-100 text-yellow-700',
      dotColorClass: 'bg-yellow-500',
      shouldAnimate: true,
    },
    'RESERVED': {
      label: formatStatus('reserved'),
      colorClass: 'bg-blue-100 text-blue-700',
      dotColorClass: 'bg-blue-500',
      shouldAnimate: false,
    },
  };

  return getStatusBadge(status, statusConfig);
};

export const getPatientStatusBadge = (status: string): React.ReactNode => {
  const statusConfig: Record<string, StatusBadgeConfig> = {
    'Active': {
      label: 'Active',
      colorClass: 'bg-green-100 text-green-700',
    },
    'Scheduled': {
      label: 'Scheduled',
      colorClass: 'bg-blue-100 text-blue-700',
    },
    'Inactive': {
      label: 'Inactive',
      colorClass: 'bg-gray-100 text-gray-700',
    },
    'Pending': {
      label: 'Pending',
      colorClass: 'bg-yellow-100 text-yellow-700',
    },
    'Completed': {
      label: 'Completed',
      colorClass: 'bg-purple-100 text-purple-700',
    },
  };

  return getStatusBadge(status, statusConfig);
};

export const getSystemStatusBadge = (status: string): React.ReactNode => {
  const statusConfig: Record<string, StatusBadgeConfig> = {
    'online': {
      label: 'Online',
      colorClass: 'bg-green-100 text-green-700',
    },
    'warning': {
      label: 'Warning',
      colorClass: 'bg-yellow-100 text-yellow-700',
    },
    'offline': {
      label: 'Offline',
      colorClass: 'bg-red-100 text-red-700',
    },
  };

  return getStatusBadge(status, statusConfig);
};

export const getEncounterTypeBadge = (type: string): React.ReactNode => {
  const typeKey = String(type ?? '').toLowerCase().replace('_', '-');
  const statusConfig: Record<string, StatusBadgeConfig> = {
    'inpatient': {
      label: 'Inpatient',
      colorClass: 'bg-blue-100 text-blue-700',
    },
    'outpatient': {
      label: 'Outpatient',
      colorClass: 'bg-green-100 text-green-700',
    },
    'emergency': {
      label: 'Emergency',
      colorClass: 'bg-red-100 text-red-700',
    },
    'follow-up': {
      label: 'Follow Up',
      colorClass: 'bg-purple-100 text-purple-700',
    },
    'follow_up': {
      label: 'Follow Up',
      colorClass: 'bg-purple-100 text-purple-700',
    },
  };

  return getStatusBadge(typeKey, statusConfig);
};

export const getMachineStatusBadge = (status: string): React.ReactNode => {
  const statusConfig: Record<string, StatusBadgeConfig> = {
    'ACTIVE': {
      label: formatStatus('active'),
      colorClass: 'bg-green-100 text-green-700',
      dotColorClass: 'bg-green-500',
      shouldAnimate: true,
    },
    'INACTIVE': {
      label: formatStatus('inactive'),
      colorClass: 'bg-gray-100 text-gray-700',
      dotColorClass: 'bg-gray-400',
      shouldAnimate: false,
    },
    'MAINTENANCE': {
      label: formatStatus('maintenance'),
      colorClass: 'bg-yellow-100 text-yellow-700',
      dotColorClass: 'bg-yellow-500',
      shouldAnimate: true,
    },
  };

  return getStatusBadge(status, statusConfig);
};

export const getMachineStatusBadgeSimple = (status: string): React.ReactNode => {
  const statusMap: Record<string, { label: string; className: string }> = {
    'ACTIVE': { label: 'Active', className: 'bg-green-100 text-green-800' },
    'INACTIVE': { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
    'MAINTENANCE': { label: 'Maintenance', className: 'bg-yellow-100 text-yellow-800' },
  };

  const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
};

export const getEncounterStatusBadge = (status: string): React.ReactNode => {
  const statusConfig: Record<string, StatusBadgeConfig> = {
    'waiting': {
      label: formatStatus('waiting'),
      colorClass: 'bg-amber-100 text-amber-700',
      dotColorClass: 'bg-amber-500',
      shouldAnimate: true,
    },
    'arrived': {
      label: formatStatus('arrived'),
      colorClass: 'bg-blue-100 text-blue-700',
      dotColorClass: 'bg-blue-500',
      shouldAnimate: false,
    },
    'finished': {
      label: formatStatus('finished'),
      colorClass: 'bg-green-100 text-green-700',
      dotColorClass: 'bg-green-500',
      shouldAnimate: false,
    },
    'cancelled': {
      label: formatStatus('cancelled'),
      colorClass: 'bg-red-100 text-red-700',
      dotColorClass: 'bg-red-500',
      shouldAnimate: false,
    },
    'canceled': {
      label: formatStatus('cancelled'),
      colorClass: 'bg-red-100 text-red-700',
      dotColorClass: 'bg-red-500',
      shouldAnimate: false,
    },
    'in-progress': {
      label: formatStatus('in_progress'),
      colorClass: 'bg-blue-100 text-blue-700',
      dotColorClass: 'bg-blue-500',
      shouldAnimate: true,
    },
    'in_progress': {
      label: formatStatus('in_progress'),
      colorClass: 'bg-blue-100 text-blue-700',
      dotColorClass: 'bg-blue-500',
      shouldAnimate: true,
    },
    'completed': {
      label: formatStatus('completed'),
      colorClass: 'bg-emerald-100 text-emerald-700',
      dotColorClass: 'bg-emerald-500',
      shouldAnimate: false,
    },
    'scheduled': {
      label: formatStatus('scheduled'),
      colorClass: 'bg-purple-100 text-purple-700',
      dotColorClass: 'bg-purple-500',
      shouldAnimate: false,
    },
    'pending': {
      label: formatStatus('pending'),
      colorClass: 'bg-yellow-100 text-yellow-700',
      dotColorClass: 'bg-yellow-500',
      shouldAnimate: true,
    },
  };

  return getStatusBadge(status, statusConfig);
};

export const getEncounterPriorityBadge = (priority: string): React.ReactNode => {
  const priorityConfig: Record<string, StatusBadgeConfig> = {
    'stat': {
      label: formatStatus('stat'),
      colorClass: 'bg-red-100 text-red-700',
      dotColorClass: 'bg-red-500',
      shouldAnimate: true,
    },
    'urgent': {
      label: formatStatus('urgent'),
      colorClass: 'bg-orange-100 text-orange-700',
      dotColorClass: 'bg-orange-500',
      shouldAnimate: true,
    },
    'routine': {
      label: formatStatus('routine'),
      colorClass: 'bg-blue-100 text-blue-700',
      dotColorClass: 'bg-blue-500',
      shouldAnimate: false,
    },
  };

  return getStatusBadge(priority, priorityConfig);
};

