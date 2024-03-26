import { PostCssOptions } from "./types.ts";
import { compileBundle } from "./src/compileBundle.ts";
import { PATH_MODULE_PATH } from "./constants.ts";

const defaultOptions = {
  walkPath: "./static",
  exts: ["css"],
  plugins: [] as any[] | (() => Promise<any[]>),
  asset: (path: string) => path,
} satisfies PostCssOptions;

export const postCssPlugin = (options?: PostCssOptions) => {
  let dev = true;

  const optionsWithDefaults = {
    ...defaultOptions,
    ...(options ?? {}),
  };

  return {
    name: "fresh-plugin-postcss",

    configResolved(config: { dev: boolean }) {
      dev = config.dev;
    },

    async buildStart() {
      const [bundle, { join }] = await Promise.all([
        compileBundle(optionsWithDefaults),
        import(PATH_MODULE_PATH),
      ]);

      const fullStaticBundlePath = join("_fresh", "static", "styles.min.css");
      const fullStaticBundlePathDir = join("_fresh", "static");

      // Create the directory if it doesn't exist
      await Deno.mkdir(fullStaticBundlePathDir, { recursive: true });

      await Deno.writeTextFile(fullStaticBundlePath!, bundle);
    },

    async renderAsync(ctx: { renderAsync: any }) {
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
            href: optionsWithDefaults.asset("/styles.min.css"),
          }],
        };
      }
    },
  };
};
