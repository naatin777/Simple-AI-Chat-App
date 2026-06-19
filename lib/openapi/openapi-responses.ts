import { ErrorResponseSchema } from "@/lib/openapi/schemas/common";

export function errorResponse(description: string) {
  return {
    description,
    content: {
      "application/json": { schema: ErrorResponseSchema },
    },
  };
}
