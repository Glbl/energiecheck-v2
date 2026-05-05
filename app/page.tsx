"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Zap, Shield, TrendingUp, ChevronRight, 
  Clock, CheckCircle2, Gift 
} from 'lucide-react';
import Link from 'next/link';

// Inicialización de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LandingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [workerId, setWorkerId] = useState("04091981P0001"); // ID por defecto de Jose
  const [sessionId] = useState(`sess_${Math.random().toString(36).substr(2, 9)}`);

  // Capturar el ID del trabajador desde la URL y registrar inicio
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setWorkerId(code);
      trackStep("PROMOTION START", code);
    } else {
      trackStep("PROMOTION START (Sin ID)", workerId);
    }
  }, []);

  // Función para llenar la tabla user_funnel_logs
  const trackStep = async (stepName: string, id: string) => {
    await supabase.from('user_funnel_logs').insert([
      {
        session_id: sessionId,
        worker_id: id,
        current_step: stepName,
        action_type: 'view_step',
        time_spent_seconds: 5 // Tiempo base estimado por paso
      }
    ]);
  };

  const handleNextStep = (next: number, stepTitle: string) => {
    setCurrentStep(next);
    trackStep(stepTitle, workerId);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* HEADER DINÁMICO */}
      <header className="p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-black/50">
        <h1 className="text-orange-500 font-black italic text-xl uppercase tracking-tighter">Energiecheck-24</h1>
        <div className="flex items-center gap-2 bg-[#d4e137] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase italic">
          <Gift size={12} /> 50€ Bonus Aktiv
        </div>
      </header>

      <main className="max-w-xl mx-auto p-8 pt-12">
        
        {/* INDICADOR DE PASOS */}
        <div className="flex gap-2 mb-12 justify-center">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1 rounded-full transition-all duration-500 ${s <= currentStep ? 'w-8 bg-[#d4e137]' : 'w-4 bg-white/10'}`} />
          ))}
        </div>

        {/* CONTENIDO DE LOS PASOS (PROMOTION) */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {currentStep === 1 && (
            <div className="space-y-6">
              <Zap className="text-[#d4e137]" size={48} />
              <h2 className="text-4xl font-black uppercase italic leading-none">Bereit für die <span className="text-orange-500">Solar-Revolution?</span></h2>
              <p className="text-gray-400 leading-relaxed">Entdecke, wie du mit Energiecheck-24 deine Energiekosten senken und die Umwelt schützen kannst.</p>
              <button onClick={() => handleNextStep(2, " SOLAR VORTEILE")} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase flex justify-between px-8 items-center hover:bg-[#d4e137] transition-all group">
                Weiter <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <Shield className="text-blue-400" size={48} />
              <h2 className="text-4xl font-black uppercase italic leading-none">Maximale <span className="text-blue-400">Sicherheit</span></h2>
              <p className="text-gray-400 leading-relaxed">Wir arbeiten nur mit zertifizierten Partnern zusammen, um dir die beste Qualität zu garantieren.</p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 italic text-[10px] font-bold uppercase tracking-widest text-center">TÜV Geprüft</div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 italic text-[10px] font-bold uppercase tracking-widest text-center">Made in Germany</div>
              </div>
              <button onClick={() => handleNextStep(3, "ERSPARNIS-CHECK")} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase flex justify-between px-8 items-center hover:bg-[#d4e137] transition-all">
                Weiter <ChevronRight />
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <TrendingUp className="text-green-400" size={48} />
              <h2 className="text-4xl font-black uppercase italic leading-none">Bis zu <span className="text-green-400">80% Ersparnis</span></h2>
              <p className="text-gray-400 leading-relaxed">Stell dir vor, du zahlst fast nichts mehr für deinen Strom. Unsere Experten machen es möglich.</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-bold uppercase italic tracking-tighter"><CheckCircle2 className="text-[#d4e137]" size={16} /> 0€ Investitionskosten</li>
                <li className="flex items-center gap-3 text-sm font-bold uppercase italic tracking-tighter"><CheckCircle2 className="text-[#d4e137]" size={16} /> Staatliche Förderung</li>
              </ul>
              <button onClick={() => handleNextStep(4, "50€ BONUS-STEP")} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase flex justify-between px-8 items-center hover:bg-[#d4e137] transition-all">
                Letzter Schritt <ChevronRight />
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-[#d4e137] p-8 rounded-[3rem] text-black text-center shadow-[0_0_50px_rgba(212,225,55,0.2)]">
                <Clock className="mx-auto mb-4 animate-spin-slow" size={40} />
                <h2 className="text-3xl font-black uppercase italic leading-tight">Nur noch ein Klick!</h2>
                <p className="font-bold text-sm mt-4 uppercase tracking-tighter italic">Sichere dir jetzt deinen persönlichen 50€ Gutschein.</p>
              </div>
              <p className="text-gray-500 text-[10px] text-center uppercase font-bold tracking-widest mt-8">Referenz-ID: {workerId}</p>
              {/* ESTE LINK LLEVA AL CLIENTE AL FORMULARIO CON EL BONO */}
              <Link 
                href={`/business?code=${workerId}`}
                onClick={() => trackStep("FINALE REGISTRIERUNG", workerId)}
                className="w-full py-6 bg-orange-600 text-white font-black rounded-2xl uppercase text-center flex justify-center items-center shadow-xl hover:scale-[1.02] transition-all"
              >
                JETZT BONUS SICHERN
              </Link>
            </div>
          )}

        </div>
      </main>

      <footer className="mt-12 p-12 text-center border-t border-white/5 opacity-20">
        <p className="text-[9px] uppercase tracking-[0.5em] font-black italic">Energiecheck-24 x ProMotion System</p>
      </footer>
    </div>
  );
}