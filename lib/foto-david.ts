import { existsSync } from 'node:fs';
import path from 'node:path';

/** Se comprueba al generar la página: subir public/david.jpg y desplegar basta para que aparezca. */
export function hayFotoDavid(): boolean {
  return existsSync(path.join(process.cwd(), 'public', 'david.jpg'));
}
