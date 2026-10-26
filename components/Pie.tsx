import Link from 'next/link';

import { DATOS_EMPRESA, URL_CONTACTO } from '@/lib/marca';

import { AnoActual } from './AnoActual';

const LEGALES = [
  { href: '/aviso-legal', texto: 'Aviso legal' },
  { href: '/privacidad', texto: 'Privacidad' },
  { href: '/cookies', texto: 'Cookies' },
];

const ENLACE = 'underline-offset-4 transition-colors duration-150 hover:text-marino hover:underline';

interface PieProps {
  /** Sin cabecera (/v1, /v2), "Contacto" va aquí. */
  conContacto?: boolean;
}

export function Pie({ conContacto = false }: PieProps) {
  const contactoExterno = URL_CONTACTO.startsWith('http');
  return (
    <footer className="px-5 sm:px-8 lg:px-16">
      <div className="mx-auto grid max-w-[90rem] gap-8 border-t border-linea py-12 text-detalle text-tinta-tenue lg:grid-cols-12 lg:py-16">
        <address className="not-italic lg:col-span-4">
          <p className="font-medium text-marino">{DATOS_EMPRESA.nombreCorto}</p>
          <p>{DATOS_EMPRESA.cif}</p>
          <p>{DATOS_EMPRESA.direccionComercial}</p>
        </address>
        <div className="lg:col-span-4">
          {conContacto && (
            <p className="mb-2">
              <a
                href={URL_CONTACTO}
                className="font-medium text-marino underline decoration-gris-azulado underline-offset-4 transition-colors duration-150 hover:decoration-marino"
                {...(contactoExterno && { target: '_blank', rel: 'noopener noreferrer' })}
              >
                Contacto
              </a>
            </p>
          )}
          <p>
            <a href={`mailto:${DATOS_EMPRESA.email}`} className={ENLACE}>
              {DATOS_EMPRESA.email}
            </a>
          </p>
          <p>
            <a href={`tel:${DATOS_EMPRESA.telefonoEnlace}`} className={ENLACE}>
              {DATOS_EMPRESA.telefono}
            </a>
          </p>
        </div>
        <div className="lg:col-span-4">
          <ul className="flex flex-wrap gap-x-6">
            {LEGALES.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={`inline-block py-1 ${ENLACE}`}>
                  {l.texto}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2">
            © <AnoActual anoGenerado={new Date().getFullYear()} /> Doyes Digital
          </p>
        </div>
      </div>
    </footer>
  );
}
