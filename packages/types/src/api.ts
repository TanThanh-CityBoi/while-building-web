/** Envelope for single resources: `{ "data": T }`. */
export interface ApiResponse<T> {
  data: T;
}

export interface Pagination {
  /** 1-based. */
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Envelope for lists: `{ "data": T[], "meta": Pagination }`. */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: Pagination;
}

/** Error body as produced by NestJS exception filters. */
export interface ApiErrorBody {
  statusCode: number;
  /** Validation errors arrive as an array of messages. */
  message: string | string[];
  error?: string;
}

/** `GET /health` */
export interface HealthResponse {
  status: 'ok' | 'error';
  database?: 'up' | 'down';
}
