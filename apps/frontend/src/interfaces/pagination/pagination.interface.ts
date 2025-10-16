// Base pagination (match với backend)
export interface PaginationParams {
  page?: number;
  limit?: number;
}
export interface SortParams {
  sort?: string;
  order?: "asc" | "desc";
}
export interface SearchParams {
  search?: string;
}
export interface FilterParams {
  [key: string]: any;
}

export interface QueryParams extends PaginationParams, SortParams, SearchParams, FilterParams {}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}