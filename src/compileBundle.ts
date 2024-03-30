import { POSTCSS_MODULE_PATH, WALK_MODULE_PATH } from "../constants.ts";
import { importWithoutBundling } from "./importWithoutBundling.ts";
import { PostCssOptions } from "../types.ts";

export async function compileBundle({ walkPath, exts, plugins }: PostCssOptions) {
  // Dynamic imports used only if this function is called
  const [
    { walk },
    { default: postcss },
    resolvedPlugins,
  ] = await Promise.all([
    importWithoutBundling(WALK_MODULE_PATH),
    importWithoutBundling(POSTCSS_MODULE_PATH),
    (async () => {
      // Resolve the plugins if {plugins} is a function
      if (typeof plugins === "function") {
        return await plugins({ importWithoutBundling });
      }

      return plugins;
    })(),
  ]);

  if (!Array.isArray(resolvedPlugins)) {
    console.log(resolvedPlugins);
    throw new Error("plugins must be an array or a function that returns a promise of an array");
  }

  // Load all CSS files in {walkPath}
  const optionsForWalk = {
    exts,
    includeFiles: true,
    includeDirs: false,
    includeSymlinks: false,
  };

  const filesIterator = walk(walkPath ?? "./static", optionsForWalk);

  const allCompiledCss = await Array.fromAsync(
    filesIterator,
    async ({ path }: { path: string }) => {
      const body = await Deno.readTextFile(path);
      const compiledCss = await postcss(resolvedPlugins as any).process(body, { from: path });

      return compiledCss;
    },
  );

  const bundle = allCompiledCss.map(({ css }: any) => css).join("\n");

  return bundle;
}
