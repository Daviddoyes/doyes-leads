import { Pie } from '@/components/Pie';

import {
  SeccionComoTrabajamos,
  SeccionFinal,
  SeccionGanas,
  SeccionMetodo,
  SeccionPartner,
  SeccionPreguntas,
  SeccionQueRecibes,
  SeccionTeSuena,
} from './Secciones';

/** Lo que va debajo de la primera pantalla de la portada: sin cabecera, "Contacto" va al final y al pie. */
export function RestoPortada() {
  return (
    <>
      <SeccionTeSuena />
      <SeccionGanas />
      <SeccionMetodo />
      <SeccionComoTrabajamos />
      <SeccionQueRecibes />
      <SeccionPreguntas />
      <SeccionPartner />
      <SeccionFinal conContacto />
    </>
  );
}

export function PieConContacto() {
  return <Pie conContacto />;
}
