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
  const [workerId, setWorkerId] = useState("JL040981"); // ID por defecto
  const [sessionId] = useState(`sess_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      const cleanCode = code.trim().toUpperCase();
      setWorkerId(cleanCode);
      trackStep("PROMOTION START", cleanCode);
    } else {
      trackStep("PROMOTION START (DEFAULT)", workerId);
    }
  }, []);

  const trackStep = async (stepName: string, id: string) => {
    await supabase.from('user_funnel_logs').insert([{
      session_id: sessionId,
      worker_id: id,
      current_step: stepName,
      action_type: 'view_step',
      time_spent_seconds: 5
    }]);
  };

  const handleNextStep = (next: number, stepTitle: string) => {
    setCurrentStep(next);
    trackStep(stepTitle, workerId);
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-[#d4e137] selection:text-black">
      
      {/* PASO 1: DISEÑO CASH 500€ */}
      {currentStep === 1 && (
        <div className="flex flex-col items-center text-center animate-in fade-in duration-700">
          <div className="pt-12 pb-6">
             <h2 className="text-[#d4e137] text-5xl font-black italic tracking-tighter uppercase leading-none">
              500€ sofort CASH
            </h2>
            <p className="text-white text-4xl font-black mt-2">+</p>
          </div>

          <div className="relative w-full max-w-lg px-4">
            <img 
              src="/produkte-bundle.webp" 
              alt="Prizes" 
              className="w-full h-auto drop-shadow-[0_0_30px_rgba(212,225,55,0.2)]"
            />
          </div>

          <div className="mt-8 space-y-2">
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-tight">
              ENERGIE <span className="text-[#d4e137]">FÖRDERUNG</span>
            </h1>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter">sichern</h1>
          </div>

          <div className="flex items-center gap-8 mt-6">
            <span className="text-4xl">🇩🇪</span>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Zusätzliche Förderung möglich</p>
              <h3 className="text-lg font-black uppercase italic mt-1">MÜNCHEN SOLAR BONUS</h3>
              <p className="text-[#d4e137] text-xl font-black">+ 320 €</p>
            </div>
            <span className="text-4xl">🇩🇪</span>
          </div>

          <div className="w-full max-w-md px-8 mt-10">
            <button 
              onClick={() => handleNextStep(2, "SOLAR VORTEILE")}
              className="w-full py-6 bg-[#d4e137] text-black font-black text-xl rounded-full shadow-[0_10px_30px_rgba(212,225,55,0.3)] hover:scale-105 transition-all uppercase italic"
            >
              Jetzt Tarif prüfen
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: BENEFICIOS */}
      {currentStep === 2 && (
        <div className="max-w-md mx-auto p-8 pt-20 animate-in slide-in-from-right duration-500 text-center">
          <CheckCircle2 className="text-[#d4e137] mx-auto mb-6" size={60} />
          <h2 className="text-4xl font-black uppercase italic mb-6 leading-none">Deine <span className="text-[#d4e137]">Vorteile</span></h2>
          <ul className="text-left space-y-4 mb-10">
            <li className="bg-white/5 p-4 rounded-2xl border border-white/10 font-bold italic uppercase text-xs tracking-widest">✓ 0€ Investitionskosten</li>
            <li className="bg-white/5 p-4 rounded-2xl border border-white/10 font-bold italic uppercase text-xs tracking-widest">✓ Staatliche Förderung</li>
          </ul>
          <button onClick={() => handleNextStep(3, "ERSPARNIS-CHECK")} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase flex justify-between px-8 items-center">
            Weiter <ChevronRight />
          </button>
        </div>
      )}

      {/* PASO 3: CIERRE CON BONO DE 50€ */}
      {currentStep === 3 && (
        <div className="max-w-md mx-auto p-8 pt-20 animate-in slide-in-from-right duration-500 text-center">
          <div className="bg-[#d4e137] p-10 rounded-[3rem] text-black shadow-[0_0_60px_rgba(212,225,55,0.2)]">
            <Gift className="mx-auto mb-4" size={50} />
            <h2 className="text-3xl font-black uppercase italic leading-tight">FAST FERTIG!</h2>
            <p className="font-bold text-sm mt-4 uppercase italic tracking-tighter">Sichere dir jetzt deinen exklusiven 50€ Gutschein.</p>
          </div>
          
          <div className="mt-12">
            <Link 
              href={`/business?code=${workerId}`}
              onClick={() => trackStep("FINALE REGISTRIERUNG", workerId)}
              className="w-full py-6 bg-orange-600 text-white font-black rounded-2xl uppercase text-center flex justify-center items-center shadow-xl hover:scale-105 transition-all text-lg"
            >
              50€ BONUS SICHERN
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}