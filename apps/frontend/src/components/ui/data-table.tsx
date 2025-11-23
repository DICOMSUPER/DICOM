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
import type { ReactNode } from "react";

interface DataTableColumn<T> {
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
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
}

export function DataTable<T>({
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
}: DataTableProps<T>) {
  const useColumns = Array.isArray(columns) && Array.isArray(data);
  const resolvedColumnCount = useColumns ? columns!.length : (headers ? headers.length : skeletonColumns);
  const resolvedRows = useColumns ? data || [] : [];
  const showEmptyState = !isLoading && (useColumns ? resolvedRows.length === 0 : Boolean(isEmpty));

  return (
    <Card className={`border-border p-0 ${className}`}>
      <CardContent className="p-0">
        <TableEnhanced>
          <TableHeaderEnhanced>
            <TableRowEnhanced isHeader>
              {useColumns && columns
                ? columns.map((column, index) => (
                    <TableHeadEnhanced
                      key={`header-${index}`}
                      isLast={index === columns.length - 1}
                      className={column.headerClassName}
                    >
                      {column.header}
                    </TableHeadEnhanced>
                  ))
                : headers
                ? headers.map((header, index) => (
                    <TableHeadEnhanced
                      key={`header-${index}`}
                      isLast={index === headers.length - 1}
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
                ? resolvedRows.map((row, rowIndex) => (
                    <TableRowEnhanced
                      key={rowKey ? rowKey(row, rowIndex) : rowIndex}
                      className={rowClassName?.(row, rowIndex)}
                    >
                      {columns.map((column, colIndex) => (
                        <TableCellEnhanced
                          key={`${rowIndex}-${colIndex}`}
                          isLast={colIndex === columns.length - 1}
                          className={column.className}
                        >
                          {column.cell(row)}
                        </TableCellEnhanced>
                      ))}
                    </TableRowEnhanced>
                  ))
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

