import type { z } from "zod";

interface ResponseLike {
  data: unknown;
  status: number;
  headers: Headers;
}

export function getResponseData<T>(
  response: ResponseLike | undefined,
  schema: z.ZodType<T>,
): T | undefined {
  if (!response || response.status < 200 || response.status >= 300) {
    return undefined;
  }

  const parsed = schema.safeParse(response.data);
  if (!parsed.success) {
    return undefined;
  }

  return parsed.data;
}
