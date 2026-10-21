# API del Test IA360

La web (doyesdigital.com) envía el test al portal al terminarlo y recibe el
resultado para enseñarlo. El portal calcula los puntos, el semáforo, los
bloques y la cualificación: la web no calcula nada, solo enseña lo que recibe.

El contenido del test (preguntas, respuestas, textos) está en
`docs/web-test-ia360.md` y, como código, en `src/data/test-ia360.ts`.

## Petición

```
POST https://portal.doyesdigital.com/api/test-ia360
Content-Type: application/json
```

Solo se acepta desde el navegador en `https://doyesdigital.com` y
`https://www.doyesdigital.com` (cabecera `Origin`). En desarrollo, también
desde `http://localhost:<puerto>`. Una llamada sin `Origin` (desde un servidor)
recibe 403.

```json
{
  "respuestas": { "p1": 2, "p2": 1, "p3": 3, "p4": 2, "p5": 2, "p6": 1, "p7": 2, "p8": 1, "p9": 1, "p10": 3 },
  "abierta": "Estamos creciendo y yo ya no llego a todo…",
  "contacto": {
    "nombre": "Laura Puig",
    "email": "laura@empresa.es",
    "empresa": "Distribuciones Garbí SL",
    "personas": "11_50",
    "sector": "Distribución",
    "cargo": "Directora general",
    "telefono": "600 000 000",
    "cuando": "trimestre"
  },
  "privacidad": true,
  "origen": { "utm_source": "instagram", "utm_medium": "social", "utm_campaign": "lanzamiento", "pagina": "https://doyesdigital.com/?utm_source=instagram" },
  "website": ""
}
```

| Campo | Qué es |
| --- | --- |
| `respuestas` | Las preguntas 1 a 10 (`p1`…`p10`), todas. El valor es la posición de la respuesta elegida, en el orden del documento: `0`, `1`, `2` o `3` (que son también sus puntos). |
| `abierta` | Pregunta 11, obligatoria: de 10 a 2.000 caracteres. |
| `contacto.personas` | `hasta_10`, `11_50` o `mas_50`. |
| `contacto.cuando` | `ahora`, `trimestre` o `explorando`. |
| `contacto.telefono` | Opcional (se puede omitir o dejar vacío). El resto de `contacto` es obligatorio. |
| `privacidad` | Tiene que ser `true` (la casilla de la política de privacidad). |
| `origen` | Opcional. Se guardan `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `pagina` y `referente`; lo demás se ignora. |
| `website` | **Campo trampa**: un `<input name="website">` oculto con CSS (no `type="hidden"`), con `tabindex="-1"` y `autocomplete="off"`. Una persona lo deja vacío; si llega relleno, el portal responde un resultado normal pero no guarda nada ni envía correos. |

## Respuesta correcta (200)

```json
{
  "ok": true,
  "resultado": {
    "puntos": 18,
    "maximo": 30,
    "color": "ambar",
    "nombreColor": "Ámbar",
    "titular": "Base sólida, con fugas de tiempo",
    "mensaje": "Hay procesos que funcionan, pero se escapan horas en tareas y datos repetidos. Ahí está tu margen.",
    "bloques": [
      { "clave": "A", "nombre": "Dependencia de personas", "puntos": 3, "maximo": 6, "color": "ambar" },
      { "clave": "B", "nombre": "Tiempo y datos", "puntos": 7, "maximo": 9, "color": "rojo" },
      { "clave": "C", "nombre": "Clientes y control", "puntos": 4, "maximo": 9, "color": "ambar" },
      { "clave": "D", "nombre": "Herramientas e IA", "puntos": 4, "maximo": 6, "color": "rojo" }
    ],
    "destacados": [
      { "clave": "B", "nombre": "Tiempo y datos", "color": "rojo", "frase": "Tu equipo está haciendo de pegamento entre programas. Esto se puede ordenar y, después, automatizar." },
      { "clave": "D", "nombre": "Herramientas e IA", "color": "rojo", "frase": "…" }
    ],
    "llamada": { "mostrar": true, "texto": "Reserva una llamada de 30 minutos", "url": "https://calendar.app.google/…" }
  }
}
```

- `color`: `verde`, `ambar` o `rojo`. Cada bloque tiene el suyo, con el mismo
  semáforo en proporción a sus puntos máximos.
- `destacados`: los dos bloques con más puntos (en proporción), con su frase.
- `llamada`: si `mostrar` es `true` (leads calientes y templados), botón con
  `texto` que abre `url`. Si `url` es `null` (aún no hay agenda configurada),
  enseñar `texto` sin enlace. Si `mostrar` es `false` (leads fríos), enseñar
  `texto`: «Te hemos enviado tu resultado por correo».

El correo con el resultado y el aviso a David salen unos segundos después.

## Errores

Siempre `{ "ok": false, "error": "mensaje para enseñar" }`.

| Estado | Cuándo |
| --- | --- |
| 400 | Faltan datos o no son válidos. Incluye `campos`, con el mensaje de cada campo: `{ "contacto.email": "El email no parece válido.", "respuestas.p3": "…" }`. |
| 403 | La petición no viene de doyesdigital.com. |
| 413 | El envío pasa de 20 KB. |
| 415 | No es JSON. |
| 429 | Demasiados envíos: 5 por IP en una hora, 3 por email en un día, o 100 en total en una hora. |
| 500 | Error del portal (p. ej. la base de datos). Se puede reintentar. |

## Ejemplo (en el navegador)

```js
const respuesta = await fetch("https://portal.doyesdigital.com/api/test-ia360", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(envio),
});
const datos = await respuesta.json();
if (datos.ok) mostrarResultado(datos.resultado);
else mostrarError(datos.error, datos.campos);
```
