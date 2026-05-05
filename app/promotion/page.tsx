"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronRight, Gift, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PromotionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [workerId, setWorkerId] = useState("JL040981");
  const [sessionId] = useState(`sess_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      const cleanCode = code.trim().toUpperCase();
      setWorkerId(cleanCode);
    }
  }, []);

  const trackStep = async (stepName: string, id: string) => {
    try {
      await supabase.from('user_funnel_logs').insert([{
        session_id: sessionId,
        worker_id: id,
        current_step: stepName,
        action_type: 'view_step',
        time_spent_seconds: 5
      }]);
    } catch (e) { console.error(e); }
  };

  const handleNextStep = (next: number, stepTitle: string) => {
    setCurrentStep(next);
    trackStep(stepTitle, workerId);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans overflow-x-hidden relative">
      
      {/* 1. IMAGEN DE FONDO (Mapa/Círculo) */}
      <div className="absolute inset-0 z-0 flex justify-center items-center opacity-40">
        <img 
          src="/germany-bg-glow.webp" // Reemplaza con tu ruta
          alt="Background Decor"
          className="w-full max-w-2xl h-auto object-contain"
          style={{
            maskImage: 'radial-gradient(circle, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 80%)'
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto px-4">
        
        {/* PASO 1 */}
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-1000 w-full">
            
            {/* Título Superior */}
            <div className="pt-10 pb-4">
              <h2 className="text-[#d4e137] text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                500€ sofort CASH
              </h2>
              <p className="text-white text-3xl font-black mt-1">+</p>
            </div>

            {/* SECCIÓN DE PRODUCTOS (Scooter, Bici, etc) */}
            <div className="relative w-full mt-2 flex justify-center">
              {/* Aro de luz de la base */}
              <div className="absolute bottom-6 w-[80%] h-[15px] bg-[#d4e137] rounded-[100%] blur-[25px] opacity-30"></div>
              <div className="absolute bottom-8 w-[70%] h-[5px] border-2 border-[#d4e137] rounded-[100%] opacity-60"></div>
              
              <img 
                src="/produkte-bundle.webp" // Reemplaza con tu ruta (Imagen del scooter/productos)
                alt="Scooter and Bundle" 
                className="relative z-10 w-[90%] h-auto drop-shadow-2xl"
              />
            </div>

            {/* Títulos ENERGIE FÖRDERUNG */}
            <div className="mt-8 space-y-1">
              <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                ENERGIE <span className="text-[#d4e137]">FÖRDERUNG</span>
              </h1>
              <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">sichern</h1>
            </div>

            {/* SECCIÓN DE BANDERAS Y BONUS */}
            <div className="flex items-center justify-between w-full max-w-sm mt-8 mx-auto">
              <img src="/germany-flag3.png" alt="DE" className="w-10 h-auto object-contain" />
              
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none">Zusätzliche Förderung möglich</p>
                <h3 className="text-lg font-black uppercase italic mt-2 tracking-tight">MÜNCHEN SOLAR BONUS</h3>
                <p className="text-[#d4e137] text-2xl font-black">+ 320 €</p>
              </div>

              <img src="/germany-flag3.png" alt="DE" className="w-10 h-auto object-contain" />
            </div>

            {/* BOTÓN PRINCIPAL */}
            <div className="w-full max-w-xs mt-10 mx-auto">
              <button 
                onClick={() => handleNextStep(2, "SOLAR VORTEILE")}
                className="w-full py-5 bg-[#d4e137] text-black font-black text-xl rounded-full shadow-[0_15px_35px_rgba(212,225,55,0.25)] hover:scale-105 active:scale-95 transition-all uppercase italic"
              >
                Jetzt Tarif prüfen
              </button>
              
              {/* Textos de cierre */}
              <div className="mt-6 text-sm font-medium text-gray-300 space-y-4">
                <p className="leading-tight">30–50% Stromkosten sparen mit der <br/> <span className="text-white font-bold italic">Eco-Home-E-Station</span></p>
                
                <div className="space-y-1">
                  <p className="text-white">In unter <span className="text-[#d4e137]">5 Minuten</span> starten</p>
                  <p className="text-white uppercase font-bold">Bis zu <span className="text-[#d4e137]">820 €</span> verdienen</p>
                  <p className="text-white font-bold tracking-tight">+ bis zu <span className="text-[#d4e137]">800 €</span> jährlich sparen</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: BENEFICIOS */}
        {currentStep === 2 && (
          <div className="max-w-md mx-auto p-8 pt-20 animate-in slide-in-from-right duration-500 text-center relative z-20">
            <CheckCircle2 className="text-[#d4e137] mx-auto mb-6" size={60} />
            <h2 className="text-4xl font-black uppercase italic mb-6">Deine <span className="text-[#d4e137]">Vorteile</span></h2>
            <ul className="text-left space-y-4 mb-10">
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10 font-bold italic uppercase text-xs">✓ 0€ Investitionskosten</li>
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10 font-bold italic uppercase text-xs">✓ Staatliche Förderung</li>
            </ul>
            <button onClick={() => handleNextStep(3, "ERSPARNIS-CHECK")} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase flex justify-between px-8 items-center">
              Weiter <ChevronRight />
            </button>
          </div>
        )}

        {/* PASO 3: CIERRE */}
        {currentStep === 3 && (
          <div className="max-w-md mx-auto p-8 pt-20 animate-in slide-in-from-right duration-500 text-center relative z-20">
            <div className="bg-[#d4e137] p-10 rounded-[3rem] text-black shadow-2xl">
              <Gift className="mx-auto mb-4" size={50} />
              <h2 className="text-3xl font-black uppercase italic leading-tight">FAST FERTIG!</h2>
              <p className="font-bold text-sm mt-4 uppercase italic">jetzt Ihr exklusiver Bonus.</p>
            </div>
            
            <div className="mt-12">
              <Link 
                href={`/business?code=${workerId}`}
                className="w-full py-6 bg-orange-600 text-white font-black rounded-2xl uppercase text-center block shadow-xl hover:scale-105 transition-all text-lg"
              >
                50€ BONUS SICHERN
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
