import { PostCssOptions } from "../types.ts";

export async function compileBundle({ walkPath, exts, plugins }: PostCssOptions) {
  // Dynamic imports used only if this function is called
  const [
    { walk },
    { default: postcss },
    resolvedPlugins,
  ] = await Promise.all([
    import("https://deno.land/std@0.207.0/fs/walk.ts"),
    import("https://deno.land/x/postcss@8.4.16/mod.js"),
    (async () => {
      // Resolve the plugins if {plugins} is a function
      if (typeof plugins === "function") {
        return await plugins();
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
  
  const allCompiledCss = await Array.fromAsync(filesIterator, async ({ path }) => {
    const body = await Deno.readTextFile(path);
    const compiledCss = await postcss(resolvedPlugins as any).process(body, { from: path });

    return compiledCss;
  });

  const bundle = allCompiledCss.map(({ css }) => css).join("\n");

  return bundle;
}