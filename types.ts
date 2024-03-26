export interface PostCssOptions {
  walkPath?: string;
  exts?: string[];
  plugins: any[] | (() => Promise<any[]>);
  asset: (path: string) => string;
}
