import Link from 'next/link';

import { BOTON_TEST } from '@/components/portada/contenido';
import { URL_CONTACTO } from '@/lib/marca';

import { Logo } from './Logo';

interface CabeceraProps {
  /** En las páginas legales, el enlace al test. */
  conEnlaceTest?: boolean;
  /** Cabecera mínima de la portada: solo "Contacto", pequeño, a la derecha. */
  conContacto?: boolean;
}

const ENLACE =
  'py-3 text-detalle font-medium text-marino underline decoration-gris-azulado underline-offset-[6px] transition-colors duration-150 hover:decoration-marino';

export function Cabecera({ conEnlaceTest = false, conContacto = false }: CabeceraProps) {
  const contactoExterno = URL_CONTACTO.startsWith('http');
  return (
    <header className="px-5 sm:px-8 lg:px-16">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 lg:h-24">
        <Link href="/" aria-label="IA360Empresas, ir a la portada">
          <Logo />
        </Link>
        {conEnlaceTest && (
          <Link href="/test" className={ENLACE}>
            {BOTON_TEST}
          </Link>
        )}
        {conContacto && (
          <a href={URL_CONTACTO} className={ENLACE} {...(contactoExterno && { target: '_blank', rel: 'noopener noreferrer' })}>
            Contacto
          </a>
        )}
      </div>
    </header>
  );
}
