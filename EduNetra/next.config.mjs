/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Increase body size limit for video uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb'
    }
  },
  

};

export default nextConfig;


