"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Smartphone, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

export default function LandingPage() {
  // Estado para el código del promotor (Berater)
  const [workerCode, setWorkerCode] = useState("04091981P0001");
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    // 1. Inicialización segura de Supabase dentro del useEffect
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Error: Faltan variables de entorno de Supabase.");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Capturar el código del promotor de la URL (?code=...)
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('code') || "04091981P0001";
    setWorkerCode(codeFromUrl);

    // 3. Función para registrar la visita automáticamente
    const trackVisit = async () => {
      try {
        const { error } = await supabase
          .from('leads_tracking')
          .insert([
            { 
              worker_code: codeFromUrl, 
              user_agent: navigator.userAgent 
            }
          ]);
        
        if (error) throw error;
        console.log("Visita registrada exitosamente en Supabase.");
      } catch (err) {
        console.error("Error al registrar visita:", err);
      }
    };

    trackVisit(); // Ejecución inmediata
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
      {/* HEADER / NAV */}
      <nav className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-orange-500 font-black tracking-tighter text-xl uppercase">
            Eco-Home-Energie Station
          </span>
          <span className="text-[10px] text-gray-500 tracking-[0.2em] uppercase leading-none">
            Energie. Überall. Jederzeit.
          </span>
        </div>
        <div className="hidden md:flex bg-white/5 px-4 py-2 rounded-full border border-white/10 items-center">
          <span className="text-[10px] text-gray-400 mr-2 uppercase font-bold">ID Berater:</span>
          <span className="text-xs font-mono text-orange-400">{workerCode}</span>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
        <div className="relative group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-orange-500 via-purple-600 to-blue-500 shadow-2xl overflow-hidden mb-12">
          <div className="bg-slate-950 rounded-[2.4rem] p-8 md:p-16 text-center relative z-10">
            <header className="mb-8">
              <span className="inline-block px-4 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-widest mb-4 border border-orange-500/20">
                Solar-Station Förderung Sichern
              </span>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-6">
                PROMOTION
              </h1>
              
              {/* MONTOS ACTUALIZADOS */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-6xl md:text-8xl font-black text-white">+500€</span>
                  <span className="text-xl md:text-2xl font-light text-gray-400 text-left uppercase leading-tight">
                    Cash Back
                  </span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-4xl md:text-5xl font-black text-green-400">+250€</span>
                  <span className="text-lg md:text-xl font-light text-gray-500 text-left uppercase leading-tight">
                    Eco-Starter-Bonus
                  </span>
                </div>
              </div>
            </header>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
              <div className="flex items-center gap-2 text-blue-400 font-bold italic group-hover:scale-105 transition-transform">
                <Smartphone size={24} />
                <span className="underline underline-offset-4">Inkl. E-Scooter Option</span>
              </div>
            </div>

            <button 
              onClick={() => setShowCheck(true)}
              className="mt-12 w-full md:w-auto px-12 py-6 bg-white text-black text-xl font-black rounded-2xl uppercase hover:bg-orange-500 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mx-auto"
            >
              Tarif-Check Starten <ArrowRight />
            </button>
            
            <p className="mt-6 text-[10px] text-gray-600 uppercase tracking-widest">
              Aktion gültig bis: 31. Mai 2026
            </p>
          </div>
        </div>

        {/* QR GENERATOR SECTION */}
        <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black uppercase italic mb-4">Ihr Persönlicher <span className="text-orange-500 underline">QR-Code</span></h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Zeigen Sie diesen Code Ihren Kunden. Jede Anmeldung wird automatisch Ihrem Berater-Konto <span className="text-white font-bold">({workerCode})</span> zugewiesen.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="text-green-500" size={18} />
                  <span>Automatische Provisionszuordnung</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="text-green-500" size={18} />
                  <span>Echtzeit-Tracking via Supabase</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-6 bg-white rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)] relative overflow-hidden group">
                <QRCodeSVG 
                  value={`https://energiecheck-v2.vercel.app/?code=${workerCode}`} 
                  size={200}
                  level={"H"}
                  includeMargin={false}
                  imageSettings={{
                    src: "/logo.png", // Asegúrate de subir logo.png a la carpeta public
                    height: 45,
                    width: 45,
                    excavate: true,
                  }}
                />
              </div>
              <div className="mt-6 text-center">
                <p className="text-xs font-black uppercase tracking-[0.3em] mb-2">Scannen Sie mich</p>
                <p className="text-[10px] font-mono text-orange-500">{workerCode}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 text-center px-6">
        <p className="text-gray-600 text-[10px] uppercase tracking-widest leading-loose">
          © 2026 Energiecheck-24 Deutschland | Technischer Support: Giovanni Luis Barrantes Lazo
        </p>
      </footer>
    </div>
  );
}