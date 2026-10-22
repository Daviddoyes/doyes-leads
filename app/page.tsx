import { EnlaceBoton } from '@/components/Boton';
import { Cabecera } from '@/components/Cabecera';
import { DelEnredoAlFlujo } from '@/components/DelEnredoAlFlujo';
import { Pie } from '@/components/Pie';
import { SUBTITULO, TITULAR } from '@/components/portada/contenido';
import {
  CONTENEDOR,
  MARGENES,
  SeccionComoTrabajamos,
  SeccionFinal,
  SeccionGanas,
  SeccionMetodo,
  SeccionPreguntas,
  SeccionQueRecibes,
  SeccionTeSuena,
} from '@/components/portada/Secciones';
import { URL_CONTACTO } from '@/lib/marca';

export default function Portada() {
  return (
    <>
      {/* Sin enlace al test en la cabecera: el botón principal está justo debajo. */}
      <Cabecera />
      <main id="contenido" className="flex-1">
        {/* Portada: lo único audaz de la web. */}
        <section aria-labelledby="portada-titulo" className={MARGENES}>
          <div className={`${CONTENEDOR} grid items-center gap-14 pb-20 pt-6 lg:grid-cols-12 lg:gap-8 lg:pb-32 lg:pt-16`}>
            <div className="lg:col-span-6">
              <h1 id="portada-titulo" className="max-w-[12ch] text-display font-semibold text-marino">
                {TITULAR}
              </h1>
              <p className="mt-5 max-w-[46ch] text-texto text-tinta-suave lg:mt-8">{SUBTITULO}</p>
              <div className="mt-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-8 lg:mt-10">
                <EnlaceBoton href="/test">Empezar el test (3 minutos)</EnlaceBoton>
                <EnlaceBoton href={URL_CONTACTO} variante="texto" className="self-start sm:self-auto">
                  Contacto
                </EnlaceBoton>
              </div>
            </div>
            <div className="lg:col-span-6 lg:pl-8">
              <DelEnredoAlFlujo />
            </div>
          </div>
        </section>

        <SeccionTeSuena />
        <SeccionGanas />
        <SeccionMetodo />
        <SeccionComoTrabajamos />
        <SeccionQueRecibes />
        <SeccionPreguntas />
        <SeccionFinal />
      </main>
      <Pie />
    </>
  );
}
