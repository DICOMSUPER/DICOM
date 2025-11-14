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

interface DataTableProps<T> {
  columns: {
    header: string;
    cell: (row: T) => ReactNode;
    className?: string;
    headerClassName?: string;
  }[];
  data: T[];
  isLoading: boolean;
  emptyStateIcon: ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  className?: string;
  skeletonRows?: number;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  className = "",
  skeletonRows = 5,
}: DataTableProps<T>) {
  return (
    <Card className={`border-border p-0 ${className}`}>
      <CardContent className="p-0">
        <TableEnhanced>
          <TableHeaderEnhanced>
            <TableRowEnhanced isHeader>
              {columns.map((column, index) => (
                <TableHeadEnhanced
                  key={column.header}
                  isLast={index === columns.length - 1}
                  className={column.headerClassName}
                >
                  {column.header}
                </TableHeadEnhanced>
              ))}
            </TableRowEnhanced>
          </TableHeaderEnhanced>
          <TableBodyEnhanced>
            {isLoading ? (
              <TableSkeleton rows={skeletonRows} columns={columns.length} />
            ) : (
              data.map((row, rowIndex) => (
                <TableRowEnhanced key={rowIndex}>
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
            )}
          </TableBodyEnhanced>
        </TableEnhanced>
        {!isLoading && data.length === 0 && (
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

