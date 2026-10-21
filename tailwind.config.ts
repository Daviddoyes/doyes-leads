import type { Config } from 'tailwindcss';

// Los colores y tamaños salen de las variables de app/globals.css. Con una
// variable, Tailwind 3 no sabe aplicar transparencia (bg-fondo/90): se hace
// mezclando el color con transparente.
// Los tipos de Tailwind 3 no recogen los colores como función, aunque los admite.
const color = (nombre: string) =>
  (({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined || opacityValue === '1'
      ? `var(--color-${nombre})`
      : `color-mix(in srgb, var(--color-${nombre}) calc(${opacityValue} * 100%), transparent)`) as unknown as string;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marino: { DEFAULT: color('marino'), hover: color('marino-hover') },
        celeste: { DEFAULT: color('celeste'), suave: color('celeste-suave') },
        'gris-azulado': color('gris-azulado'),
        fondo: color('fondo'),
        superficie: color('superficie'),
        tinta: { DEFAULT: color('tinta'), suave: color('tinta-suave'), tenue: color('tinta-tenue') },
        borde: { DEFAULT: color('borde'), fuerte: color('borde-fuerte'), campo: color('borde-campo') },
        acento: { DEFAULT: color('acento'), hover: color('acento-hover') },
        exito: { DEFAULT: color('exito'), suave: color('exito-suave') },
        aviso: { DEFAULT: color('aviso'), suave: color('aviso-suave') },
        peligro: { DEFAULT: color('peligro'), suave: color('peligro-suave') },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        titulos: ['var(--font-poppins)', 'var(--font-inter)', 'ui-sans-serif', 'sans-serif'],
      },
      fontSize: {
        xs: ['var(--tam-xs)', { lineHeight: '1.5' }],
        sm: ['var(--tam-sm)', { lineHeight: '1.6' }],
        base: ['var(--tam-base)', { lineHeight: '1.55' }],
        lg: ['var(--tam-lg)', { lineHeight: '1.4' }],
        xl: ['var(--tam-xl)', { lineHeight: '1.35' }],
        '2xl': ['var(--tam-2xl)', { lineHeight: '1.2' }],
        '3xl': ['var(--tam-3xl)', { lineHeight: '1.15' }],
        '4xl': ['var(--tam-4xl)', { lineHeight: '1.08' }],
      },
    },
  },
  plugins: [],
};

export default config;
