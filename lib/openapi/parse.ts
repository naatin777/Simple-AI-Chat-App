import type { z } from "zod";

import { ErrorResponseSchema } from "@/lib/openapi/schemas/common";

export async function parseJsonBody<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: Response }
> {
  let json: unknown;

  try {
    json = await req.json();
  } catch {
    return {
      success: false,
      response: Response.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return {
      success: false,
      response: Response.json(
        { error: "Invalid request body" },
        { status: 400 },
      ),
    };
  }

  return { success: true, data: parsed.data };
}

function serializeForApi(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeForApi);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        serializeForApi(entry),
      ]),
    );
  }

  return value;
}

export function jsonResponse(
  schema: z.ZodType,
  data: unknown,
  init?: ResponseInit,
): Response {
  return Response.json(schema.parse(serializeForApi(data)), init);
}

export function errorResponse(message: string, status: number): Response {
  return Response.json(ErrorResponseSchema.parse({ error: message }), {
    status,
  });
}
