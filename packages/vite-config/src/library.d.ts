import type { UserConfigExport } from 'vite';

export type LibraryConfigOptions = {
  packageRoot?: string;
  entry?: string;
  name?: string;
  outDir?: string;
  formats?: Array<'es' | 'cjs' | 'umd' | 'iife'>;
  fileName?: string;
  sourcemap?: boolean;
};

/**
 * Shared Vite library config. Produces ESM output by default and externalizes:
 * - Node built-ins
 * - dependencies + peerDependencies from the consumer package.json
 */
export function libraryConfig(options?: LibraryConfigOptions): UserConfigExport;


