import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['famtonvhjqhzrohpujls.supabase.co'], // Replace with your actual Supabase project domain
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

export default nextConfig
