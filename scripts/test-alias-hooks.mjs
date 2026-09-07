import path from "node:path";
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function isFile(p) {
  try {
    return existsSync(p) && statSync(p).isFile();
  } catch {
    return false;
  }
}

function resolveFile(filePath) {
  const candidates = [
    filePath,
    `${filePath}.js`,
    `${filePath}.jsx`,
    `${filePath}.mjs`,
    path.join(filePath, "index.js"),
    path.join(filePath, "index.jsx"),
    path.join(filePath, "index.mjs"),
  ];

  for (const candidate of candidates) {
    if (isFile(candidate)) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
}

function resolveSpecifier(specifier, parentURL) {
  if (specifier.startsWith("@/")) {
    return resolveFile(path.join(root, "src", specifier.slice(2)));
  }

  if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    parentURL
  ) {
    const parentDir = path.dirname(fileURLToPath(parentURL));
    return resolveFile(path.resolve(parentDir, specifier));
  }

  return null;
}

/**
 * Map `@/…` to `src/…` and resolve extensionless / directory imports for Node tests.
 */
export async function resolve(specifier, context, nextResolve) {
  const mapped = resolveSpecifier(specifier, context.parentURL);
  if (mapped) {
    return nextResolve(mapped, context);
  }

  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (
      err?.code === "ERR_MODULE_NOT_FOUND" ||
      err?.code === "ERR_UNSUPPORTED_DIR_IMPORT"
    ) {
      const recovered = resolveSpecifier(specifier, context.parentURL);
      if (recovered) {
        return nextResolve(recovered, context);
      }
    }
    throw err;
  }
}
