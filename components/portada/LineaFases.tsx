'use client';

import { useEffect, useRef, useState } from 'react';

interface Fase {
  nombre: string;
  descripcion: string;
}

interface Tramo {
  x: number;
  y: number;
  largo: number;
  horizontal: boolean;
}

/*
 * Las cinco fases del método, unidas por una línea de luz celeste: a medida que
 * se baja, la línea avanza y cada nodo se enciende al llegar a él. En escritorio
 * va en horizontal; en móvil, en vertical. Es la única animación al hacer
 * scroll de toda la página. Con "reducir movimiento", todo encendido desde el
 * principio.
 */
export function LineaFases({ fases }: { fases: Fase[] }) {
  const cajaRef = useRef<HTMLDivElement>(null);
  const nodosRef = useRef<(HTMLSpanElement | null)[]>([]);
  // De 0 (nada encendido) a 1 (la línea entera).
  const [avance, setAvance] = useState(0);
  const [tramo, setTramo] = useState<Tramo | null>(null);
  const [fijo, setFijo] = useState(false);

  useEffect(() => {
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setFijo(reducir);
    let fotograma = 0;

    // La línea va del centro del primer nodo al centro del último.
    const medirLinea = () => {
      const caja = cajaRef.current?.getBoundingClientRect();
      const primero = nodosRef.current[0]?.getBoundingClientRect();
      const ultimo = nodosRef.current[fases.length - 1]?.getBoundingClientRect();
      if (!caja || !primero || !ultimo) return;
      const x0 = primero.left + primero.width / 2 - caja.left;
      const y0 = primero.top + primero.height / 2 - caja.top;
      const horizontal = Math.abs(ultimo.top - primero.top) < 4;
      const largo = horizontal ? ultimo.left + ultimo.width / 2 - caja.left - x0 : ultimo.top + ultimo.height / 2 - caja.top - y0;
      setTramo({ x: x0, y: y0, largo, horizontal });
    };

    // El avance sale de dónde está la lista en la pantalla al bajar.
    const medirAvance = () => {
      fotograma = 0;
      const caja = cajaRef.current?.getBoundingClientRect();
      if (!caja) return;
      const alto = window.innerHeight;
      const horizontal = window.innerWidth >= 1024;
      const t = horizontal ? (alto * 0.85 - caja.top) / (alto * 0.4) : (alto * 0.72 - caja.top) / Math.max(caja.height, 1);
      setAvance(Math.min(Math.max(t, 0), 1));
    };

    medirLinea();
    if (reducir) {
      setAvance(1);
      window.addEventListener('resize', medirLinea);
      return () => window.removeEventListener('resize', medirLinea);
    }
    medirAvance();
    const alDesplazar = () => {
      if (!fotograma) fotograma = requestAnimationFrame(medirAvance);
    };
    const alRedimensionar = () => {
      medirLinea();
      alDesplazar();
    };
    window.addEventListener('scroll', alDesplazar, { passive: true });
    window.addEventListener('resize', alRedimensionar);
    return () => {
      cancelAnimationFrame(fotograma);
      window.removeEventListener('scroll', alDesplazar);
      window.removeEventListener('resize', alRedimensionar);
    };
  }, [fases.length]);

  const tramos = fases.length - 1;
  const recorrido = tramo ? tramo.largo * avance : 0;
  const linea = (largo: number) =>
    tramo && (tramo.horizontal ? { left: tramo.x, top: tramo.y, width: largo, height: 1 } : { left: tramo.x, top: tramo.y, width: 1, height: largo });

  return (
    <div ref={cajaRef} className="relative lg:mt-10">
      {tramo && (
        <div aria-hidden="true">
          {/* Apagada de fondo y, encima, la parte ya recorrida, encendida. */}
          <span
            className={`absolute bg-white/15 ${tramo.horizontal ? '-translate-y-1/2' : '-translate-x-1/2'}`}
            style={linea(tramo.largo) ?? undefined}
          />
          <span
            className={`absolute bg-celeste shadow-[0_0_12px_1px_rgba(21,168,245,0.9)] ${tramo.horizontal ? '-translate-y-1/2' : '-translate-x-1/2'} ${
              fijo ? '' : 'transition-[width,height] duration-150 ease-out'
            }`}
            style={linea(recorrido) ?? undefined}
          />
        </div>
      )}
      <ol className="relative grid gap-10 lg:grid-cols-5 lg:gap-6">
        {fases.map((f, i) => {
          const encendida = avance >= i / tramos - 0.005;
          return (
            <li key={f.nombre} className="grid grid-cols-[1.25rem_1fr] gap-x-5 lg:block">
              <span
                ref={(nodo) => {
                  nodosRef.current[i] = nodo;
                }}
                aria-hidden="true"
                className={`relative mt-1 block h-5 w-5 rounded-full border transition-all duration-500 lg:mt-0 ${
                  encendida
                    ? 'border-[#bfe9ff] bg-celeste shadow-[0_0_0_4px_rgba(21,168,245,0.18),0_0_18px_3px_rgba(21,168,245,0.75)]'
                    : 'border-white/30 bg-[#030a26]'
                }`}
              />
              <div className="lg:mt-7">
                <p className={`text-detalle transition-colors duration-500 ${encendida ? 'text-[#9fdcff]' : 'text-tinta-tenue'}`}>Fase {i + 1}</p>
                <h3 className="mt-1 text-subtitulo text-tinta">{f.nombre}</h3>
                <p className="mt-2 max-w-[30ch] text-detalle text-tinta-suave">{f.descripcion}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
