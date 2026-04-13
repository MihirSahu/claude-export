import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "export",
  outputFileTracingRoot: path.join(configDir, ".."),
  images: {
    unoptimized: true
  },
  trailingSlash: true
};

export default nextConfig;
