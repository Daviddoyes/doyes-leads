import { EnlaceBoton } from '@/components/Boton';
import { Cabecera } from '@/components/Cabecera';
import { Pie } from '@/components/Pie';

export default function NoEncontrada() {
  return (
    <>
      <Cabecera />
      <main className="flex-1 px-5 py-20 sm:px-8 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[90rem]">
          <p className="text-detalle text-tinta-tenue">Error 404</p>
          <h1 className="mt-2 max-w-[16ch] text-titulo text-marino">Esta página no existe</h1>
          <p className="mt-4 max-w-lectura text-tinta-suave">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-8">
            <EnlaceBoton href="/test">Empezar el test</EnlaceBoton>
            <EnlaceBoton href="/" variante="texto" className="self-center sm:self-auto">
              Ir a la portada
            </EnlaceBoton>
          </div>
        </div>
      </main>
      <Pie />
    </>
  );
}
