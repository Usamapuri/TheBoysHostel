/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignore build errors due to Next.js 16 type generation bug
    // TODO: Re-enable when Next.js fixes AppRouteHandlerRoutes type export
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
