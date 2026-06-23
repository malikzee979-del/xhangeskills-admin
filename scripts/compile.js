'use strict';

/**
 * Compile the Strapi server (TypeScript -> dist/) without building the React
 * admin panel. This is a headless deployment: the admin panel is intentionally
 * not built or served.
 *
 * `compileStrapi()` runs Strapi's own TypeScript compilation, which both emits
 * the compiled JS and copies non-TS assets (e.g. content-type schema.json files)
 * into dist/ — something a plain `tsc` invocation would not do.
 */
async function main() {
  const { compileStrapi } = require('@strapi/strapi');
  await compileStrapi();
  console.log('✓ Server compiled to dist/');
  process.exit(0);
}

main().catch((err) => {
  console.error('✗ Compile failed:', err);
  process.exit(1);
});
