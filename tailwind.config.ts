import type { Config } from 'tailwindcss';

// Los colores y tamaños salen de las variables de app/globals.css. Con una
// variable, Tailwind 3 no sabe aplicar transparencia (bg-fondo/90): se hace
// mezclando el color con transparente. Los tipos de Tailwind 3 no recogen los
// colores como función, aunque los admite.
const color = (nombre: string) =>
  (({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined || opacityValue === '1'
      ? `var(--color-${nombre})`
      : `color-mix(in srgb, var(--color-${nombre}) calc(${opacityValue} * 100%), transparent)`) as unknown as string;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    // Solo los tamaños de la escala: nada de tamaños sueltos.
    fontSize: {
      detalle: ['var(--tam-detalle)', { lineHeight: '1.5' }],
      texto: ['var(--tam-texto)', { lineHeight: '1.6' }],
      subtitulo: ['var(--tam-subtitulo)', { lineHeight: '1.3' }],
      pregunta: ['var(--tam-pregunta)', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
      titulo: ['var(--tam-titulo)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
      display: ['var(--tam-display)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
    },
    extend: {
      colors: {
        marino: { DEFAULT: color('marino'), hover: color('marino-hover') },
        celeste: color('celeste'),
        'gris-azulado': color('gris-azulado'),
        fondo: color('fondo'),
        superficie: color('superficie'),
        tinta: { DEFAULT: color('tinta'), suave: color('tinta-suave'), tenue: color('tinta-tenue') },
        linea: color('linea'),
        'borde-campo': color('borde-campo'),
        acento: color('acento'),
        exito: { DEFAULT: color('exito'), suave: color('exito-suave') },
        aviso: { DEFAULT: color('aviso'), suave: color('aviso-suave') },
        peligro: { DEFAULT: color('peligro'), suave: color('peligro-suave') },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        titulos: ['var(--font-poppins)', 'var(--font-inter)', 'ui-sans-serif', 'sans-serif'],
      },
      maxWidth: {
        lectura: '62ch',
        titular: '18ch',
      },
      borderRadius: {
        boton: '10px',
      },
    },
  },
  plugins: [],
};

export default config;
