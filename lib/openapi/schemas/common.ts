import { z } from "@/lib/openapi/extend-zod";

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
  })
  .openapi("ErrorResponse");

export const SuccessResponseSchema = z
  .object({
    success: z.boolean(),
  })
  .openapi("SuccessResponse");

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
