import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ApiClientError,
  apiClient,
} from "./apiClient";

function jsonResponse(
  payload: unknown,
  status = 200,
) {
  return new Response(
    JSON.stringify(payload),
    {
      status,
      headers: {
        "Content-Type":
          "application/json",
      },
    },
  );
}

describe("apiClient", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends authenticated GET requests", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        id: 7,
      }),
    );

    const result =
      await apiClient.get<{
        id: number;
      }>(
        "/api/example",
        {
          token: "token-123",
        },
      );

    expect(result).toEqual({
      id: 7,
    });

    const [
      url,
      request,
    ] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(url).toBe(
      "http://127.0.0.1:8000/api/example",
    );

    expect(request.method).toBe(
      "GET",
    );

    const headers =
      new Headers(
        request.headers,
      );

    expect(
      headers.get("Accept"),
    ).toBe("application/json");

    expect(
      headers.get("Authorization"),
    ).toBe("Bearer token-123");
  });

  it("serializes POST request bodies", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        created: true,
      }),
    );

    await apiClient.post(
      "/api/example",
      {
        name: "Edge test",
      },
    );

    const [
      ,
      request,
    ] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    const headers =
      new Headers(
        request.headers,
      );

    expect(request.method).toBe(
      "POST",
    );

    expect(
      headers.get("Content-Type"),
    ).toBe("application/json");

    expect(request.body).toBe(
      JSON.stringify({
        name: "Edge test",
      }),
    );
  });

  it("uses FastAPI string error details", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          detail:
            "Invalid credentials.",
        },
        401,
      ),
    );

    await expect(
      apiClient.post(
        "/api/auth/login",
        {},
      ),
    ).rejects.toMatchObject({
      name: "ApiClientError",
      status: 401,
      code: "request_failed",
      message:
        "Invalid credentials.",
    });
  });

  it("uses FastAPI validation messages", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          detail: [
            {
              msg:
                "Field required",
            },
          ],
        },
        422,
      ),
    );

    await expect(
      apiClient.post(
        "/api/example",
        {},
      ),
    ).rejects.toMatchObject({
      status: 422,
      message: "Field required",
    });
  });

  it("converts connection failures into ApiClientError", async () => {
    fetchMock.mockRejectedValue(
      new TypeError(
        "Network unavailable",
      ),
    );

    const request =
      apiClient.get(
        "/api/health",
      );

    await expect(
      request,
    ).rejects.toBeInstanceOf(
      ApiClientError,
    );

    await expect(
      request,
    ).rejects.toMatchObject({
      status: 0,
      code: "network_error",
      message:
        "Could not connect to the EdgeMind server.",
    });
  });
});
