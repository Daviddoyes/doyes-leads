import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variante = 'principal' | 'secundario';
type Tamano = 'normal' | 'grande';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTES: Record<Variante, string> = {
  principal: 'bg-marino text-white shadow-sm hover:bg-marino-hover active:scale-[0.98]',
  secundario: 'border border-borde-fuerte bg-superficie text-marino hover:border-marino active:scale-[0.98]',
};

const TAMANOS: Record<Tamano, string> = {
  normal: 'min-h-11 px-5 text-sm',
  grande: 'min-h-14 px-7 text-base',
};

export function getClasesBoton(variante: Variante = 'principal', tamano: Tamano = 'normal') {
  return `${BASE} ${VARIANTES[variante]} ${TAMANOS[tamano]}`;
}

interface EnlaceBotonProps extends Omit<ComponentProps<'a'>, 'href'> {
  href: string;
  variante?: Variante;
  tamano?: Tamano;
  children: ReactNode;
}

/** Enlace con aspecto de botón. Los enlaces externos (agenda, correo) abren fuera de la web. */
export function EnlaceBoton({ href, variante, tamano, className = '', children, ...resto }: EnlaceBotonProps) {
  const clases = `${getClasesBoton(variante, tamano)} ${className}`;
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={clases} {...resto}>
        {children}
      </Link>
    );
  }
  const esWeb = href.startsWith('http');
  return (
    <a
      href={href}
      className={clases}
      {...(esWeb && { target: '_blank', rel: 'noopener noreferrer' })}
      {...resto}
    >
      {children}
    </a>
  );
}

export function Flecha() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 shrink-0" fill="none">
      <path d="M4 10h11m0 0-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
