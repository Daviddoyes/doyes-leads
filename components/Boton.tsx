import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variante = 'principal' | 'texto';

const VARIANTES: Record<Variante, string> = {
  principal:
    'min-h-14 rounded-boton bg-marino px-6 font-medium text-white transition-colors duration-150 ' +
    'hover:bg-marino-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70',
  // Acción secundaria: un enlace, no un segundo botón que compita con el principal.
  texto:
    'min-h-12 px-1 font-medium text-marino underline decoration-gris-azulado decoration-1 underline-offset-[6px] ' +
    'transition-colors duration-150 hover:decoration-marino',
};

export function getClasesBoton(variante: Variante = 'principal') {
  return `inline-flex items-center justify-center gap-2.5 text-center text-texto ${VARIANTES[variante]}`;
}

interface EnlaceBotonProps extends Omit<ComponentProps<'a'>, 'href'> {
  href: string;
  variante?: Variante;
  children: ReactNode;
}

/** Enlace con aspecto de botón. Los externos (agenda, correo) abren fuera de la web. */
export function EnlaceBoton({ href, variante, className = '', children, ...resto }: EnlaceBotonProps) {
  const clases = `${getClasesBoton(variante)} ${className}`;
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={clases} {...resto}>
        {children}
      </Link>
    );
  }
  const esWeb = href.startsWith('http');
  return (
    <a href={href} className={clases} {...(esWeb && { target: '_blank', rel: 'noopener noreferrer' })} {...resto}>
      {children}
    </a>
  );
}
