export interface ApiResponse<T> {
  success: boolean;
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  method: string;
  traceId: string;
}
