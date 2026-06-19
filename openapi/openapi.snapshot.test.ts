import { readFileSync } from "node:fs";
import path from "node:path";

import { generateOpenApiDocument } from "@/lib/openapi/registry";

describe("OpenAPI spec", () => {
  it("matches the committed openapi.json snapshot", () => {
    const generated = generateOpenApiDocument();
    const committed = JSON.parse(
      readFileSync(path.join(process.cwd(), "openapi/openapi.json"), "utf8"),
    ) as unknown;

    expect(generated).toEqual(committed);
  });

  it("registers all REST endpoints used by the app", () => {
    const spec = generateOpenApiDocument();
    const paths = Object.keys(spec.paths ?? {});

    expect(paths).toEqual(
      expect.arrayContaining([
        "/api/conversations",
        "/api/conversations/{id}",
        "/api/conversations/{id}/messages",
        "/api/conversations/{id}/duplicate",
        "/api/conversations/{id}/duplicate-directories",
        "/api/conversations/{id}/directories",
        "/api/conversations/{id}/directories/{dirId}",
        "/api/conversations/{id}/directories/{dirId}/tree",
        "/api/directories/pick",
      ]),
    );
  });
});
