import { Skeleton } from "./skeleton";
import { TableRowEnhanced, TableHeadEnhanced, TableCellEnhanced } from "./table-enhanced";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 7, className = "" }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRowEnhanced key={rowIndex} className={className}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCellEnhanced key={colIndex} isLast={colIndex === columns - 1}>
              <Skeleton className="h-4 w-full" />
            </TableCellEnhanced>
          ))}
        </TableRowEnhanced>
      ))}
    </>
  );
}
