"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { 
  TableEnhanced,
  TableHeaderEnhanced,
  TableRowEnhanced,
  TableHeadEnhanced,
  TableCellEnhanced,
  TableBodyEnhanced,
} from "@/components/ui/table-enhanced";
import { ReactNode } from "react";

interface ReceptionTableProps {
  headers: string[];
  isLoading: boolean;
  isEmpty: boolean;
  emptyStateIcon: ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  children: ReactNode;
  className?: string;
}

export function ReceptionTable({
  headers,
  isLoading,
  isEmpty,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  children,
  className = "",
}: ReceptionTableProps) {
  return (
    <Card className={`border-border p-0 ${className}`}>
      <CardContent className="p-0">
        <TableEnhanced>
          <TableHeaderEnhanced>
            <TableRowEnhanced isHeader>
              {headers.map((header, index) => (
                <TableHeadEnhanced key={index} isLast={index === headers.length - 1}>
                  {header}
                </TableHeadEnhanced>
              ))}
            </TableRowEnhanced>
          </TableHeaderEnhanced>
          <TableBodyEnhanced>
            {isLoading ? (
              <TableSkeleton rows={5} columns={headers.length} />
            ) : (
              children
            )}
          </TableBodyEnhanced>
        </TableEnhanced>
        {!isLoading && isEmpty && (
          <div>
            <EmptyState
              icon={emptyStateIcon}
              title={emptyStateTitle}
              description={emptyStateDescription}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
