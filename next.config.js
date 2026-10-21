/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      // La página del formulario antiguo: los enlaces que circulan llevan al test.
      { source: '/diagnostico', destination: '/test', permanent: true },
    ];
  },
};

module.exports = nextConfig;
