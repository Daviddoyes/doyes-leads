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
      <Cabecera conNavegacion />
      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <article
          className="mx-auto max-w-2xl text-tinta-suave [&_a]:font-medium [&_a]:text-acento [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-acento-hover [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-marino [&_li]:mt-1.5 [&_p]:mt-3 [&_strong]:font-semibold [&_strong]:text-marino [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
        >
          <h1 className="text-3xl font-semibold tracking-tight text-marino">{titulo}</h1>
          <p className="!mt-2 text-xs text-tinta-tenue">Última actualización: {actualizado}</p>
          {children}
        </article>
      </main>
      <Pie />
    </>
  );
}

/** Tabla de dos columnas que en el móvil se lee como una lista. */
export function TablaLegal({ filas }: { filas: [string, ReactNode][] }) {
  return (
    <dl className="mt-4 divide-y divide-borde rounded-2xl border border-borde bg-superficie">
      {filas.map(([dato, valor]) => (
        <div key={dato} className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-tinta-tenue sm:pt-0.5">{dato}</dt>
          <dd className="text-tinta">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
