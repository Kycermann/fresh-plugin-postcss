/**
 * Deno Deploy statically analyses imports and bundles them into their eszip.
 * Usually, that's great, but sometimes your imports are for dev/builds only.
 * This function allows you to import a module without static analysis.
 *
 * @param source Module source to import without bundling
 */
export async function importWithoutBundling(source: string) {
  // Use import but avoid static analysis
  const importUrl =
    `data:application/javascript,import * as x from "${source}"; export default x.default; export * from "${source}";`;

  const mod = await import(importUrl);

  return mod;
}
