// components/ui/pagination.tsx
"use client";

import React from "react";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "../ui/button";

// import Button from "../ui/Button";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  //   onLimitChange?: (limit: number) => void;
  //   showLimitSelector?: boolean;
  showInfo?: boolean;
  className?: string;
  //   limitOptions?: number[];
  //   itemName?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  //   onLimitChange,
  //   showLimitSelector = true,
  showInfo = true,
  className = "",
  //   limitOptions = [5, 10, 20, 50],
  //   itemName = "items",
}) => {
  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  // Generate page numbers to display
  //   const getPageNumbers = () => {
  //     const maxVisiblePages = 5;
  //     const pages: number[] = [];

  //     if (pagination.totalPages <= maxVisiblePages) {
  //       // Show all pages if total pages <= maxVisiblePages
  //       for (let i = 1; i <= pagination.totalPages; i++) {
  //         pages.push(i);
  //       }
  //     } else {
  //       // Show smart pagination
  //       if (pagination.page <= 3) {
  //         // Show first 5 pages
  //         for (let i = 1; i <= maxVisiblePages; i++) {
  //           pages.push(i);
  //         }
  //       } else if (pagination.page >= pagination.totalPages - 2) {
  //         // Show last 5 pages
  //         for (let i = pagination.totalPages - 4; i <= pagination.totalPages; i++) {
  //           pages.push(i);
  //         }
  //       } else {
  //         // Show current page with 2 pages on each side
  //         for (let i = pagination.page - 2; i <= pagination.page + 2; i++) {
  //           pages.push(i);
  //         }
  //       }
  //     }

  //     return pages;
  //   };

  if (pagination.totalPages <= 1) {
    return null; 
  }

  return (
    <div className={`flex items-center justify-between px-2 py-4 ${className}`}>
      <div className="flex items-center space-x-4"></div>
      {pagination.totalPages > 1 && (
        <div className="flex items-center space-x-2">
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!pagination.hasPreviousPage}
            className="h-8 w-8 p-0"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous page button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPreviousPage}
            className="h-8 w-8 p-0"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNumber: number;

                if (pagination.totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (pagination.page <= 3) {
                  pageNumber = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNumber = pagination.totalPages - 4 + i;
                } else {
                  pageNumber = pagination.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={
                      pagination.page === pageNumber ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => onPageChange(pageNumber)}
                    className="w-8 h-8"
                  >
                    {pageNumber}
                  </Button>
                );
              }
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="h-8 w-8 p-0"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.totalPages)}
            disabled={!pagination.hasNextPage}
            className="h-8 w-8 p-0"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pagination;