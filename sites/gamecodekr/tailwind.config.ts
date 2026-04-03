import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/shared-ui/src/**/*.{ts,tsx}",
    "../../packages/shared-adsense/src/**/*.{ts,tsx}",
  ],
};

export default config;
