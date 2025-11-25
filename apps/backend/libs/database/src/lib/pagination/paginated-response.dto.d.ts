export declare class PaginatedResponseDto<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    constructor(data: T[], total: number, page: number, limit: number, totalPages?: number, hasNextPage?: boolean, hasPreviousPage?: boolean);
}
//# sourceMappingURL=paginated-response.dto.d.ts.map