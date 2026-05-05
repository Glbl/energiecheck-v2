"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';

export default function LandingPage() {
  const [workerCode, setWorkerCode] = useState("04091981P0001");

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const getDeviceType = () => {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) return "Celular";
      return "Desktop/Laptop";
    };

    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('code') || "04091981P0001";
    const isFromQR = params.get('source') === 'qr' ? 'Yes' : 'No'; 
    
    setWorkerCode(codeFromUrl);

    const trackVisit = async () => {
      try {
        await supabase.from('leads_tracking').insert([
          { 
            worker_code: codeFromUrl, 
            user_agent: navigator.userAgent,
            device_type: getDeviceType(),
            scanned_qr: isFromQR 
          }
        ]);
      } catch (err) {
        console.error("Error técnico:", err);
      }
    };

    trackVisit();
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans overflow-x-hidden">
      
      <nav className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-sm fixed top-0 w-full z-50">
        <span className="text-orange-500 font-black italic text-sm">ENERGIECHECK-24</span>
        <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
          <span className="text-[10px] font-mono text-orange-400">{workerCode}</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 pt-20 pb-12 flex flex-col items-center">
        
        {/* TEXTO SUPERIOR CORREGIDO */}
        <div className="text-center mb-4 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
            <span className="text-[#d4e137]">500€</span> <span className="text-white lowercase font-medium">sofort</span> <span className="text-white">CASH</span>
          </h2>
          <span className="text-[#d4e137] text-2xl font-bold mt-2">+</span>
        </div>

        {/* IMAGEN DE PRODUCTOS */}
        <div className="w-full mb-2 transform scale-110">
          <img 
            src="/produkte-bundle.png" 
            alt="Energie Bundle" 
            className="w-full h-auto object-contain"
          />
        </div>

        {/* TÍTULO CON BANDERAS EN LAS ESQUINAS */}
        <div className="relative w-full flex items-center justify-between mb-8 px-2">
          <img src="/germany-flag3.png" alt="DE" className="w-8 h-auto self-center" />
          
          <div className="text-center flex flex-col items-center mx-4">
            <h1 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tighter">
              ENERGIE <span className="text-[#d4e137] italic font-medium">FÖRDERUNG</span>
            </h1>
            <h1 className="text-4xl md:text-5xl font-medium lowercase leading-none tracking-tighter mt-1">
              sichern
            </h1>
          </div>

          <img src="/germany-flag3.png" alt="DE" className="w-8 h-auto self-center" />
        </div>

        {/* SECCIÓN DE FONDO CON MEJORA DE SOMBRA (MASKING) */}
        <div className="relative w-full py-12 flex flex-col items-center overflow-visible">
          {/* Fondo centrado con máscara para eliminar bordes duros */}
          <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none">
            <img 
              src="/germany-bg-glow.jpg" 
              className="w-[110%] max-w-none object-center opacity-60"
              style={{ 
                maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
                WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)'
              }} 
            />
          </div>

          <div className="relative z-10 w-full text-center">
            <p className="text-gray-400 text-xs font-medium mb-2 tracking-widest">
              Zusätzliche Förderung möglich
            </p>
            <h3 className="text-xl font-black uppercase mb-6 tracking-tight">
              MÜNCHEN SOLAR BONUS <span className="text-[#d4e137] ml-2">+ 320 €</span>
            </h3>

            {/* BOTÓN JETZT TARIF PRÜFEN (CORREGIDO) */}
            <button 
              onClick={() => window.location.href = 'https://www.energiecheck-24.de/de#energietarif-berechnen'}
              className="w-full py-5 bg-[#d4e137] text-black text-xl font-extrabold rounded-[2rem] shadow-[0_0_30px_rgba(212,225,55,0.3)] hover:scale-105 transition-all mb-8"
            >
              Jetzt Tarif prüfen
            </button>

            <div className="space-y-6">
              <p className="text-sm font-medium">
                30–50% Stromkosten sparen mit der <br/>
                <span className="text-[#d4e137] font-bold italic">Eco-Home-E-Station</span>
              </p>

              <div className="text-lg md:text-xl font-bold space-y-1">
                <p>In unter <span className="text-[#d4e137]">5 Minuten</span> starten</p>
                <p>Bis zu <span className="text-[#d4e137]">820 €</span> verdienen</p>
                <p>+ bis zu <span className="text-[#d4e137]">800 €</span> jährlich sparen</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR SECTION */}
        <section className="mt-12 w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mb-4">Mein Berater QR-Code</p>
          <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl">
            <QRCodeSVG 
              value={`https://energiecheck-v2.vercel.app/?code=${workerCode}&source=qr`} 
              size={140}
              level={"H"}
              imageSettings={{ src: "/logo.png", height: 30, width: 30, excavate: true }}
            />
          </div>
        </section>
      </main>

      <footer className="py-8 text-center">
        <p className="text-gray-700 text-[9px] uppercase tracking-widest">
          Energiecheck-24 | Technical Lead: Giovanni Lazo
        </p>
      </footer>
    </div>
  );
}