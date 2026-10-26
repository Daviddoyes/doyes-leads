/*
 * PENDIENTE DE REVISIÓN LEGAL. Texto redactado como primera versión; debe
 * revisarlo un abogado antes de darlo por definitivo. Si cambian los
 * proveedores (alojamiento, base de datos, correo) o lo que guarda el portal
 * del Test IA360 (portal-doyes, tabla portal_leads), hay que actualizarlo.
 */
import type { Metadata } from 'next';

import { PaginaLegal, TablaLegal } from '@/components/PaginaLegal';
import { DATOS_EMPRESA as D } from '@/lib/marca';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Qué datos recoge el Test IA360, para qué los usamos, dónde se guardan y cómo ejercer tus derechos.',
  alternates: { canonical: '/privacidad' },
};

export default function Privacidad() {
  const email = <a href={`mailto:${D.email}`}>{D.email}</a>;
  return (
    <PaginaLegal titulo="Política de privacidad" actualizado="octubre de 2026">
      <p>
        Aquí te explicamos, en lenguaje claro, qué datos personales recogemos en esta web, para qué los usamos y qué
        derechos tienes, conforme al Reglamento General de Protección de Datos (RGPD) y a la Ley Orgánica 3/2018 de
        Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <TablaLegal
        filas={[
          ['Responsable', D.razonSocial],
          ['CIF', D.cif],
          ['Domicilio social', D.domicilioSocial],
          ['Email', email],
          ['Teléfono', <a key="tel" href={`tel:${D.telefonoEnlace}`}>{D.telefono}</a>],
        ]}
      />

      <h2>2. Qué datos recogemos</h2>
      <p>
        Solo recogemos datos cuando haces el <strong>Test IA360</strong> o nos escribes. Navegar por la web no requiere
        darnos ningún dato. Al hacer el test, guardamos:
      </p>
      <ul>
        <li>
          <strong>Tus respuestas al test</strong>: las diez preguntas sobre cómo funciona tu empresa y lo que escribes en
          la pregunta abierta (qué te ha hecho buscar una mejora y qué te gustaría conseguir).
        </li>
        <li>
          <strong>Tus datos de contacto</strong>: nombre, email, empresa, número de personas, sector, cargo, teléfono y
          cuándo te gustaría ponerle solución.
        </li>
        <li>
          <strong>El resultado</strong> que se calcula a partir de tus respuestas (puntos, semáforo y bloques).
        </li>
        <li>
          <strong>De dónde llegas</strong>: la página por la que entraste, la web que te enlazó y, si el enlace los
          incluía, los parámetros de campaña (por ejemplo, que venías de Instagram).
        </li>
        <li>
          <strong>Datos técnicos mínimos</strong>: la fecha y hora en que aceptaste esta política y una huella cifrada de
          tu dirección IP (no la IP), que solo sirve para evitar envíos abusivos.
        </li>
      </ul>
      <p>
        No pedimos datos especialmente protegidos (salud, ideología, etc.). Te pedimos que no los incluyas en la pregunta
        abierta.
      </p>

      <h2>3. Para qué usamos tus datos</h2>
      <ul>
        <li>Calcular el resultado del test, enseñártelo en pantalla y enviártelo por correo.</li>
        <li>
          Ponernos en contacto contigo para comentar tu resultado y, si te interesa, ofrecerte una llamada o una
          propuesta del Diagnóstico IA360Empresas.
        </li>
        <li>Saber qué canales nos traen visitas (por ejemplo, Instagram), de forma agregada, para mejorar la web.</li>
      </ul>
      <p>
        El resultado del test se calcula automáticamente a partir de tus respuestas, pero es solo una orientación: no se
        toma ninguna decisión con efectos jurídicos sobre ti ni sobre tu empresa.
      </p>
      <p>No enviamos publicidad ni boletines, y no vendemos ni cedemos tus datos a nadie.</p>

      <h2>4. Por qué podemos tratarlos (base legal)</h2>
      <ul>
        <li>
          <strong>Tu consentimiento</strong>, que das al marcar la casilla antes de enviar el test (artículo 6.1.a del
          RGPD). Puedes retirarlo cuando quieras, sin que eso afecte a lo hecho hasta entonces.
        </li>
        <li>
          <strong>Las medidas precontractuales</strong> que nos pides (artículo 6.1.b del RGPD): enviarte tu resultado,
          resolver tus dudas y, si lo solicitas, prepararte una propuesta.
        </li>
      </ul>

      <h2>5. Dónde se guardan y quién nos ayuda</h2>
      <p>
        Tus datos se guardan <strong>en Europa</strong>, en una base de datos de Supabase alojada en la región de
        Irlanda (UE). Para que la web y el test funcionen trabajamos con estos proveedores, que tratan los datos solo
        siguiendo nuestras instrucciones y con contrato de encargo de tratamiento:
      </p>
      <TablaLegal
        filas={[
          ['Supabase', 'Base de datos donde se guardan las respuestas y los datos de contacto. Servidores en Irlanda (UE).'],
          ['Vercel', 'Alojamiento de la web y del portal donde se calcula el resultado.'],
          ['Resend', 'Envío del correo con tu resultado.'],
        ]}
      />
      <p>
        Vercel y Resend son empresas con sede en Estados Unidos. Cuando un dato pueda salir del Espacio Económico Europeo,
        la transferencia se ampara en el Marco de Privacidad de Datos UE-EE. UU. o en las cláusulas contractuales tipo
        aprobadas por la Comisión Europea.
      </p>

      <h2>6. Cuánto tiempo los guardamos</h2>
      <p>
        Mientras hablemos contigo sobre tu empresa y, si no llegamos a trabajar juntos, como máximo dos años desde tu
        último contacto. Si te conviertes en cliente, los datos pasan a regirse por el contrato que firmemos y se
        conservan durante los plazos que exige la ley. Si nos pides que los borremos antes, lo haremos.
      </p>

      <h2>7. Tus derechos</h2>
      <p>Puedes pedirnos en cualquier momento:</p>
      <ul>
        <li>
          <strong>Acceso</strong>: saber qué datos tuyos tenemos.
        </li>
        <li>
          <strong>Rectificación</strong>: corregir los que estén mal.
        </li>
        <li>
          <strong>Supresión</strong>: que los borremos.
        </li>
        <li>
          <strong>Oposición</strong> y <strong>limitación</strong>: que dejemos de usarlos, o que los usemos solo para
          ciertos fines.
        </li>
        <li>
          <strong>Portabilidad</strong>: recibirlos en un formato que puedas llevarte a otro servicio.
        </li>
        <li>
          <strong>Retirar tu consentimiento</strong>.
        </li>
      </ul>
      <p>
        Para ejercerlos, escríbenos a {email} desde el email con el que hiciste el test, o por correo postal a {D.domicilioSocial},
        indicando qué derecho quieres ejercer. Te responderemos en un mes como máximo. Si podemos tener dudas razonables
        sobre tu identidad, te pediremos que la acredites.
      </p>
      <p>
        Si crees que no hemos tratado bien tus datos, puedes presentar una reclamación ante la Agencia Española de
        Protección de Datos, en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Las comunicaciones con la web van cifradas (HTTPS), el acceso a los datos está restringido a Doyes Digital y
        aplicamos medidas técnicas y organizativas adecuadas al riesgo para evitar su pérdida o un acceso no autorizado.
      </p>

      <h2>9. Cambios en esta política</h2>
      <p>
        Si cambiamos algo importante, lo actualizaremos aquí y cambiaremos la fecha de arriba. Si el cambio afecta a datos
        que ya nos diste, te avisaremos.
      </p>
    </PaginaLegal>
  );
}
