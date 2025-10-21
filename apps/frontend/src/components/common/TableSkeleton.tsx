import React from "react";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface TableSkeletonProps {
  limit: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ limit }) => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-gray-50">
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                  <TableHead className="bg-gray-50">
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                  <TableHead className="bg-gray-50">
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead className="bg-gray-50">
                    <Skeleton className="h-4 w-32" />
                  </TableHead>
                  <TableHead className="bg-gray-50">
                    <Skeleton className="h-4 w-28" />
                  </TableHead>
                  <TableHead className="bg-gray-50">
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                  <TableHead className="bg-gray-50">
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                  <TableHead className="bg-gray-50">
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: limit }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
