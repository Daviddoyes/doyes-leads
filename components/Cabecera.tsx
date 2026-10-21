import Link from 'next/link';

import { EnlaceBoton } from './Boton';
import { Logo } from './Logo';

interface CabeceraProps {
  /** En la portada, el botón al test y los enlaces a cada sección. */
  conNavegacion?: boolean;
}

const SECCIONES = [
  { href: '/#metodo', texto: 'Método' },
  { href: '/#como-trabajamos', texto: 'Cómo trabajamos' },
  { href: '/#preguntas', texto: 'Preguntas' },
];

export function Cabecera({ conNavegacion = false }: CabeceraProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-borde/70 bg-fondo/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6">
        <Link href="/" aria-label="IA360Empresas, ir a la portada" className="rounded-md">
          <Logo />
        </Link>
        {conNavegacion && (
          <nav aria-label="Secciones" className="flex items-center gap-6">
            <ul className="hidden items-center gap-6 lg:flex">
              {SECCIONES.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className="text-sm text-tinta-suave transition-colors duration-200 hover:text-marino">
                    {s.texto}
                  </a>
                </li>
              ))}
            </ul>
            <EnlaceBoton href="/test" className="!min-h-10 !px-4">
              Haz el test
            </EnlaceBoton>
          </nav>
        )}
      </div>
    </header>
  );
}
