/*
 * PENDIENTE DE REVISIÓN LEGAL. Texto redactado como primera versión; debe
 * revisarlo un abogado antes de darlo por definitivo. Si algún día se añade
 * analítica, píxeles de Meta o cualquier cookie que no sea técnica, esta página
 * deja de ser válida y hará falta un banner de consentimiento.
 */
import type { Metadata } from 'next';

import { PaginaLegal } from '@/components/PaginaLegal';
import { DATOS_EMPRESA as D } from '@/lib/marca';

export const metadata: Metadata = {
  title: 'Política de cookies',
  description: 'Esta web no usa cookies de seguimiento ni de publicidad.',
  alternates: { canonical: '/cookies' },
};

export default function Cookies() {
  return (
    <PaginaLegal titulo="Política de cookies" actualizado="octubre de 2026">
      <h2>Esta web no usa cookies</h2>
      <p>
        Las cookies son pequeños archivos que algunas webs guardan en tu navegador, a menudo para seguir lo que haces o
        enseñarte publicidad. <strong>Esta web no instala cookies</strong>: ni de analítica, ni de publicidad, ni de redes
        sociales. Por eso no te mostramos ningún aviso para aceptarlas.
      </p>
      <p>
        Tampoco cargamos contenido de terceros que pueda instalarlas: las fuentes tipográficas y las imágenes se sirven
        desde la propia web.
      </p>

      <h2>Lo único que guardamos en tu navegador</h2>
      <p>
        Mientras haces el Test IA360, la web usa el <strong>almacenamiento de sesión</strong> del navegador
        (sessionStorage) para dos cosas:
      </p>
      <ul>
        <li>No perder tus respuestas si la página se recarga a mitad del test (pasa a menudo al volver desde Instagram).</li>
        <li>Recordar por qué enlace llegaste a la web, para enviarlo junto con el test.</li>
      </ul>
      <p>
        Esta información no es una cookie, no se comparte con nadie y se borra sola al cerrar la pestaña. Al terminar el
        test, borramos también las respuestas. Es necesaria para prestar el servicio que pides, por lo que no requiere tu
        consentimiento (artículo 22.2 de la LSSI).
      </p>

      <h2>Enlaces a otros servicios</h2>
      <p>
        Si reservas una llamada, el botón te lleva a la agenda de Google Calendar, que tiene su propia política de cookies.
        Lo que pase allí ya no depende de esta web.
      </p>

      <h2>Cómo borrar los datos del navegador</h2>
      <p>
        Puedes borrar el almacenamiento de cualquier web desde los ajustes de tu navegador (en el apartado de privacidad o
        datos de sitios). Si tienes cualquier duda, escríbenos a <a href={`mailto:${D.email}`}>{D.email}</a>.
      </p>
    </PaginaLegal>
  );
}
