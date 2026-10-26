// Nombres de marca, como en el portal. El producto se escribe siempre así: I, A, 360 y E mayúscula.
export const PRODUCTO = 'IA360Empresas';
export const EMPRESA = 'Doyes Digital';
export const TEST = 'Test IA360';

export const URL_SITIO = 'https://doyesdigital.com';

/** Datos legales de la empresa: pie, aviso legal y privacidad. */
export const DATOS_EMPRESA = {
  razonSocial: 'Doyes Digital, S.L.',
  nombreCorto: 'Doyes Digital SL',
  cif: 'B25988031',
  /** Domicilio social (fiscal): solo en aviso legal y privacidad, donde es obligatorio. */
  domicilioSocial: 'C/ Nou 28, 43330 Riudoms (Tarragona)',
  email: 'hola@doyesdigital.com',
  /** Siempre se muestra así y siempre enlaza a tel:. */
  telefono: '+34 628695904',
  telefonoEnlace: '+34628695904',
  administrador: 'David Domènech Yeste',
};

/**
 * La agenda de citas de Google Calendar de David. Si aún no está configurada,
 * el botón "Contacto" abre un correo a hola@doyesdigital.com.
 */
export const URL_RESERVA = process.env.NEXT_PUBLIC_RESERVA_LLAMADA_URL || null;
export const URL_CONTACTO = URL_RESERVA ?? `mailto:${DATOS_EMPRESA.email}`;

const MENSAJE_WHATSAPP = 'Hola, vengo de la web de IA360Empresas y me gustaría saber más.';
export const URL_WHATSAPP = `https://wa.me/34628695904?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`;

/** "Hablemos": la agenda; si aún no está configurada, WhatsApp. */
export const URL_HABLEMOS = URL_RESERVA ?? URL_WHATSAPP;
