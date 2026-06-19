import { defineConfig } from "orval";

export default defineConfig({
  chatApp: {
    input: {
      target: "./openapi/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./lib/api/generated/endpoints",
      schemas: "./lib/api/generated/model",
      client: "swr",
      httpClient: "fetch",
      clean: true,
      override: {
        mutator: {
          path: "./lib/api/custom-fetch.ts",
          name: "customFetch",
        },
      },
    },
  },
});
