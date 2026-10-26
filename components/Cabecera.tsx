import Link from 'next/link';

import { BOTON_TEST } from '@/components/portada/contenido';

import { Logo } from './Logo';

interface CabeceraProps {
  /** En las páginas legales, el enlace al test. */
  conEnlaceTest?: boolean;
}

const ENLACE =
  'py-3 text-detalle font-medium text-tinta underline decoration-white/35 underline-offset-[6px] transition-colors duration-150 hover:decoration-celeste';

export function Cabecera({ conEnlaceTest = false }: CabeceraProps) {
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
      </div>
    </header>
  );
}
