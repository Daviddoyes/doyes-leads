import Image from 'next/image';

interface HablasConDavidProps {
  /** Si existe public/david.jpg (lib/foto-david.ts). Sin foto, un círculo con "DD". */
  conFoto: boolean;
  /** Sobre fondo oscuro (la llamada final de la portada). */
  invertido?: boolean;
}

export function HablasConDavid({ conFoto, invertido = false }: HablasConDavidProps) {
  return (
    <figure className="flex items-center gap-4 text-left">
      {conFoto ? (
        <Image
          src="/david.jpg"
          alt="David Domènech"
          width={112}
          height={112}
          className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-celeste/60"
        />
      ) : (
        <span
          aria-hidden="true"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-titulos text-lg font-semibold ring-2 ring-celeste/60 ${
            invertido ? 'bg-white text-marino' : 'bg-marino text-white'
          }`}
        >
          DD
        </span>
      )}
      <div className="text-sm leading-snug">
        <blockquote className={invertido ? 'text-white/85' : 'text-tinta-suave'}>
          <p>Hablarás directamente conmigo, no con un comercial.</p>
        </blockquote>
        <figcaption className={`mt-1 font-medium ${invertido ? 'text-white' : 'text-marino'}`}>
          — David Domènech, Doyes Digital.
        </figcaption>
      </div>
    </figure>
  );
}
