// Use trickery to avoid static analysis (and bundling!)
// We trust that deno.land/x will work

const BASE = "https://deno.land/";

let count = 0;

function getExtension() {
  // PostCSS is a JS module
  return (++count) === 3 ? ".js" : ".ts";
}

export const WALK_MODULE_PATH = [BASE, "std@0.220.1/fs/walk", getExtension()].join("");
export const PATH_MODULE_PATH = [BASE, "std@0.220.1/path/mod", getExtension()].join("");
export const POSTCSS_MODULE_PATH = [BASE, "x/postcss@8.4.16/mod", getExtension()].join("");
