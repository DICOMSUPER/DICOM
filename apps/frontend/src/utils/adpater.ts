
import { PaginatedResponse } from "@/interfaces/pagination/pagination.interface";

export function mapApiResponse<T>(response: any): PaginatedResponse<T> {
  // Truy cập đúng tầng chứa data và pagination
  const nested =
    response?.data?.data?.data ??
    response?.data?.data ??
    response?.data ??
    response;

  const pagination =
    response?.data?.data?.pagination ??
    response?.data?.pagination ??
    nested?.pagination ??
    {};

  console.log("✅ API mapped structure ->", {
    items: nested?.data || nested,
    pagination,
  });

  const items = nested?.data ?? nested ?? [];

  return {
    data: items,
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? 1,
    limit: pagination?.limit ?? 10,
    totalPages: pagination?.totalPages ?? 1,
    hasNextPage:
      pagination?.page && pagination?.totalPages
        ? pagination.page < pagination.totalPages
        : false,
    hasPreviousPage:
      pagination?.page && pagination?.page > 1 ? true : false,
  };
}
