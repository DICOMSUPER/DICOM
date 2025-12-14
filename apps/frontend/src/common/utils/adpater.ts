
import { PaginatedResponse } from "@/common/interfaces/pagination/pagination.interface";

export function mapApiResponse<T>(response: any): PaginatedResponse<T> {
  if (!response) {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  if (response.data && Array.isArray(response.data) && typeof response.total === 'number') {
    const totalPages = response.totalPages ?? Math.ceil((response.total ?? 0) / (response.limit ?? 10));
    return {
      data: response.data,
      total: response.total,
      page: response.page ?? 1,
      limit: response.limit ?? 10,
      totalPages: totalPages,
      hasNextPage: response.hasNextPage ?? (response.page ?? 1) < totalPages,
      hasPreviousPage: response.hasPreviousPage ?? (response.page ?? 1) > 1,
    };
  }

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

  const items = nested?.data ?? nested ?? [];

  return {
    data: items,
    total: pagination?.total ?? response?.total ?? items.length,
    page: pagination?.page ?? response?.page ?? 1,
    limit: pagination?.limit ?? response?.limit ?? 10,
    totalPages: pagination?.totalPages ?? response?.totalPages ?? Math.ceil((pagination?.total ?? response?.total ?? items.length) / (pagination?.limit ?? response?.limit ?? 10)),
    hasNextPage:
      pagination?.hasNextPage ?? response?.hasNextPage ?? 
      (pagination?.page ?? response?.page ?? 1) < (pagination?.totalPages ?? response?.totalPages ?? Math.ceil((pagination?.total ?? response?.total ?? items.length) / (pagination?.limit ?? response?.limit ?? 10))),
    hasPreviousPage:
      pagination?.hasPreviousPage ?? response?.hasPreviousPage ??
      (pagination?.page ?? response?.page ?? 1) > 1,
  };
}
