import type { ReactNode } from 'react';

import { Cabecera } from './Cabecera';
import { Pie } from './Pie';

interface PaginaLegalProps {
  titulo: string;
  actualizado: string;
  children: ReactNode;
}

/** Aviso legal, privacidad y cookies: texto largo, cómodo de leer en el móvil. */
export function PaginaLegal({ titulo, actualizado, children }: PaginaLegalProps) {
  return (
    <>
      <Cabecera conEnlaceTest />
      <main className="flex-1 px-5 pb-20 pt-8 sm:px-8 lg:px-16 lg:pt-16">
        <article className="mx-auto max-w-[62ch] text-tinta-suave [&_a]:font-medium [&_a]:text-acento [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-3 [&_h2]:mt-12 [&_h2]:font-sans [&_h2]:text-subtitulo [&_h2]:font-semibold [&_h2]:tracking-[-0.01em] [&_h2]:text-tinta [&_li]:mt-2 [&_p]:mt-4 [&_strong]:font-medium [&_strong]:text-tinta [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
          <h1 className="font-titulos text-seccion font-extrabold uppercase text-tinta">{titulo}</h1>
          <p className="!mt-3 text-detalle text-tinta-tenue">Última actualización: {actualizado}</p>
          {children}
        </article>
      </main>
      <Pie />
    </>
  );
}

/** Datos en dos columnas que en el móvil se leen como una lista. */
export function TablaLegal({ filas }: { filas: [string, ReactNode][] }) {
  return (
    <dl className="mt-5 border-t border-white/10">
      {filas.map(([dato, valor]) => (
        <div key={dato} className="grid gap-1 border-b border-white/10 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
          <dt className="text-detalle text-tinta-tenue">{dato}</dt>
          <dd className="text-tinta">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
