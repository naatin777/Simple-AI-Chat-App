import { getClientLocale } from "@/lib/i18n/client";

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export type CustomFetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined | null>;
};

function mergeHeaders(extra?: HeadersInit): HeadersInit {
  const base: Record<string, string> = {
    "X-Locale": getClientLocale(),
  };

  if (!extra) {
    return base;
  }

  if (extra instanceof Headers) {
    for (const [key, value] of extra.entries()) {
      base[key] = value;
    }
    return base;
  }

  if (Array.isArray(extra)) {
    for (const [key, value] of extra) {
      base[key] = value;
    }
    return base;
  }

  return { ...base, ...extra };
}

function buildUrl(url: string, params?: CustomFetchOptions["params"]): string {
  if (!params) {
    return url;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  if (!query) {
    return url;
  }

  return `${url}?${query}`;
}

function toApiResponse<T>(value: {
  data: T;
  status: number;
  headers: Headers;
}): ApiResponse<T> {
  return value;
}

export async function customFetch<T extends ApiResponse<unknown>>(
  url: string,
  options: CustomFetchOptions = {},
): Promise<T> {
  const { params, headers, ...init } = options;
  const resolvedUrl = buildUrl(url, params);

  const response = await fetch(resolvedUrl, {
    ...init,
    headers: mergeHeaders(headers),
  });

  if (response.status === 204) {
    return toApiResponse({
      data: undefined,
      status: 204,
      headers: response.headers,
    }) as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const errorBody: unknown = await response.json();
      throw new Error(
        typeof errorBody === "object" &&
          errorBody !== null &&
          "error" in errorBody &&
          typeof errorBody.error === "string"
          ? errorBody.error
          : `Request failed with status ${String(response.status)}`,
      );
    }

    throw new Error(`Request failed with status ${String(response.status)}`);
  }

  if (contentType.includes("application/json")) {
    const data: unknown = await response.json();
    return toApiResponse({
      data,
      status: response.status,
      headers: response.headers,
    }) as T;
  }

  return toApiResponse({
    data: response,
    status: response.status,
    headers: response.headers,
  }) as T;
}

export default customFetch;
