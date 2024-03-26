# `fresh-plugin-postcss`

Fresh plugin for PostCSS support - with high performance in production.

Recommended to use with a Fresh build step (`deno task build`).

## Quick start

`fresh.config.ts`:

```ts
import { FreshConfig } from "$fresh/server.ts";

import { compileArticles } from "./utils/article.js";
import { compilePostCss } from "./utils/postcss.ts";

// Use any plugins you want
import { postCssPlugin } from "https://deno.land/x/fresh-plugin-postcss@1.0.0/mod.ts";

export const config = {
  plugins: [
    postCssPlugin({
      // By default, looks for all CSS files in "./static"
      // {exts} and {walkPath} can be left out
      exts: ["css"],
      walkPath: "./static",

      // Add your PostCSS plugins
      // {plugins} can be an array or an async function that returns an array
      // I suggest the async function because PostCSS plugins are not needed
      // in production (if you use Fresh's build step)
      async plugins() {
        const [
          { default: cssAutoprefixer },
          { default: cssPresetEnv },
        ] = await Promise.all([
          import("npm:autoprefixer@10.4.19"),
          import("npm:postcss-preset-env@9.5.2"),
        ]);

        return [
          cssAutoprefixer,
          cssPresetEnv,
        ];
      }
    }),
  ],
} satisfies FreshConfig;
```

## Fast in production

Development:

- Injects a single `<style>` tag during development
- Styles are compiled just as they would be in production

Production (with build step):

- Writes a single CSS file to `_fresh/static`
- Automatically injects the `<link>` tag in the HTML's `<head>`
- Uses a long cache expiry time (expires after a year or version change)
- Uses dynamic imports to avoid unnecessary bundling in production

The production optimisation is that unlike other plugins, this plugin only uses its depencencies in development and during the build step.

Provided you use the build step, even PostCSS is not imported in production.

## Issues and contributions

If a feature is missing, please open an issue.
