/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "@blog-manage/shared-seo",
    "@blog-manage/shared-ui",
    "@blog-manage/shared-adsense",
  ],
};

export default nextConfig;
