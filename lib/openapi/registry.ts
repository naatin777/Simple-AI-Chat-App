import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";

import { registerApiRoutes } from "@/lib/openapi/route-definitions";

export const registry = new OpenAPIRegistry();

registerApiRoutes(registry);

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Simple AI Chat App API",
      version: "1.0.0",
    },
  });
}
