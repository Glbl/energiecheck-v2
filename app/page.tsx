"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

export default function LandingPage() {
  const [workerCode, setWorkerCode] = useState("04091981P0001");

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Lógica para detectar tipo de dispositivo
    const getDeviceType = () => {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) return "Celular";
      return "Desktop/Laptop";
    };

    const params = new URLSearchParams(window.location.search);
    const isFromQR = params.get('source') === 'qr' ? 'Yes' : 'No';
    const codeFromUrl = params.get('code') || "04091981P0001";
    setWorkerCode(codeFromUrl);

    const trackVisit = async () => {
      try {
        await supabase.from('leads_tracking').insert([
          { 
            worker_code: codeFromUrl, 
            user_agent: navigator.userAgent,
            device_type: getDeviceType(),
            scanned_qr: isFromQR // Aquí guardas si fue por QR o no, dependiendo de tu lógica para detectarlo 
          }
        ]);
        console.log("Visita registrada exitosamente");
      } catch (err) {
        console.error("Error al registrar:", err);
      }
    };

    trackVisit();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
      {/* NAVIGATION */}
      <nav className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-orange-500 font-black tracking-tighter text-lg md:text-xl uppercase italic">
            Energiecheck-24
          </span>
        </div>
        <div className="bg-white/5 px-3 py-1 md:px-4 md:py-2 rounded-full border border-white/10 flex items-center">
          <span className="text-[9px] md:text-[10px] text-gray-400 mr-2 uppercase font-bold">ID Berater:</span>
          <span className="text-xs font-mono text-orange-400">{workerCode}</span>
        </div>
      </nav>

      {/* HERO SECTION - RESPONSIVE */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        <div className="relative group p-[1px] rounded-[2rem] bg-gradient-to-br from-orange-500 via-purple-600 to-blue-500 overflow-hidden mb-8 md:mb-12">
          <div className="bg-slate-950 rounded-[1.95rem] p-6 md:p-16 text-center relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-6 border border-orange-500/20">
              Solar-Station Förderung 2026
            </span>
            
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase mb-8 break-words">
              ProMotion
            </h1>
            
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                <span className="text-5xl md:text-8xl font-black text-white">+500€</span>
                <span className="text-lg md:text-2xl font-light text-gray-400 uppercase italic">Cash Back</span>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                <span className="text-3xl md:text-5xl font-black text-green-400">+250€</span>
                <span className="text-base md:text-xl font-light text-gray-500 uppercase italic">Eco-Bonus</span>
              </div>
            </div>

            <button className="mt-10 w-full md:w-auto px-10 py-5 bg-white text-black text-lg font-black rounded-2xl uppercase hover:bg-orange-500 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 mx-auto">
              Tarif-Check <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* QR SECTION - RESPONSIVE */}
        <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic mb-4">Mein <span className="text-orange-500">QR-Code</span></h2>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                Scannen Sie den Code, um die exklusive Aktion direkt auf Ihrem Smartphone zu aktivieren.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-[10px] text-green-400 font-bold uppercase tracking-widest">
                  <CheckCircle2 size={14} /> Tracking Aktiv
                </div>
                <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                  <Smartphone size={14} /> Mobile Ready
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center bg-white p-4 md:p-6 rounded-[2rem] shadow-2xl">
              <QRCodeSVG 
                value={`https://energiecheck-v2.vercel.app/?code=${workerCode}`} 
                size={160}
                level={"H"} // Nivel alto para permitir el logo central
                includeMargin={false}
                imageSettings={{
                  src: "/logo.png",
                  height: 35,
                  width: 35,
                  excavate: true,
                }}
              />
              <div className="mt-4 text-center">
                <p className="text-[10px] font-black text-black uppercase tracking-widest">{workerCode}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 border-t border-white/5 text-center px-6">
        <p className="text-gray-600 text-[10px] uppercase tracking-widest">
          © 2026 Energiecheck-24 Deutschland | Technical Lead: Giovanni Lazo
        </p>
      </footer>
    </div>
  );
}