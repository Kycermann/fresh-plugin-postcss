export interface PostCssOptions {
  walkPath?: string;
  exts?: string[];
  plugins: any[] | (() => Promise<any[]>);
}
