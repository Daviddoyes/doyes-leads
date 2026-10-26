/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      // La página del formulario antiguo: los enlaces que circulan llevan al test.
      { source: '/diagnostico', destination: '/test', permanent: true },
      // Las portadas de prueba: la elegida (/v3) ya es la portada.
      { source: '/v1', destination: '/', permanent: false },
      { source: '/v2', destination: '/', permanent: false },
      { source: '/v3', destination: '/', permanent: false },
    ];
  },
};

module.exports = nextConfig;
