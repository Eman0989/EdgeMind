import type {
  ApiErrorPayload,
} from "../types/api";

const DEFAULT_API_BASE_URL =
  "http://127.0.0.1:8000";

const API_BASE_URL =
  (
    import.meta.env
      .VITE_API_BASE_URL as
      | string
      | undefined
  )?.replace(/\/+$/, "") ??
  DEFAULT_API_BASE_URL;

interface RequestOptions
  extends Omit<
    RequestInit,
    "body"
  > {
  body?: unknown;
}

export class ApiClientError
  extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<
    string,
    unknown
  >;

  constructor(
    payload: ApiErrorPayload,
  ) {
    super(payload.message);
    this.name = "ApiClientError";
    this.status = payload.status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

async function parseResponseBody(
  response: Response,
) {
  const contentType =
    response.headers.get(
      "content-type",
    );

  if (
    !contentType?.includes(
      "application/json",
    )
  ) {
    return null;
  }

  return response.json() as Promise<unknown>;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
) {
  const {
    body,
    headers,
    ...requestInit
  } = options;

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...requestInit,
      headers: {
        Accept: "application/json",
        ...(body !== undefined
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    },
  );

  const payload =
    await parseResponseBody(
      response,
    );

  if (!response.ok) {
    const errorPayload =
      payload &&
      typeof payload === "object"
        ? (
            payload as Partial<
              ApiErrorPayload
            >
          )
        : {};

    throw new ApiClientError({
      status: response.status,
      code:
        errorPayload.code ??
        "request_failed",
      message:
        errorPayload.message ??
        `Request failed with status ${response.status}.`,
      details:
        errorPayload.details,
    });
  }

  return payload as T;
}

export const apiClient = {
  get<T>(
    path: string,
    options?: RequestOptions,
  ) {
    return request<T>(path, {
      ...options,
      method: "GET",
    });
  },

  post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ) {
    return request<T>(path, {
      ...options,
      method: "POST",
      body,
    });
  },

  put<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ) {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body,
    });
  },

  delete<T>(
    path: string,
    options?: RequestOptions,
  ) {
    return request<T>(path, {
      ...options,
      method: "DELETE",
    });
  },
};