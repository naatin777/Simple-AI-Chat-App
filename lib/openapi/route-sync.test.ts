import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  discoverAppRouteHandlers,
  routeHandlerKey,
} from "@/lib/openapi/discover-routes";
import { API_ROUTE_DEFINITIONS } from "@/lib/openapi/route-definitions";

const projectRoot = join(import.meta.dirname, "../..");

function manifestKeys() {
  return API_ROUTE_DEFINITIONS.map((definition) =>
    routeHandlerKey(definition.routeFile, definition.method),
  ).sort();
}

describe("API route manifest sync", () => {
  it("lists every app/api route handler", () => {
    const discovered = discoverAppRouteHandlers(projectRoot).map((handler) =>
      routeHandlerKey(handler.routeFile, handler.method),
    );

    expect(manifestKeys()).toEqual(discovered.sort());
  });

  it("points manifest entries at existing route files", () => {
    const uniqueRouteFiles = [
      ...new Set(API_ROUTE_DEFINITIONS.map((definition) => definition.routeFile)),
    ];

    for (const routeFile of uniqueRouteFiles) {
      expect(existsSync(join(projectRoot, routeFile))).toBe(true);
    }
  });

  it("requires openApi metadata when inOpenApi is true", () => {
    for (const definition of API_ROUTE_DEFINITIONS) {
      if (definition.inOpenApi) {
        expect(definition.openApi, definition.routeFile).toBeDefined();
      }
    }
  });
});
