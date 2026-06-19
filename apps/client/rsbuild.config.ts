import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginBabel } from "@rsbuild/plugin-babel";

export default defineConfig({
  html: { template: "./public/index.html" },
  output: { distPath: "./build" },
  tools: {
    rspack: {
      optimization: {
        splitChunks: {
          cacheGroups: {
            mui: {
              name: "lib-mui",
              test: /[\\/]node_modules[\\/]@mui[\\/]/,
              chunks: "all",
              enforce: true,
              priority: 40,
            },
            emotion: {
              name: "lib-emotion",
              test: /[\\/]node_modules[\\/]@emotion[\\/]/,
              chunks: "all",
              enforce: true,
              priority: 30,
            },
          },
        },
      },
    },
  },
  plugins: [
    pluginReact({ fastRefresh: true }),
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
      babelLoaderOptions(opts) {
        opts.plugins?.unshift("babel-plugin-react-compiler");
      },
    }),
  ],
});
