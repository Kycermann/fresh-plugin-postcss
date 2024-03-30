type PluginsCallbackOptions = {
  importWithoutBundling: (path: string) => Promise<any>;
};

export interface PostCssOptions {
  walkPath?: string;
  exts?: string[];
  plugins: any[] | (({ importWithoutBundling }: PluginsCallbackOptions) => Promise<any[]>);
  asset: (path: string) => string;
}
