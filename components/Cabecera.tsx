import Link from 'next/link';

import { Logo } from './Logo';

interface CabeceraProps {
  /** Fuera del test, el único enlace: empezar el test. */
  conEnlaceTest?: boolean;
}

export function Cabecera({ conEnlaceTest = false }: CabeceraProps) {
  return (
    <header className="px-5 sm:px-8 lg:px-16">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 lg:h-24">
        <Link href="/" aria-label="IA360Empresas, ir a la portada">
          <Logo />
        </Link>
        {conEnlaceTest && (
          <Link
            href="/test"
            className="py-3 text-detalle font-medium text-marino underline decoration-gris-azulado underline-offset-[6px] transition-colors duration-150 hover:decoration-marino"
          >
            Empezar el test
          </Link>
        )}
      </div>
    </header>
  );
}
