import type { NextConfig } from "next";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Tắt Next.js DevTools
  // devIndicators: {
  //   buildActivity: false, // Tắt indicator build
  //   appIsrStatus: false,  // Tắt ISR status
  // },
  // Tắt error overlay (popup báo lỗi đỏ)
  reactStrictMode: false,
  // Cấu hình cho external images (ảnh demo - CHỈ DÙNG DEV)
  /*images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'st.ourhtmldemo.com',
        pathname: '/template/organic_store/images/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'nongsandungha.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      }
      
    ],
  },*/
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Cho phép tất cả các nguồn ảnh từ HTTPS (Cực kỳ hữu dụng khi làm Dev)
      },
      {
        protocol: 'http',
        hostname: 'localhost', // Cho phép ảnh từ localhost nếu bạn chạy local
      },
    ],
  },
} as NextConfig; // Ép kiểu để bypass lỗi kiểm tra thuộc tính của TypeScript

export default nextConfig;
