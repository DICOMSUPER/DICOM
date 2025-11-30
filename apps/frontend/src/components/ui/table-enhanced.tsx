import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

interface TableEnhancedProps {
  children: React.ReactNode;
  className?: string;
}

export function TableEnhanced({ children, className = '' }: TableEnhancedProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <Table>
        {children}
      </Table>
    </div>
  );
}

interface TableHeaderEnhancedProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeaderEnhanced({ children, className = '' }: TableHeaderEnhancedProps) {
  return (
    <TableHeader className={className}>
      {children}
    </TableHeader>
  );
}

interface TableRowEnhancedProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function TableRowEnhanced({ children, className = '', isHeader = false, onMouseEnter, onMouseLeave }: TableRowEnhancedProps) {
  const baseClasses = isHeader 
    ? 'border-b border-border bg-muted/50' 
    : 'border-b border-border hover:bg-muted/40 active:bg-muted/50 focus:bg-muted/50 transition-colors duration-150';
  
  return (
    <TableRow className={`${baseClasses} ${className}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </TableRow>
  );
}

interface TableHeadEnhancedProps {
  children: React.ReactNode;
  className?: string;
  isLast?: boolean;
}

export function TableHeadEnhanced({ children, className = '', isLast = false }: TableHeadEnhancedProps) {
  const borderClass = isLast ? '' : 'border-r border-border';
  
  return (
    <TableHead className={`${borderClass} px-4 py-3 font-semibold ${className}`}>
      {children}
    </TableHead>
  );
}

interface TableCellEnhancedProps {
  children: React.ReactNode;
  className?: string;
  isLast?: boolean;
}

export function TableCellEnhanced({ children, className = '', isLast = false }: TableCellEnhancedProps) {
  const borderClass = isLast ? '' : 'border-r border-border';
  
  return (
    <TableCell className={`${borderClass} px-4 py-3 ${className}`}>
      {children}
    </TableCell>
  );
}

export function TableBodyEnhanced({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <TableBody className={className}>
      {children}
    </TableBody>
  );
}
