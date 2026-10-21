import Image from 'next/image';

import { EMPRESA, PRODUCTO } from '@/lib/marca';
import simbolo from '@/public/marca/simbolo.png';

/** Marca del producto, como en el portal: símbolo "dD" + IA360Empresas y, debajo, "por Doyes Digital". */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      {/* El nombre va en texto al lado: para lectores de pantalla el símbolo es decorativo. */}
      <Image src={simbolo} alt="" className="h-8 w-auto sm:h-9" priority />
      <span className="flex flex-col">
        <span className="whitespace-nowrap font-titulos text-lg font-semibold leading-none tracking-tight text-marino sm:text-xl sm:leading-none">
          {PRODUCTO}
        </span>
        <span className="mt-1 whitespace-nowrap text-xs leading-none text-tinta-tenue">por {EMPRESA}</span>
      </span>
    </span>
  );
}
