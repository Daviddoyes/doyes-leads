import { Poppins } from 'next/font/google';
import Image from 'next/image';

import { EMPRESA, PRODUCTO } from '@/lib/marca';
import simbolo from '@/public/marca/simbolo.png';
// El mismo símbolo con la "D" en blanco, para fondo marino.
import simboloClaro from '@/public/marca/simbolo-claro.png';

// Propuestas de logotipo para elegir en /logos. Cuando haya una elegida, pasa a components/Logo.tsx.

// La propuesta 2 usa dos pesos que el resto de la web no carga: solo se descargan en /logos.
const poppinsPesos = Poppins({ subsets: ['latin'], weight: ['400', '700'], display: 'swap' });

export type Propuesta = 1 | 2 | 3;

interface LogoPropuestaProps {
  propuesta: Propuesta;
  oscuro?: boolean;
  /** El tamaño del móvil, sea cual sea la pantalla (para las muestras de /logos). */
  compacto?: boolean;
}

export function LogoPropuesta({ propuesta, oscuro = false, compacto = false }: LogoPropuestaProps) {
  const color = oscuro ? 'text-white' : 'text-marino';
  // Las clases van completas (Tailwind no ve las que se montan al vuelo): móvil, o móvil y escritorio.
  const tam = (movil: string, responsiva: string) => (compacto ? movil : responsiva);
  const simboloImagen = (
    <Image src={oscuro ? simboloClaro : simbolo} alt="" className={`w-auto shrink-0 ${tam('h-9', 'h-9 sm:h-11')}`} priority />
  );

  if (propuesta === 1) {
    return (
      <span className="inline-flex items-center gap-3">
        {simboloImagen}
        <span className={`font-titulos font-semibold leading-none tracking-[-0.02em] ${tam('text-[1.5rem]', 'text-[1.5rem] sm:text-[1.875rem]')} ${color}`}>
          {PRODUCTO}
        </span>
      </span>
    );
  }

  if (propuesta === 2) {
    return (
      <span className="inline-flex items-center gap-3">
        {simboloImagen}
        <span className={`${poppinsPesos.className} leading-none tracking-[-0.025em] ${tam('text-[1.5rem]', 'text-[1.5rem] sm:text-[1.875rem]')} ${color}`}>
          <span className="font-bold">IA360</span>
          <span className="font-normal">Empresas</span>
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-3">
      {simboloImagen}
      <span className={`font-titulos font-semibold leading-none tracking-[-0.02em] ${tam('text-[1.375rem]', 'text-[1.375rem] sm:text-[1.75rem]')} ${color}`}>
        {PRODUCTO}
      </span>
      <span
        className={`items-center gap-3 text-detalle leading-none ${compacto ? 'hidden' : 'hidden sm:inline-flex'} ${
          oscuro ? 'text-white/60' : 'text-tinta-tenue'
        }`}
      >
        <span aria-hidden="true" className={`h-6 w-px ${oscuro ? 'bg-white/30' : 'bg-gris-azulado'}`} />
        por {EMPRESA}
      </span>
    </span>
  );
}
