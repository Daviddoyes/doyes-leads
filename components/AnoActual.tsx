'use client';

import { useEffect, useState } from 'react';

/** Las páginas se generan al desplegar: el navegador corrige el año si ha cambiado desde entonces. */
export function AnoActual({ anoGenerado }: { anoGenerado: number }) {
  const [ano, setAno] = useState(anoGenerado);
  useEffect(() => setAno(new Date().getFullYear()), []);
  return <>{ano}</>;
}
