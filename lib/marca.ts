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
  /** Domicilio social (fiscal): aviso legal y privacidad. */
  domicilioSocial: 'C/ Nou 28, 43330 Riudoms (Tarragona)',
  /** Dirección comercial: pie y contacto. */
  direccionComercial: 'C/ de la Sardana, 2, 43330 Riudoms',
  email: 'hola@doyesdigital.com',
  telefono: '628 695 904',
  telefonoEnlace: '+34628695904',
  administrador: 'David Domènech Yeste',
};

/**
 * La agenda de citas de Google Calendar de David. Si aún no está configurada,
 * el botón "Contacto" abre un correo a hola@doyesdigital.com.
 */
export const URL_RESERVA = process.env.NEXT_PUBLIC_RESERVA_LLAMADA_URL || null;
export const URL_CONTACTO = URL_RESERVA ?? `mailto:${DATOS_EMPRESA.email}`;
