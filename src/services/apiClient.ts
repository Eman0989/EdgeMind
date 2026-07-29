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
  token?: string | null;
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

  try {
    return await response.json() as unknown;
  } catch {
    return null;
  }
}

function getFastApiErrorMessage(
  payload: unknown,
  fallback: string,
) {
  if (
    !payload ||
    typeof payload !== "object"
  ) {
    return fallback;
  }

  const candidate = payload as {
    detail?: unknown;
    message?: unknown;
  };

  if (
    typeof candidate.detail ===
    "string"
  ) {
    return candidate.detail;
  }

  if (
    Array.isArray(candidate.detail)
  ) {
    const firstError =
      candidate.detail[0];

    if (
      firstError &&
      typeof firstError === "object"
    ) {
      const message = (
        firstError as {
          msg?: unknown;
        }
      ).msg;

      if (typeof message === "string") {
        return message;
      }
    }
  }

  if (
    typeof candidate.message ===
    "string"
  ) {
    return candidate.message;
  }

  return fallback;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
) {
  const {
    body,
    headers,
    token,
    ...requestInit
  } = options;

  const requestHeaders =
    new Headers(headers);

  requestHeaders.set(
    "Accept",
    "application/json",
  );

  if (body !== undefined) {
    requestHeaders.set(
      "Content-Type",
      "application/json",
    );
  }

  if (token) {
    requestHeaders.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...requestInit,
        headers: requestHeaders,
        body:
          body === undefined
            ? undefined
            : JSON.stringify(body),
      },
    );
  } catch {
    throw new ApiClientError({
      status: 0,
      code: "network_error",
      message:
        "Could not connect to the EdgeMind server.",
    });
  }

  const payload =
    await parseResponseBody(
      response,
    );

  if (!response.ok) {
    throw new ApiClientError({
      status: response.status,
      code: "request_failed",
      message:
        getFastApiErrorMessage(
          payload,
          `Request failed with status ${response.status}.`,
        ),
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

  patch<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ) {
    return request<T>(path, {
      ...options,
      method: "PATCH",
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
