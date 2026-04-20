'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="bg-[#0F172A] text-[#F8FAFC]">
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#0F172A] shadow-lg shadow-black/30' : 'bg-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-[#F8FAFC] tracking-tight">
            Doyes Digital
          </Link>
          <Link
            href="/diagnostico"
            className="text-sm font-semibold text-white bg-[#0EA5E9] hover:bg-[#0284c7] px-5 py-2.5 rounded-lg transition-colors"
          >
            Hablar con nosotros →
          </Link>
        </div>
      </header>

      <main>
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="min-h-screen flex items-center px-6 pt-24 pb-20">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#0EA5E9] text-sm font-semibold uppercase tracking-widest mb-6">
              Diagnóstico de procesos con IA
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-[#F8FAFC] leading-[1.08] tracking-tight">
              Tu empresa puede funcionar mejor.
            </h1>
            <p className="mt-8 text-xl text-slate-400 leading-relaxed max-w-xl">
              La mayoría de empresas pierden tiempo y dinero en procesos que nadie ha revisado
              nunca. Nosotros los analizamos, detectamos qué se puede mejorar y te decimos
              exactamente cómo hacerlo.
            </p>
            <div className="mt-10">
              <Link
                href="/diagnostico"
                className="inline-block bg-[#0EA5E9] hover:bg-[#0284c7] text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
              >
                Quiero saber qué está fallando →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pain ────────────────────────────────────────────────────────── */}
        <section className="bg-[#0F172A] py-24 px-6 border-t border-[#1E293B]">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              {
                n: '01',
                text: 'Cada semana tu equipo pierde horas en tareas que podrían no existir.',
              },
              {
                n: '02',
                text: 'Tienes herramientas que nadie usa bien y procesos que dependen de una sola persona.',
              },
              {
                n: '03',
                text: 'Sabes que algo falla. Pero no sabes por dónde empezar a arreglarlo.',
              },
            ].map((item, i) => (
              <div
                key={item.n}
                className="reveal"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <p className="text-5xl font-bold text-[#0EA5E9] leading-none mb-5 tabular-nums">
                  {item.n}
                </p>
                <p className="text-slate-300 text-lg leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Solution ────────────────────────────────────────────────────── */}
        <section className="bg-[#1E293B] py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="reveal max-w-2xl mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-[#F8FAFC] leading-snug">
                Antes de proponer nada, entendemos cómo funciona tu empresa.
              </h2>
              <p className="mt-4 text-slate-400 text-lg leading-relaxed">
                No llegamos con soluciones decididas. Llegamos a escuchar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="reveal bg-[#0F172A] border border-[#0EA5E9]/50 rounded-2xl p-8">
                <span className="inline-block text-xs font-semibold text-[#0EA5E9] bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 px-3 py-1 rounded-full mb-6">
                  El primer paso
                </span>
                <h3 className="text-2xl font-bold text-[#F8FAFC]">IA360empresas</h3>
                <p className="mt-4 text-slate-400 leading-relaxed text-sm">
                  Analizamos tus procesos, detectamos dónde está el problema real, evaluamos qué
                  tiene sentido automatizar y te entregamos un plan concreto. Sin humo.
                </p>
                <p className="mt-8 text-xs text-slate-500 font-medium border-t border-[#334155] pt-4">
                  Entrega en 7–10 días
                </p>
              </div>

              {/* Card 2 */}
              <div className="reveal bg-[#0F172A] border border-[#334155] rounded-2xl p-8">
                <span className="inline-block text-xs font-semibold text-slate-400 bg-[#334155]/60 border border-[#334155] px-3 py-1 rounded-full mb-6">
                  Cuando ya sabes qué necesitas
                </span>
                <h3 className="text-2xl font-bold text-[#F8FAFC]">ImplementaciónIA360</h3>
                <p className="mt-4 text-slate-400 leading-relaxed text-sm">
                  Ejecutamos lo que el diagnóstico ha validado. Ni antes ni sin el diagnóstico
                  previo. Así garantizamos que cada hora invertida tiene sentido.
                </p>
                <p className="mt-8 text-xs text-slate-500 font-medium border-t border-[#334155] pt-4">
                  Solo disponible tras el diagnóstico
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-[#0F172A] to-[#1E293B] py-32 px-6">
          <div className="max-w-2xl mx-auto text-center reveal">
            <h2 className="text-3xl md:text-5xl font-bold text-[#F8FAFC] leading-tight tracking-tight">
              ¿Sigues sin saber por dónde empezar?
            </h2>
            <p className="mt-6 text-slate-400 text-lg leading-relaxed">
              En menos de 10 días tendrás un mapa claro de tu empresa y un plan para mejorarla.
            </p>
            <div className="mt-10">
              <Link
                href="/diagnostico"
                className="inline-block bg-[#0EA5E9] hover:bg-[#0284c7] text-white font-semibold px-10 py-5 rounded-xl transition-colors text-base"
              >
                Solicitar diagnóstico →
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0F172A] border-t border-[#1E293B] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <span>Doyes Digital SL · B25988031</span>
          <span>doyesdigital@gmail.com · 628 695 904</span>
          <span>© 2025 Doyes Digital</span>
        </div>
      </footer>
    </div>
  );
}
