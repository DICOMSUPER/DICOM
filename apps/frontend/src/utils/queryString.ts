export type CommonQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: string;
  sortField?: string;
  order?: "asc" | "desc";
};

export const buildQueryString = (params?: CommonQueryParams) => {
  if (!params) {
    return "";
  }

  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.searchField)
    queryParams.append("searchField", params.searchField);
  if (params.sortField) queryParams.append("sortField", params.sortField);
  if (params.order) queryParams.append("order", params.order);

  return queryParams.toString();
};

