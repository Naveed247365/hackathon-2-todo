/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/chat',
        destination: 'http://localhost:5000/api/chat',
      },
      {
        source: '/mcp/:path*',
        destination: 'http://localhost:5000/:path*',
      },
      {
        source: '/api/todos/:path*',
        destination: 'http://localhost:8000/api/todos/:path*',
      },
      {
        source: '/health',
        destination: 'http://localhost:8000/health',
      },
    ];
  },
}

module.exports = nextConfig