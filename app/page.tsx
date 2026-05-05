"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';

// 1. Inicialización de Supabase fuera del componente para evitar el error de "nombre no encontrado"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function LandingPage() {
  // Estados principales
  const [sessionId] = useState(`sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [workerCode, setWorkerCode] = useState("04091981P0001");
  const [step, setStep] = useState(1);

  // 2. Función de rastreo optimizada con useCallback
  const trackStep = useCallback(async (newStepName: string, timeInPrevStep: number) => {
    try {
      await supabase.from('user_funnel_logs').insert([{
        session_id: sessionId,
        worker_id: workerCode,
        current_step: newStepName,
        time_spent_seconds: timeInPrevStep,
        action_type: 'navigation'
      }]);
    } catch (error) {
      console.error("Error al registrar el paso:", error);
    }
  }, [sessionId, workerCode]);

  // 3. Lógica para detectar el cambio de paso y medir el tiempo
  useEffect(() => {
    const startTime = Date.now();
    const stepNames = ["Landing", "Anmeldung", "Erstellen", "Test", "Bestätigung"];

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpent > 0) {
        trackStep(stepNames[step - 1], timeSpent);
      }
    };
  }, [step, trackStep]);

  // 4. Lógica de visita inicial y parámetros de URL
  useEffect(() => {
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
        await supabase.from('leads_tracking').insert([{ 
          worker_code: codeFromUrl, 
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          scanned_qr: isFromQR 
        }]);
      } catch (err) {
        console.error("Error técnico en visita:", err);
      }
    };

    trackVisit();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <nav className="p-4 flex justify-between items-center bg-black/40 backdrop-blur-md fixed top-0 w-full z-50">
        <span className="text-orange-500 font-black italic text-xs">ENERGIECHECK-24</span>
        <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
          <span className="text-[10px] font-mono text-orange-400">{workerCode}</span>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 pt-20 pb-12 flex flex-col items-center">
        {/* HERO SECTION */}
        <div className="text-center mb-2 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            <span className="text-[#d4e137]">500€</span> <span className="text-white lowercase font-medium">sofort</span> <span className="text-white uppercase">CASH</span>
          </h2>
          <span className="text-[#d4e137] text-xl font-bold mt-1">+</span>
        </div>

        <div className="w-full mb-0 transform scale-110 relative h-64 md:h-80">
          <Image 
            src="/produkte-bundle.webp" 
            alt="Energie Bundle" 
            fill priority
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>

        {/* PROMOTION TITLE */}
        <div className="relative w-full flex items-center justify-between mb-2 px-0 mt-4">
          <div className="relative w-8 h-6">
            <Image src="/germany-flag3.png" alt="DE" fill className="object-contain" />
          </div>
          <div className="text-center flex flex-col items-center flex-1">
            <h1 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tighter">
              ENERGIE <span className="text-[#d4e137] italic font-medium">FÖRDERUNG</span>
            </h1>
            <h1 className="text-4xl md:text-5xl font-medium lowercase leading-none tracking-tighter mt-1 text-gray-300">
              sichern
            </h1>
          </div>
          <div className="relative w-8 h-6">
            <Image src="/germany-flag3.png" alt="DE" fill className="object-contain" />
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="relative w-full pt-4 pb-12 flex flex-col items-center">
          <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none">
            <div className="relative w-full h-full opacity-70 mix-blend-screen">
              <Image 
                src="/germany-bg-glow.webp" 
                alt="Background Glow"
                fill
                className="object-center object-contain"
                style={{ 
                  maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)',
                  WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 90%)'
                }} 
              />
            </div>
          </div>

          <div className="relative z-10 w-full text-center mt-0">
            <p className="text-white text-sm font-semibold mb-4 tracking-wide">
              Zusätzliche Förderung möglich
            </p>
            <h3 className="text-xl font-black uppercase mb-6 tracking-tight">
              MÜNCHEN SOLAR BONUS <span className="text-[#d4e137] ml-2">+ 320 €</span>
            </h3>

            <button 
              onClick={() => window.location.href = 'https://www.energiecheck-24.de/de#energietarif-berechnen'}
              className="w-full py-5 bg-[#d4e137] text-black text-xl font-extrabold rounded-[2rem] shadow-[0_10px_40px_rgba(212,225,55,0.2)] hover:scale-[1.02] transition-all mb-10"
            >
              Jetzt Tarif prüfen
            </button>

            <div className="space-y-6">
              <p className="text-sm font-medium leading-relaxed">
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
        <section className="mt-8 w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-center flex flex-col items-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mb-4 font-bold">Mein Berater QR-Code</p>
          <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer">
            <QRCodeSVG 
              id="qr-gen"
              value={`https://energiecheck-v2.vercel.app/?code=${workerCode}&source=qr`} 
              size={140}
              level={"H"}
              imageSettings={{ src: "/logo.png", height: 30, width: 30, excavate: true }}
            />
          </div>
          <p className="mt-4 text-[10px] text-gray-500 font-mono opacity-50 select-all tracking-tighter max-w-[200px] truncate">
            {`https://energiecheck-v2.vercel.app/?code=${workerCode}&source=qr`}
          </p>
        </section>
      </main>

      <footer className="py-8 text-center border-t border-white/5">
        <p className="text-gray-800 text-[9px] uppercase tracking-widest">
          Energiecheck-24 | Technical Lead: Giovanni Lazo
        </p>
      </footer>
    </div>
  );
}