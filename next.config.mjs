import CopyPlugin from "copy-webpack-plugin";
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    if (!isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.resolve(process.cwd(), "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"),
              to: path.resolve(process.cwd(), "public/pdf.worker.min.mjs"),
            },
          ],
        })
      );
    }

    return config;
  },
};

export default nextConfig;
