// De dónde llega el visitante (utm de Instagram, la web que le enlazó…). Se
// guarda al entrar en cualquier página para no perderlo al pasar de la
// portada al test. Solo en sessionStorage: desaparece al cerrar la pestaña.

const CLAVE = 'ia360-origen';
const CLAVES_UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

export type Origen = Record<string, string>;

function leerGuardado(): Origen | null {
  try {
    const texto = window.sessionStorage.getItem(CLAVE);
    return texto ? (JSON.parse(texto) as Origen) : null;
  } catch {
    return null;
  }
}

function getOrigenActual(): Origen {
  const parametros = new URLSearchParams(window.location.search);
  const origen: Origen = { pagina: window.location.href.slice(0, 500) };
  for (const clave of CLAVES_UTM) {
    const valor = parametros.get(clave);
    if (valor) origen[clave] = valor.slice(0, 500);
  }
  // Solo cuenta como referente una web externa, no la navegación interna.
  if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
    origen.referente = document.referrer.slice(0, 500);
  }
  return origen;
}

/** La primera visita de la sesión manda, salvo que una nueva llegue con utm. */
export function guardarOrigen(): void {
  const actual = getOrigenActual();
  const tieneUtm = CLAVES_UTM.some((clave) => clave in actual);
  if (leerGuardado() && !tieneUtm) return;
  try {
    window.sessionStorage.setItem(CLAVE, JSON.stringify(actual));
  } catch {
    // Navegación privada o almacenamiento bloqueado: se envía el origen de la página actual.
  }
}

export function getOrigen(): Origen {
  return leerGuardado() ?? getOrigenActual();
}
