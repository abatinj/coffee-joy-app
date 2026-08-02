/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;

// Tambahkan ini agar halaman tidak di-static-kan
export const dynamic = 'force-dynamic';