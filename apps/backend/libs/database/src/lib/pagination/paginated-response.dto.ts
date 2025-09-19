export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  constructor(
    data: T[],
    total: number,
    page: number,
    limit: number,
    totalPages?: number,
    hasNextPage?: boolean,
    hasPreviousPage?: boolean,
  ) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = totalPages ?? Math.ceil(total / limit);
    this.hasNextPage = hasNextPage ?? page < this.totalPages;
    this.hasPreviousPage = hasPreviousPage ?? page > 1;
  }
}
