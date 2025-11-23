import React from 'react';

export interface StatusBadgeConfig {
  label: string;
  colorClass: string;
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
    <span className={`text-xs px-2 py-1 rounded ${configResult.colorClass}`}>
      {configResult.label}
    </span>
  );
};

export const getBooleanStatusBadge = (isActive: boolean): React.ReactNode => {
  return getStatusBadge(isActive, {
    'true': {
      label: 'Active',
      colorClass: 'bg-green-100 text-green-700',
    },
    'false': {
      label: 'Inactive',
      colorClass: 'bg-red-100 text-red-700',
    },
  });
};

export const getRoomStatusBadge = (status: string): React.ReactNode => {
  const statusConfig: Record<string, StatusBadgeConfig> = {
    'AVAILABLE': {
      label: 'Available',
      colorClass: 'bg-green-100 text-green-700',
    },
    'OCCUPIED': {
      label: 'Occupied',
      colorClass: 'bg-red-100 text-red-700',
    },
    'MAINTENANCE': {
      label: 'Maintenance',
      colorClass: 'bg-yellow-100 text-yellow-700',
    },
    'RESERVED': {
      label: 'Reserved',
      colorClass: 'bg-blue-100 text-blue-700',
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

