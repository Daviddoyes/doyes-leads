import type { ReactNode } from 'react';

import type { Metadata } from 'next';

import { Logo } from '@/components/Logo';
import { LogoPropuesta, type Propuesta } from '@/components/LogoPropuestas';

// Página de prueba para elegir el logotipo de la cabecera. No se indexa.
export const metadata: Metadata = {
  title: 'Logotipos (prueba)',
  robots: { index: false, follow: false },
};

const PROPUESTAS: { numero: Propuesta; nombre: string; texto: string }[] = [
  {
    numero: 1,
    nombre: 'Firma',
    texto: 'El símbolo y el nombre, en una línea y más grandes. "por Doyes Digital" pasa al pie de la web.',
  },
  {
    numero: 2,
    nombre: 'Peso partido',
    texto:
      'IA360 en negrita y Empresas en peso normal, del mismo color. El nombre se lee en dos golpes sin resaltar nada con color.',
  },
  {
    numero: 3,
    nombre: 'Con firma discreta',
    texto: 'Como la primera, con "por Doyes Digital" pequeño en la misma línea, tras una línea fina. En el móvil se oculta.',
  },
];

/** Una cabecera de muestra: el logotipo a la izquierda y el enlace de contacto a la derecha. */
function CabeceraMuestra({ children, oscuro = false, movil = false }: { children: ReactNode; oscuro?: boolean; movil?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border ${movil ? 'h-16 px-5' : 'h-24 px-8'} ${
        oscuro ? 'border-marino bg-marino' : 'border-linea bg-fondo'
      }`}
    >
      {children}
      <span
        className={`text-detalle font-medium underline underline-offset-[6px] ${
          oscuro ? 'text-white decoration-white/50' : 'text-marino decoration-gris-azulado'
        } ${movil ? 'hidden' : ''}`}
      >
        Contacto
      </span>
    </div>
  );
}

export default function Logos() {
  return (
    <main className="mx-auto w-full max-w-[90rem] px-5 py-12 sm:px-8 lg:px-16 lg:py-20">
      <h1 className="text-titulo text-marino">Logotipos para la cabecera</h1>
      <p className="mt-4 max-w-lectura text-tinta-suave">
        Tres propuestas en una sola línea, con el símbolo dD y Poppins. Cada una en la cabecera, sobre fondo claro y
        sobre marino, y en el ancho de un móvil.
      </p>

      <section aria-labelledby="actual" className="mt-14 border-t border-linea pt-10">
        <h2 id="actual" className="text-subtitulo text-marino">
          Ahora
        </h2>
        <div className="mt-6">
          <CabeceraMuestra>
            <Logo />
          </CabeceraMuestra>
        </div>
      </section>

      {PROPUESTAS.map((p) => (
        <section key={p.numero} aria-labelledby={`propuesta-${p.numero}`} className="mt-14 border-t border-linea pt-10">
          <h2 id={`propuesta-${p.numero}`} className="text-subtitulo text-marino">
            Propuesta {p.numero}. {p.nombre}
          </h2>
          <p className="mt-2 max-w-lectura text-tinta-suave">{p.texto}</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_23.4375rem] lg:gap-8">
            <div className="space-y-4">
              <CabeceraMuestra>
                <LogoPropuesta propuesta={p.numero} />
              </CabeceraMuestra>
              <CabeceraMuestra oscuro>
                <LogoPropuesta propuesta={p.numero} oscuro />
              </CabeceraMuestra>
            </div>
            {/* El ancho de un móvil (375 px). */}
            <div className="space-y-4">
              <CabeceraMuestra movil>
                <LogoPropuesta propuesta={p.numero} compacto />
              </CabeceraMuestra>
              <CabeceraMuestra movil oscuro>
                <LogoPropuesta propuesta={p.numero} oscuro compacto />
              </CabeceraMuestra>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
