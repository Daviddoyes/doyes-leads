'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { URL_WHATSAPP } from '@/lib/marca';

/** Esquina que ocupa el botón (16 px de margen + 56 de botón) y un poco de aire. */
const ZONA = 88;
const INTERACTIVOS = 'a, button, summary, input, select, textarea, label';

/**
 * Botón flotante de WhatsApp, abajo a la derecha, en cristal oscuro. Fuera del
 * test, y se aparta mientras haya un botón o enlace debajo, para no taparlo.
 */
export function BotonWhatsApp() {
  const ruta = usePathname();
  const enTest = ruta.startsWith('/test');
  const propio = useRef<HTMLAnchorElement>(null);
  // Oculto hasta la primera medición, para que no asome un instante encima de un botón.
  const [tapando, setTapando] = useState(true);

  useEffect(() => {
    if (enTest) return;
    let observador: IntersectionObserver | null = null;
    const debajo = new Set<Element>();

    // Cada página tiene sus propios enlaces: se vuelven a buscar al cambiar de ruta.
    // El observador mira solo la esquina del botón: se recrea al cambiar el tamaño de la ventana.
    function observar() {
      observador?.disconnect();
      debajo.clear();
      const margen = `${ZONA - window.innerHeight}px 0px 0px ${ZONA - window.innerWidth}px`;
      observador = new IntersectionObserver(
        (entradas) => {
          entradas.forEach((e) => (e.isIntersecting ? debajo.add(e.target) : debajo.delete(e.target)));
          setTapando(debajo.size > 0);
        },
        { rootMargin: margen },
      );
      Array.from(document.querySelectorAll(INTERACTIVOS))
        .filter((el) => el !== propio.current)
        .forEach((el) => observador?.observe(el));
    }

    observar();
    window.addEventListener('resize', observar);
    return () => {
      window.removeEventListener('resize', observar);
      observador?.disconnect();
    };
  }, [ruta, enTest]);

  if (enTest) return null;

  return (
    <a
      ref={propio}
      href={URL_WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      tabIndex={tapando ? -1 : undefined}
      className={`fixed bottom-4 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#030a26]/70 text-tinta shadow-[inset_0_0_0_1px_rgba(150,210,255,0.28),inset_0_1px_0_rgba(255,255,255,0.08),0_0_22px_-6px_rgba(21,168,245,0.55),0_8px_24px_-8px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-200 hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(170,228,255,0.5),inset_0_1px_0_rgba(255,255,255,0.1),0_0_30px_-4px_rgba(21,168,245,0.7),0_8px_24px_-8px_rgba(0,0,0,0.8)] sm:bottom-6 sm:right-6 ${
        tapando ? 'pointer-events-none translate-y-2 opacity-0' : 'opacity-100'
      }`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7">
        <path
          d="M12 3a9 9 0 0 0-7.75 13.57L3 21l4.56-1.2A9 9 0 1 0 12 3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          transform="translate(6.6 6.6) scale(0.45)"
          fill="currentColor"
          d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        />
      </svg>
    </a>
  );
}
