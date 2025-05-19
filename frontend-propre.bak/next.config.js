/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'], // Pour permettre le chargement d'images depuis Unsplash
  },
};

module.exports = nextConfig; 