import Link from 'next/link';

import { DATOS_EMPRESA } from '@/lib/marca';

import { AnoActual } from './AnoActual';

const LEGALES = [
  { href: '/aviso-legal', texto: 'Aviso legal' },
  { href: '/privacidad', texto: 'Política de privacidad' },
  { href: '/cookies', texto: 'Cookies' },
];

export function Pie() {
  return (
    <footer className="border-t border-borde bg-superficie">
      <div className="mx-auto max-w-6xl px-4 py-10 text-xs text-tinta-tenue sm:px-6">
        <p className="leading-relaxed">
          {DATOS_EMPRESA.nombreCorto} · {DATOS_EMPRESA.cif} · {DATOS_EMPRESA.direccionCorta}
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> · </span>
          <a href={`mailto:${DATOS_EMPRESA.email}`} className="underline-offset-2 hover:text-marino hover:underline">
            {DATOS_EMPRESA.email}
          </a>
          {' · '}
          <a href={`tel:${DATOS_EMPRESA.telefonoEnlace}`} className="underline-offset-2 hover:text-marino hover:underline">
            {DATOS_EMPRESA.telefono}
          </a>
        </p>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGALES.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-block py-1 underline-offset-2 hover:text-marino hover:underline">
                  {l.texto}
                </Link>
              </li>
            ))}
          </ul>
          <p>
            © <AnoActual anoGenerado={new Date().getFullYear()} /> Doyes Digital
          </p>
        </div>
      </div>
    </footer>
  );
}
