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
  direccion: 'Carrer Nou 28, 43330 Riudoms (Tarragona)',
  direccionCorta: 'Carrer Nou 28, 43330 Riudoms',
  email: 'hola@doyesdigital.com',
  telefono: '628 695 904',
  telefonoEnlace: '+34628695904',
  administrador: 'David Domènech Yeste',
};

/**
 * La agenda de citas de Google Calendar de David. Si aún no está configurada,
 * los botones de "Hablar con David" abren un correo.
 */
export const URL_RESERVA = process.env.NEXT_PUBLIC_RESERVA_LLAMADA_URL || null;
export const URL_CONTACTO = URL_RESERVA ?? `mailto:${DATOS_EMPRESA.email}`;
