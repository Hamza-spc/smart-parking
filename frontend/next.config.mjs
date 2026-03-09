import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/backend-api/:path*',
                destination: 'http://localhost:8080/api/:path*',
            },
        ]
    },
};

export default withNextIntl(nextConfig);
