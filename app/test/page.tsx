import type { Metadata } from 'next';

import { Cabecera } from '@/components/Cabecera';
import { TestIA360 } from '@/components/test/TestIA360';

export const metadata: Metadata = {
  title: 'Test IA360',
  description:
    '10 preguntas, unos 3 minutos. Descubre cuánto tiempo está perdiendo tu empresa y por dónde empezar a recuperarlo.',
  alternates: { canonical: '/test' },
  // Al definir aquí openGraph, Next no hereda la imagen de la portada: se indica otra vez.
  openGraph: {
    title: 'Test IA360 · ¿Cuánto tiempo está perdiendo tu empresa?',
    description: '10 preguntas, unos 3 minutos. Recibe tu resultado en semáforo al momento.',
    url: '/test',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'IA360Empresas: Ordena tu empresa. Poténciala con IA. Haz el test gratis.',
      },
    ],
  },
};

export default function PaginaTest() {
  return (
    <>
      <Cabecera />
      <main className="flex flex-1 flex-col">
        <TestIA360 />
      </main>
    </>
  );
}
