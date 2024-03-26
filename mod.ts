import { PluginAsyncRenderContext, PluginRenderResult, ResolvedFreshConfig } from "$fresh/server.ts";
import { PluginRenderLink } from "$fresh/src/server/types.ts";
import { asset } from "$fresh/runtime.ts";
import { PostCssOptions } from "./types.ts";
import { compileBundle } from "./src/compileBundle.ts";

const defaultOptions = {
  walkPath: "./static",
  exts: ["css"],
  plugins: [] as any[] | (() => Promise<any[]>),
} satisfies PostCssOptions;

export const postCssPlugin = (options?: PostCssOptions) => {
  let dev = true;

  const optionsWithDefaults = {
    ...defaultOptions,
    ...(options ?? {}),
  };

  return {
    name: "fresh-plugin-postcss",

    configResolved(config: ResolvedFreshConfig) {
      dev = config.dev;
    },

    async buildStart() {
      const [bundle, { join }] = await Promise.all([
        compileBundle(optionsWithDefaults),
        import("https://deno.land/std@0.220.1/path/mod.ts"),
      ]);

      const fullStaticBundlePath = join("_fresh", "static", "styles.min.css");
      const fullStaticBundlePathDir = join("_fresh", "static");

      // Create the directory if it doesn't exist
      await Deno.mkdir(fullStaticBundlePathDir, { recursive: true });

      await Deno.writeTextFile(fullStaticBundlePath!, bundle);
    },

    async renderAsync(ctx: PluginAsyncRenderContext): Promise<PluginRenderResult> {
      if (dev) {
        const [bundle] = await Promise.all([
          compileBundle(optionsWithDefaults),
          ctx.renderAsync(),
        ]);
  
        return {
          styles: [{
            cssText: bundle,
          }],
        };
      } else {
        await ctx.renderAsync();

        return {
          links: [{
            rel: "stylesheet",
            type: "text/css",
            href: asset("/styles.min.css"),
          }] as PluginRenderLink[],
        };
      }
    },
  };
};
