import type { Metadata } from 'next';

import { EnlaceBoton } from '@/components/Boton';
import { Cabecera } from '@/components/Cabecera';
import { EscenaEngranajes } from '@/components/engranajes/EscenaEngranajes';
import { Pie } from '@/components/Pie';
import { MarcoNavegador } from '@/components/portada/MarcoNavegador';
import {
  MARGENES,
  SeccionComoTrabajamos,
  SeccionFinal,
  SeccionGanas,
  SeccionMetodo,
  SeccionPreguntas,
  SeccionQueRecibes,
  SeccionTeSuena,
} from '@/components/portada/Secciones';

import { BOTON_TEST, DOLORES, ENTREGABLES, GANAS, LINEA, METODO, PASOS, PIE_CAPTURA, PREGUNTAS, TITULAR } from './contenido';

// Versión de prueba de la portada: todo centrado y todo hacia el test. No se indexa.
export const metadata: Metadata = {
  title: 'Portada v1 (prueba)',
  robots: { index: false, follow: false },
};

export default function PortadaV1() {
  return (
    <>
      <Cabecera conContacto />
      <main id="contenido" className="flex-1">
        <section aria-labelledby="portada-titulo" className={`${MARGENES} text-center`}>
          <div className="mx-auto max-w-[90rem] pb-10 pt-2 lg:pb-16 lg:pt-10">
            <h1 id="portada-titulo" className="mx-auto text-portada font-semibold text-marino">
              {TITULAR.map((linea, i) => (
                <span key={linea} className="sm:block">
                  {i > 0 && ' '}
                  {linea}
                </span>
              ))}
            </h1>
            <p className="mx-auto mt-4 text-subtitulo text-tinta-suave lg:mt-6">
              {LINEA.map((frase, i) => (
                <span key={frase} className="block sm:inline">
                  {i > 0 && <span className="hidden sm:inline"> </span>}
                  {frase}
                </span>
              ))}
            </p>
            <EnlaceBoton href="/test" className="mt-6 w-full sm:w-auto sm:px-10 lg:mt-8">
              {BOTON_TEST}
            </EnlaceBoton>
            <div className="-mx-5 mt-2 sm:mx-0 lg:mt-4">
              <EscenaEngranajes />
            </div>
          </div>
        </section>

        <SeccionTeSuena dolores={DOLORES} alTest={BOTON_TEST} />
        <SeccionGanas titulo={GANAS.titulo} entradilla={GANAS.entradilla} texto={null} alTest={BOTON_TEST} />
        <SeccionMetodo oscura titulo={METODO.titulo} texto={METODO.texto} fases={METODO.fases} alTest={BOTON_TEST} />
        <SeccionComoTrabajamos pasos={PASOS} captura={<MarcoNavegador pie={PIE_CAPTURA} />} alTest={BOTON_TEST} />
        <SeccionQueRecibes entregables={ENTREGABLES} alTest={BOTON_TEST} />
        <SeccionPreguntas preguntas={PREGUNTAS} alTest={BOTON_TEST} />
        <SeccionFinal boton={BOTON_TEST} />
      </main>
      <Pie />
    </>
  );
}
