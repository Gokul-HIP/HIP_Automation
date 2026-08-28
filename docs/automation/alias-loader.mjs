/**
 * Resolve Next.js `@/` imports and extensionless relative imports for docs gen.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function resolveFile(candidate) {
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }
  for (const ext of [".js", ".jsx", ".mjs", ".cjs", ".json"]) {
    const withExt = candidate + ext;
    if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) {
      return withExt;
    }
  }
  const indexJs = path.join(candidate, "index.js");
  if (fs.existsSync(indexJs)) return indexJs;
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const resolved = resolveFile(path.join(ROOT, "src", specifier.slice(2)));
    if (!resolved) {
      return nextResolve(specifier, context);
    }
    return {
      shortCircuit: true,
      url: pathToFileURL(resolved).href,
    };
  }

  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL
  ) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const resolved = resolveFile(path.resolve(parentDir, specifier));
    if (resolved) {
      return {
        shortCircuit: true,
        url: pathToFileURL(resolved).href,
      };
    }
  }

  return nextResolve(specifier, context);
}
