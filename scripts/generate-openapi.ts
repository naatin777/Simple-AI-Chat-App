import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

import { generateOpenApiDocument } from "@/lib/openapi/registry";

const outputDir = path.join(process.cwd(), "openapi");
const outputPath = path.join(outputDir, "openapi.json");

mkdirSync(outputDir, { recursive: true });

const document = generateOpenApiDocument();
writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`);

console.log(`Wrote ${outputPath}`);
