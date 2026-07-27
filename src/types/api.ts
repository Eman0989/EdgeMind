export interface ApiErrorPayload {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  requestId?: string;
  generatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiListMeta
  extends ApiMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: ApiListMeta;
}

export type RequestStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";