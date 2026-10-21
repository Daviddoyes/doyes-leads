import { EnlaceBoton } from '@/components/Boton';
import { Cabecera } from '@/components/Cabecera';
import { Pie } from '@/components/Pie';

export default function NoEncontrada() {
  return (
    <>
      <Cabecera conNavegacion />
      <main className="flex flex-1 items-center px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-acento">Error 404</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-marino">Esta página no existe</h1>
          <p className="mt-4 text-tinta-suave">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <EnlaceBoton href="/test">Haz el Test IA360</EnlaceBoton>
            <EnlaceBoton href="/" variante="secundario">
              Ir a la portada
            </EnlaceBoton>
          </div>
        </div>
      </main>
      <Pie />
    </>
  );
}
