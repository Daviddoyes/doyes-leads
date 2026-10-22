import Image from 'next/image';

interface HablasConDavidProps {
  /** Si existe public/david.jpg (lib/foto-david.ts). Sin foto, un círculo con "DD". */
  conFoto: boolean;
}

export function HablasConDavid({ conFoto }: HablasConDavidProps) {
  return (
    <figure className="flex items-center gap-4">
      {conFoto ? (
        <Image src="/david.jpg" alt="David Domènech" width={112} height={112} className="h-14 w-14 shrink-0 rounded-full object-cover" />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-marino font-titulos text-detalle font-semibold text-white"
        >
          DD
        </span>
      )}
      <div className="max-w-[30ch] text-detalle">
        <blockquote className="text-tinta-suave">
          <p>Hablarás directamente conmigo, no con un comercial.</p>
        </blockquote>
        <figcaption className="mt-1 font-medium text-marino">David Domènech, Doyes Digital</figcaption>
      </div>
    </figure>
  );
}
