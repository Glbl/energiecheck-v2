"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';

// Conexión segura usando las variables de entorno configuradas en Vercel
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LandingPage() {
  const [workerCode, setWorkerCode] = useState("04091981P0001");
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    // 1. Capturar el código del promotor de la URL (?code=...)
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || "04091981P0001";
    setWorkerCode(code);

    // 2. REGISTRO EN BASE DE DATOS: Guardar la visita automáticamente
    const trackVisit = async () => {
      try {
        await supabase.from('leads_tracking').insert([
          { 
            worker_code: code, 
            user_agent: navigator.userAgent 
          }
        ]);
        console.log("Registro exitoso en Supabase");
      } catch (error) {
        console.error("Error tracking visit:", error);
      }
    };
    trackVisit();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-500">
      
      {/* Header Premium - Logo y Eslogan según dibujo */}
      <nav className="p-6 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-orange-500">ECO-HOME-ENERGIE STATION</span>
          <span className="text-[9px] tracking-[0.2em] text-gray-500 uppercase">Energie. Überall. Jederzeit.</span>
        </div>
        <div className="hidden md:block px-4 py-1 rounded-full border border-gray-700 text-[10px] text-gray-400">
          ID Berater: {workerCode}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6 pt-12 space-y-12">
        
        {/* SECCIÓN 2: ProMotion mejorada (Dibujo 1) */}
        <section className="relative p-1 bg-gradient-to-br from-orange-500 via-purple-600 to-blue-600 rounded-[2.5rem] shadow-2xl">
          <div className="bg-slate-900 rounded-[2.4rem] p-8 md:p-12 text-center space-y-8 overflow-hidden relative">
            
            <div className="relative z-10">
              <h2 className="text-sm font-bold text-orange-400 tracking-widest uppercase mb-2">Solar-Station Förderung Sichern</h2>
              <h3 className="text-4xl md:text-6xl font-black mb-6 italic">PROMOTION</h3>

              {/* Los Bonos de 500€ + 250€ */}
              <div className="space-y-4 py-6">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-5xl md:text-7xl font-black text-white">+500€</span>
                  <span className="text-xl md:text-2xl font-light text-gray-300 uppercase tracking-tighter">Cash Back</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-3xl md:text-5xl font-black text-green-400">+250€</span>
                  <span className="text-lg md:text-xl font-light text-gray-300 uppercase tracking-tighter">Eco-Starter-Bonus</span>
                </div>
              </div>

              <div className="flex justify-center items-center gap-2 py-4 text-orange-300">
                <span className="text-2xl">🛴</span>
                <span className="font-medium tracking-wide italic underline">Inkl. E-Scooter Option</span>
              </div>

              <button 
                onClick={() => setShowCheck(true)}
                className="mt-8 px-10 py-5 bg-white text-black font-black text-xl rounded-2xl hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105 shadow-xl"
              >
                TARIF-CHECK STARTEN
              </button>
              <p className="mt-4 text-[10px] text-gray-500 italic">Aktion gültig bis: 31. Mai 2026</p>
            </div>

            {/* Elementos decorativos abstractos */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
          </div>
        </section>

        {/* Simulador de Comparación (Carga después del Click) */}
        {showCheck && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 animate-in zoom-in-95 duration-500">
             <h4 className="text-2xl font-bold mb-6 text-center">Ihre Ersparnis mit Energiecheck-24</h4>
             <div className="space-y-4">
                <div className="flex justify-between p-4 bg-gray-800/50 rounded-xl border border-white/5">
                    <span className="text-gray-400">Aktueller Grundversorger</span>
                    <span className="font-bold text-red-400">~ 1.450€ / Jahr</span>
                </div>
                <div className="flex justify-between p-4 bg-green-500/10 border border-green-500/50 rounded-xl">
                    <span className="text-green-300 font-bold">ECO-HOME System</span>
                    <span className="font-bold text-green-400">700€ / Jahr*</span>
                </div>
                <p className="text-[10px] text-gray-500 text-center">*Basierend auf 500€ Cashback + 250€ Starter Bonus.</p>
                <a href="https://www.energiecheck-24.de" className="block text-center w-full py-4 bg-orange-600 text-white font-bold rounded-xl mt-6 hover:bg-orange-500 transition-colors uppercase tracking-widest">
                   Jetzt Beratung Sichern
                </a>
             </div>
          </div>
        )}

        {/* GENERADOR DE QR AUTOMÁTICO (Diseño similar a imagen del cliente) */}
        <section className="mt-20 flex flex-col items-center">
            <div className="bg-black border border-white/10 p-4 rounded-[2rem] w-full max-w-xs flex flex-col items-center">
                {/* Cuadro Blanco del QR */}
                <div className="bg-white p-6 rounded-2xl relative">
                    <QRCodeSVG 
                        value={`https://nextjs-boilerplate-topaz-two-82.vercel.app/?code=${workerCode}`} 
                        size={180}
                        level={"H"}
                        includeMargin={false}
                        imageSettings={{
                            src: "/energicheck.png", // Intento de carga de logo oficial
                            x: undefined,
                            y: undefined,
                            height: 35,
                            width: 35,
                            excavate: true,
                        }}
                    />
                </div>
                
                {/* Pestaña decorativa y texto */}
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white"></div>
                
                <div className="mt-6 mb-4 text-center">
                    <p className="text-white text-xl font-medium tracking-tight">Scannen Sie mich</p>
                    <p className="text-orange-500/60 text-[10px] mt-1 font-mono">{workerCode}</p>
                </div>
            </div>
            <p className="mt-4 text-[10px] text-gray-600 uppercase tracking-widest">Persönlicher Promoter-Code</p>
        </section>

      </main>

      <footer className="p-12 text-center text-gray-700 text-[9px] tracking-[0.4em] uppercase">
        &copy; 2026 Energiecheck-24 Deutschland // All Rights Reserved
      </footer>
    </div>
  );
}