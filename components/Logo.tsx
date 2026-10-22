import Image from 'next/image';

import simbolo from '@/public/marca/simbolo.png';

/**
 * Logotipo IA360Empresas, "peso partido": el símbolo dD y el nombre en una
 * línea, con IA360 en negrita y Empresas en peso normal, del mismo color.
 */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-3">
      {/* El nombre va en texto al lado: para lectores de pantalla el símbolo es decorativo. */}
      <Image src={simbolo} alt="" className="h-9 w-auto shrink-0 sm:h-10" priority />
      <span className="whitespace-nowrap font-titulos text-[1.5rem] leading-none tracking-[-0.025em] text-marino sm:text-[1.75rem]">
        <span className="font-bold">IA360</span>
        <span className="font-normal">Empresas</span>
      </span>
    </span>
  );
}
