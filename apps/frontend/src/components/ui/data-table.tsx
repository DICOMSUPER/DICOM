"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import {
  TableEnhanced,
  TableHeaderEnhanced,
  TableRowEnhanced,
  TableHeadEnhanced,
  TableCellEnhanced,
  TableBodyEnhanced,
} from "@/components/ui/table-enhanced";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";

export type SortDirection = "asc" | "desc" | null;

export interface SortConfig {
  field?: string;
  direction?: SortDirection;
}

export interface DataTableColumn<T> {
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortField?: string;
}

interface DataTableProps<T> {
  columns?: DataTableColumn<T>[];
  data?: T[];
  children?: ReactNode;
  headers?: string[];
  isLoading: boolean;
  emptyStateIcon: ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  className?: string;
  skeletonRows?: number;
  skeletonColumns?: number;
  rowClassName?: (row: T, index: number) => string | undefined;
  rowKey?: (row: T, index: number) => React.Key;
  isEmpty?: boolean;
  showNumberColumn?: boolean;
  page?: number;
  limit?: number;
  onSort?: (sortConfig: SortConfig) => void;
  initialSort?: SortConfig;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  children,
  headers,
  isLoading,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  className = "",
  skeletonRows = 5,
  skeletonColumns = 4,
  rowClassName,
  rowKey,
  isEmpty,
  showNumberColumn = true,
  page = 1,
  limit = 10,
  onSort,
  initialSort,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    initialSort || {}
  );
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialSort) {
      setSortConfig(initialSort);
    }
  }, [initialSort]);
  
  const useColumns = Array.isArray(columns) && Array.isArray(data);
  const resolvedColumnCount = useColumns ? (columns!.length + (showNumberColumn ? 1 : 0)) : (headers ? headers.length + (showNumberColumn ? 1 : 0) : skeletonColumns);
  const resolvedRows = useColumns ? data || [] : [];
  const showEmptyState = !isLoading && (useColumns ? resolvedRows.length === 0 : Boolean(isEmpty));

  const handleSort = (column: DataTableColumn<T>, index: number, event?: React.MouseEvent) => {
    if (!column.sortable) return;
    
    if (!onSort) {
      console.warn('onSort callback not provided. Sorting will not trigger API call.');
      return;
    }

    const sortField = column.sortField || `column_${index}`;
    
    let newDirection: SortDirection = "asc";
    
    if (sortConfig.field === sortField) {
      if (sortConfig.direction === "asc") {
        newDirection = "desc";
      } else if (sortConfig.direction === "desc") {
        newDirection = null;
      }
    }

    const newSortConfig: SortConfig = newDirection 
      ? { field: sortField, direction: newDirection }
      : {};
    
    setSortConfig(newSortConfig);
    onSort(newSortConfig);
  };

  const getSortIcon = (column: DataTableColumn<T>, index: number) => {
    if (!column.sortable) return null;

    const sortField = column.sortField || `column_${index}`;
    
    if (sortConfig.field !== sortField) {
      return <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-foreground" />;
    }

    if (sortConfig.direction === "asc") {
      return <ArrowUp className="ml-2 h-3.5 w-3.5 text-foreground" />;
    }

    if (sortConfig.direction === "desc") {
      return <ArrowDown className="ml-2 h-3.5 w-3.5 text-foreground" />;
    }

    return <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-foreground" />;
  };

  return (
    <Card className={`border-border p-0 ${className}`}>
      <CardContent className="p-0">
        <TableEnhanced>
          <TableHeaderEnhanced>
            <TableRowEnhanced isHeader>
              {showNumberColumn && (
                <TableHeadEnhanced
                  key="header-number"
                  isLast={false}
                  className="w-16 text-center"
                >
                  #
                </TableHeadEnhanced>
              )}
              {useColumns && columns
                ? columns.map((column, index) => (
                    <TableHeadEnhanced
                      key={`header-${index}`}
                      isLast={index === columns.length - 1 && !showNumberColumn}
                      className={column.headerClassName}
                    >
                      {column.sortable ? (
                        <Button
                          variant="ghost"
                          onClick={(e) => handleSort(column, index, e)}
                          className="h-auto p-0 font-semibold text-foreground hover:bg-transparent hover:text-foreground transition-colors flex items-center [&_svg]:text-foreground"
                          title={column.sortable ? "Click to sort" : undefined}
                        >
                          {column.header}
                          {getSortIcon(column, index)}
                        </Button>
                      ) : (
                        column.header
                      )}
                    </TableHeadEnhanced>
                  ))
                : headers
                ? headers.map((header, index) => (
                    <TableHeadEnhanced
                      key={`header-${index}`}
                      isLast={index === headers.length - 1 && !showNumberColumn}
                    >
                      {header}
                    </TableHeadEnhanced>
                  ))
                : null}
            </TableRowEnhanced>
          </TableHeaderEnhanced>
          <TableBodyEnhanced>
            {isLoading ? (
              <TableSkeleton rows={skeletonRows} columns={resolvedColumnCount} />
            ) : (
              (useColumns && columns
                ? resolvedRows.map((row, rowIndex) => {
                    const rowNumber = (page - 1) * limit + rowIndex + 1;
                    const isHovered = hoveredRowIndex === rowIndex;
                    return (
                      <TableRowEnhanced
                        key={rowKey ? rowKey(row, rowIndex) : rowIndex}
                        className={`${rowClassName?.(row, rowIndex)} ${isHovered ? 'bg-muted/40' : ''}`}
                        onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                        onMouseLeave={() => setHoveredRowIndex(null)}
                      >
                        {showNumberColumn && (
                          <TableCellEnhanced
                            key={`${rowIndex}-number`}
                            isLast={false}
                            className="w-16 text-center text-foreground"
                          >
                            {rowNumber}
                          </TableCellEnhanced>
                        )}
                        {columns.map((column, colIndex) => (
                          <TableCellEnhanced
                            key={`${rowIndex}-${colIndex}`}
                            isLast={colIndex === columns.length - 1 && !showNumberColumn}
                            className={column.className}
                          >
                            {column.cell(row)}
                          </TableCellEnhanced>
                        ))}
                      </TableRowEnhanced>
                    );
                  })
                : children)
            )}
          </TableBodyEnhanced>
        </TableEnhanced>
        {showEmptyState && (
          <EmptyState
            icon={emptyStateIcon}
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        )}
      </CardContent>
    </Card>
  );
}

