/*
 * PENDIENTE DE REVISIÓN LEGAL. Texto redactado como primera versión; debe
 * revisarlo un abogado antes de darlo por definitivo. Falta además añadir los
 * datos de inscripción en el Registro Mercantil (tomo, folio, hoja), que exige
 * el artículo 10 de la LSSI.
 */
import type { Metadata } from 'next';

import { PaginaLegal, TablaLegal } from '@/components/PaginaLegal';
import { DATOS_EMPRESA as D, URL_SITIO } from '@/lib/marca';

export const metadata: Metadata = {
  title: 'Aviso legal',
  description: 'Datos del titular de doyesdigital.com y condiciones de uso de la web.',
  alternates: { canonical: '/aviso-legal' },
};

export default function AvisoLegal() {
  return (
    <PaginaLegal titulo="Aviso legal" actualizado="octubre de 2026">
      <h2>1. Quién es el titular de esta web</h2>
      <p>
        En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico
        (LSSI), te informamos de que esta web, {URL_SITIO.replace('https://', '')}, es de:
      </p>
      <TablaLegal
        filas={[
          ['Titular', D.razonSocial],
          ['CIF', D.cif],
          ['Domicilio social', D.domicilioSocial],
          ['Email', <a key="email" href={`mailto:${D.email}`}>{D.email}</a>],
          ['Teléfono', <a key="tel" href={`tel:${D.telefonoEnlace}`}>{D.telefono}</a>],
        ]}
      />

      <h2>2. Para qué sirve esta web</h2>
      <p>
        Esta web presenta los servicios de consultoría en procesos de negocio e inteligencia artificial de Doyes Digital,
        bajo la marca IA360Empresas, y permite hacer el Test IA360, un cuestionario gratuito que da una primera
        orientación sobre la situación de tu empresa.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        Al usar esta web aceptas este aviso legal. Te comprometes a usarla de forma lícita, a no dañar su funcionamiento y
        a que los datos que nos facilites sean ciertos y tuyos o de tu empresa.
      </p>
      <p>
        El resultado del Test IA360 es orientativo: se calcula automáticamente a partir de tus respuestas y no sustituye
        un análisis profesional de tu empresa. Los precios que aparecen en la web son orientativos y no constituyen una
        oferta vinculante; cada servicio se concreta en una propuesta por escrito.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Los textos, el diseño, los logotipos, las marcas (entre ellas, Doyes Digital e IA360Empresas), el Test IA360 y el
        resto de contenidos de esta web son de Doyes Digital o se usan con permiso de sus titulares. No está permitido
        copiarlos, distribuirlos ni transformarlos sin autorización por escrito, salvo para uso personal y privado.
      </p>

      <h2>5. Responsabilidad</h2>
      <p>
        Hacemos lo posible para que la web funcione bien y su información sea correcta, pero no podemos garantizar que
        esté siempre disponible ni libre de errores. Doyes Digital no se hace responsable de los daños que puedan
        derivarse de interrupciones del servicio, de un uso incorrecto de la web o de decisiones tomadas solo a partir
        del resultado del test.
      </p>

      <h2>6. Enlaces a otras webs</h2>
      <p>
        Algunos enlaces llevan a servicios de terceros, como la agenda para reservar una llamada. No controlamos esas webs
        ni somos responsables de su contenido ni de sus políticas, que te recomendamos revisar.
      </p>

      <h2>7. Protección de datos y cookies</h2>
      <p>
        Cómo tratamos tus datos se explica en la <a href="/privacidad">política de privacidad</a>. Esta web no usa cookies
        de seguimiento; los detalles están en la <a href="/cookies">política de cookies</a>.
      </p>

      <h2>8. Ley aplicable y jurisdicción</h2>
      <p>
        Este aviso legal se rige por la ley española. Para cualquier conflicto, las partes se someten a los juzgados y
        tribunales de Reus, salvo que la ley establezca otro fuero, como el del domicilio del consumidor.
      </p>
    </PaginaLegal>
  );
}
