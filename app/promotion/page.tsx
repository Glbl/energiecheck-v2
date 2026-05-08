"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronRight, Gift, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PromotionPage() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [workerId, setWorkerId] = useState("JL040981");
  const workerCode = searchParams.get('code');
  const source = searchParams.get('source') || 'direct_link';

  // Estados para el formulario
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. EFECTO PARA RASTREO DE FUNNEL Y LEADS
  useEffect(() => {
    if (!workerCode) return;
    
    const cleanCode = workerCode.trim().toUpperCase();
    setWorkerId(cleanCode);

    // Recuperar o crear Session ID
    let sessionId = localStorage.getItem('funnel_session_id');
    if (!sessionId) {
      sessionId = `sess_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('funnel_session_id', sessionId);
    }

    const trackInitialVisit = async () => {
      const userAgent = window.navigator.userAgent;
      const isMobile = /iPhone|Android/i.test(userAgent);

      // Log en user_funnel_logs (Para el panel de José)
      await supabase.from('user_funnel_logs').insert({
        session_id: sessionId,
        worker_id: cleanCode,
        current_step: 'AKTION START',
        action_type: 'view_step',
        metadata: { source: source, device: isMobile ? 'mobile' : 'desktop' },
        time_spent_seconds: 0
      });

      // Log en leads_tracking (Tu tabla actual)
      await supabase.from('leads_tracking').insert([{
        worker_code: cleanCode,
        user_agent: userAgent,
        device_type: isMobile ? 'Celular' : 'Desktop/Laptop',
        scanned_qr: source === 'qr' ? 'Yes' : 'No'
      }]);
    };

    trackInitialVisit();
  }, [workerCode, source]);

  // 2. EFECTO PARA RASTREAR CAMBIOS DE PASO (PASO 2 y 3)
  useEffect(() => {
    if (!workerCode) return;
    const sessionId = localStorage.getItem('funnel_session_id');
    
    const logStepChange = async () => {
      const stepName = currentStep === 2 ? 'SOLAR VORTEILE' : currentStep === 3 ? 'KUNDENDATEN FORMULAR' : 'FINALE';
      await supabase.from('user_funnel_logs').insert({
        session_id: sessionId,
        worker_id: workerCode.toUpperCase(),
        current_step: stepName,
        action_type: 'view_step',
        metadata: { source: source },
        time_spent_seconds: 5
      });
    };

    if (currentStep > 1) logStepChange();
  }, [currentStep, workerCode, source]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Insertar en tabla customers
      const { error } = await supabase.from('customers').insert([{
        full_name: fullName,
        phone: phone,
        email: email,
        worker_id: workerId,
        status: 'pending',
        commission_status: 'pending',
        purchase_amount: 0,
        commission_earned: 0
      }]);

      if (error) throw error;

      // 2. Log final de conversión
      const sessionId = localStorage.getItem('funnel_session_id');
      await supabase.from('user_funnel_logs').insert({
        session_id: sessionId,
        worker_id: workerId,
        current_step: 'FORMULAR GESENDET (KONVERSION)',
        action_type: 'conversion',
        metadata: { source: source }
      });

      window.location.href = "https://energiecheck-24.de";
    } catch (error) {
      console.error("Error:", error);
      setIsSubmitting(false);
      alert("Error al registrar datos.");
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans overflow-x-hidden relative">
      {/* BACKGROUND MAP */}
      <div className="absolute inset-0 z-0 flex justify-center items-center opacity-30">
        <img 
          src="/germany-bg-glow.webp" 
          alt="DE Map" 
          className="w-full max-w-2xl h-auto object-contain" 
          style={{ maskImage: 'radial-gradient(circle, black 30%, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 80%)' }} 
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto px-4">
        
        {/* PASO 1: LANDING */}
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-1000 w-full pb-16">
            <div className="pt-10 pb-4">
              <h2 className="text-[#d4e137] text-4xl font-black italic tracking-tighter uppercase leading-none">500€ sofort CASH</h2>
              <p className="text-white text-3xl font-black mt-1">+</p>
            </div>
            
            <div className="relative w-full mt-2 flex justify-center">
              <div className="absolute bottom-6 w-[80%] h-[15px] bg-[#d4e137] rounded-[100%] blur-[25px] opacity-30"></div>
              <img src="/produkte-bundle.webp" alt="Bundle" className="relative z-10 w-[90%] h-auto drop-shadow-2xl" style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }} />
            </div>

            <div className="mt-8 space-y-1">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">ENERGIE <span className="text-[#d4e137]">FÖRDERUNG</span></h1>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">sichern</h1>
            </div>

            <div className="flex items-center justify-center gap-6 w-full mt-8">
              <img src="/germany-flag3.png" alt="DE" className="w-12 h-auto animate-bounce duration-[3000ms]" />
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Zusätzliche Förderung möglich</p>
                <h3 className="text-lg font-black uppercase italic mt-2 tracking-tight">MÜNCHEN SOLAR BONUS</h3>
                <p className="text-[#d4e137] text-3xl font-black">+ 320 €</p>
              </div>
              <img src="/germany-flag3.png" alt="DE" className="w-12 h-auto animate-bounce duration-[3000ms]" />
            </div>

            <div className="w-full max-w-xs mt-10 mx-auto">
              <button onClick={() => setCurrentStep(2)} className="w-full py-5 bg-[#d4e137] text-black font-black text-xl rounded-full shadow-[0_15px_35px_rgba(212,225,55,0.25)] hover:scale-105 transition-all uppercase italic">
                Jetzt Tarif prüfen
              </button>
            </div>

            <div className="mt-8 text-center space-y-6">
              <p className="text-sm font-medium text-white">30–50% Stromkosten sparen mit der <br /><span className="text-[#d4e137]">Eco-Home-E-Station</span></p>
              <div className="text-[17px] font-black text-white leading-snug">
                <p>In unter <span className="text-[#d4e137]">5 Minuten</span> starten</p>
                <p>Bis zu <span className="text-[#d4e137]">820 €</span> verdienen</p>
                <p>+ bis zu <span className="text-[#d4e137]">800 €</span> jährlich sparen</p>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: VANTAGES */}
        {currentStep === 2 && (
          <div className="max-w-md mx-auto p-8 pt-20 animate-in slide-in-from-right duration-500 text-center relative z-20">
            <CheckCircle2 className="text-[#d4e137] mx-auto mb-6" size={60} />
            <h2 className="text-4xl font-black uppercase italic mb-6">Deine <span className="text-[#d4e137]">Vorteile</span></h2>
            <ul className="text-left space-y-4 mb-10">
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10 font-bold uppercase text-xs">✓ 0€ Investitionskosten</li>
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10 font-bold uppercase text-xs">✓ Staatliche Förderung</li>
            </ul>
            <button onClick={() => setCurrentStep(3)} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase flex justify-between px-8 items-center">
              Weiter <ChevronRight />
            </button>
          </div>
        )}

        {/* PASO 3: FORMULARIO */}
        {currentStep === 3 && (
          <div className="max-w-md mx-auto p-4 pt-10 animate-in slide-in-from-right duration-500 text-center relative z-20 w-full">
            <div className="bg-[#d4e137] p-8 rounded-[2rem] text-black shadow-2xl mb-8">
              <Gift className="mx-auto mb-2" size={40} />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">FAST FERTIG!</h2>
              <p className="font-bold text-xs mt-2 uppercase italic">Bitte füllen Sie Ihre Daten aus, um den 50€ Bonus zu aktivieren.</p>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-2">Vollständiger Name</label>
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:border-[#d4e137] outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-2">Telefonnummer</label>
                <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:border-[#d4e137] outline-none" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-2">E-Mail Adresse</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:border-[#d4e137] outline-none" />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full mt-6 py-5 bg-orange-600 text-white font-black rounded-2xl uppercase shadow-xl hover:scale-105 transition-all text-sm disabled:opacity-50"
              >
                {isSubmitting ? "WIRD BEARBEITET..." : "GUTSCHEIN SICHERN & ZUM SHOP"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}