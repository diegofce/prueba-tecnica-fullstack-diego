/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  // ESTO ES LO CRUCIAL: Mapeo de rutas para el alias @/
  // Esto le dice a Webpack (el empaquetador de Next.js) cómo resolver las rutas.
  webpack: (config) => {
    // Asegura que '@/components' apunta a la carpeta 'components'
    config.resolve.alias['@/components'] = path.join(__dirname, 'components');
    // Asegura que '@/lib' apunta a la carpeta 'lib'
    config.resolve.alias['@/lib'] = path.join(__dirname, 'lib');
    // Si usas rutas como '@/page' o solo '@' para la raíz, también las puedes agregar:
    // config.resolve.alias['@/pages'] = path.join(__dirname, 'pages');
    // config.resolve.alias['@'] = path.join(__dirname, '');

    return config;
  },
};

module.exports = nextConfig;
