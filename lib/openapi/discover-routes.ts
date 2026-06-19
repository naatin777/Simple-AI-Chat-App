import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const HTTP_METHODS = [
  "GET",
  "POST",
  "PATCH",
  "DELETE",
  "PUT",
  "HEAD",
  "OPTIONS",
] as const;

export type DiscoveredRouteHandler = {
  routeFile: string;
  method: (typeof HTTP_METHODS)[number];
};

export function discoverAppRouteHandlers(projectRoot: string): DiscoveredRouteHandler[] {
  const appApiDir = join(projectRoot, "app/api");
  const handlers: DiscoveredRouteHandler[] = [];

  function walk(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const fullPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (entry.name !== "route.ts") {
        continue;
      }

      const content = readFileSync(fullPath, "utf8");
      const routeFile = relative(projectRoot, fullPath);

      for (const method of HTTP_METHODS) {
        if (
          new RegExp(`export\\s+async\\s+function\\s+${method}\\b`).test(
            content,
          )
        ) {
          handlers.push({ routeFile, method });
        }
      }
    }
  }

  walk(appApiDir);

  return handlers.sort((left, right) => {
    const byFile = left.routeFile.localeCompare(right.routeFile);
    return byFile !== 0 ? byFile : left.method.localeCompare(right.method);
  });
}

export function routeHandlerKey(routeFile: string, method: string): string {
  return `${routeFile}:${method.toUpperCase()}`;
}
