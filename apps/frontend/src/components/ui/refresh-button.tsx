'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  loading?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showText?: boolean;
}

export function RefreshButton({ 
  onRefresh, 
  loading = false, 
  className = '',
  size = 'sm',
  variant = 'default',
  showText = true
}: RefreshButtonProps) {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading && onRefresh) {
      await onRefresh();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground ${className}`}
      type="button"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {showText && (loading ? 'Refreshing...' : 'Refresh')}
    </Button>
  );
}
