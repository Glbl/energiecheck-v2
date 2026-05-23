/** @type {import('next').NextConfig} */
const nextConfig = {eslint: {
    // ✅ Esto le ordena a Vercel compilar el proyecto ignorando cualquier conflicto de ESLint
    ignoreDuringBuilds: true,
},
};

export default nextConfig;
