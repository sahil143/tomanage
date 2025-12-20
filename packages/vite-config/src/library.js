import fs from "node:fs";
import { builtinModules } from "node:module";
import path from "node:path";
import { defineConfig } from "vite";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getPackageDeps(packageRoot) {
  const pkg = readJson(path.join(packageRoot, "package.json"));
  const deps = Object.keys(pkg.dependencies ?? {});
  const peerDeps = Object.keys(pkg.peerDependencies ?? {});
  return { deps, peerDeps };
}

/**
 * Shared Vite library config (turborepo-style).
 *
 * Produces ESM output by default and externalizes:
 * - Node built-ins
 * - dependencies + peerDependencies from the consumer package.json
 */
export function libraryConfig(options = {}) {
  const {
    packageRoot = process.cwd(),
    entry = "src/index.ts",
    name = undefined,
    outDir = "dist",
    formats = ["es"],
    fileName = "index",
    sourcemap = true,
  } = options;

  const { deps, peerDeps } = getPackageDeps(packageRoot);
  const builtins = builtinModules;

  const external = [
    ...builtins,
    ...builtins.map((m) => `node:${m}`),
    ...deps,
    ...peerDeps,
  ];

  return defineConfig({
    build: {
      lib: {
        entry,
        name,
        formats,
        fileName,
      },
      outDir,
      sourcemap,
      emptyOutDir: true,
      rollupOptions: {
        external,
      },
    },
  });
}


