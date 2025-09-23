import { Skeleton } from "./skeleton";
import { TableEnhanced, TableHeaderEnhanced, TableRowEnhanced, TableHeadEnhanced, TableCellEnhanced, TableBodyEnhanced } from "./table-enhanced";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 7, className = "" }: TableSkeletonProps) {
  return (
    <TableEnhanced className={className}>
      <TableHeaderEnhanced>
        <TableRowEnhanced isHeader>
          {Array.from({ length: columns }).map((_, index) => (
            <TableHeadEnhanced key={index} isLast={index === columns - 1}>
              <Skeleton className="h-4 w-20" />
            </TableHeadEnhanced>
          ))}
        </TableRowEnhanced>
      </TableHeaderEnhanced>
      <TableBodyEnhanced>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRowEnhanced key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <TableCellEnhanced key={colIndex} isLast={colIndex === columns - 1}>
                <Skeleton className="h-4 w-full" />
              </TableCellEnhanced>
            ))}
          </TableRowEnhanced>
        ))}
      </TableBodyEnhanced>
    </TableEnhanced>
  );
}
