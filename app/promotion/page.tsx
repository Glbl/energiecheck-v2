"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronRight, Gift, CheckCircle2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PromotionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [workerId, setWorkerId] = useState("JL040981");
  const [sessionId] = useState(`sess_${Math.random().toString(36).substr(2, 9)}`);
  
  // Estados para el formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    // Recuperamos tu lógica de tracking: si tiene &source=qr o &qr=true
    const isQr = params.get('source') === 'qr' || params.get('qr') === 'true' || window.location.href.includes('qrcode');

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      setWorkerId(cleanCode);
      trackLead(cleanCode, isQr);
      trackStep("PROMOTION START", cleanCode);
    }
  }, []);

  const trackLead = async (id: string, scanned: boolean) => {
    const userAgent = window.navigator.userAgent;
    const isMobile = /iPhone|Android/i.test(userAgent);
    try {
      await supabase.from('leads_tracking').insert([{
        worker_code: id,
        user_agent: userAgent,
        device_type: isMobile ? 'Celular' : 'Desktop/Laptop',
        scanned_qr: scanned ? 'Yes' : 'No'
      }]);
    } catch (e) { console.error("Lead Error:", e); }
  };

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

  // NUEVA FUNCIÓN: Guarda al cliente y redirige a la tienda
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    trackStep("FORM SUBMIT", workerId);

    try {
      // 1. Guardar en tabla customers
      await supabase.from('customers').insert([{
        worker_id: workerId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        status: 'pending', // Aún no compra, solo se registró
        commission_status: 'pending',
        commission_earned: 0 // Se calculará cuando compre
      }]);

      // 2. Redirigir a la tienda oficial de Jose
      window.location.href = "https://energiecheck-24.de";
      
    } catch (error) {
      console.error("Error al registrar cliente", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans overflow-x-hidden relative">
      <div className="absolute inset-0 z-0 flex justify-center items-center opacity-30">
        <img src="/germany-bg-glow.webp" alt="DE Map" className="w-full max-w-2xl h-auto object-contain" style={{ maskImage: 'radial-gradient(circle, black 30%, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 80%)' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto px-4">
        
        {/* PASO 1 y 2 (Se mantienen exactamente iguales, sin QR al final) */}
        {currentStep === 1 && (
          <div className="animate-in fade-in duration-1000 w-full pb-16">
            <div className="pt-10 pb-4">
              <h2 className="text-[#d4e137] text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">500€ sofort CASH</h2>
              <p className="text-white text-3xl font-black mt-1">+</p>
            </div>
            <div className="relative w-full mt-2 flex justify-center">
              <div className="absolute bottom-6 w-[80%] h-[15px] bg-[#d4e137] rounded-[100%] blur-[25px] opacity-30"></div>
              <img src="/produkte-bundle.webp" alt="Bundle" className="relative z-10 w-[90%] h-auto drop-shadow-2xl" style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }} />
            </div>
            <div className="mt-8 space-y-1">
              <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">ENERGIE <span className="text-[#d4e137]">FÖRDERUNG</span></h1>
              <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">sichern</h1>
            </div>
            <div className="flex items-center justify-center gap-6 md:gap-12 w-full mt-8">
              <img src="/germany-flag3.png" alt="DE" className="w-12 h-auto animate-bounce duration-[3000ms]" />
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none">Zusätzliche Förderung möglich</p>
                <h3 className="text-lg font-black uppercase italic mt-2 tracking-tight">MÜNCHEN SOLAR BONUS</h3>
                <p className="text-[#d4e137] text-3xl font-black">+ 320 €</p>
              </div>
              <img src="/germany-flag3.png" alt="DE" className="w-12 h-auto animate-bounce duration-[3000ms]" />
            </div>
            <div className="w-full max-w-xs mt-10 mx-auto">
              <button onClick={() => handleNextStep(2, "SOLAR VORTEILE")} className="w-full py-5 bg-[#d4e137] text-black font-black text-xl rounded-full shadow-[0_15px_35px_rgba(212,225,55,0.25)] hover:scale-105 transition-all uppercase italic">
                Jetzt Tarif prüfen
              </button>
            </div>
            <div className="mt-8 text-center space-y-6">
              <p className="text-sm md:text-base font-medium text-white leading-tight">30–50% Stromkosten sparen mit der <br /><span className="text-[#d4e137]">Eco-Home-E-Station</span></p>
              <div className="text-[17px] md:text-[19px] font-black text-white leading-snug tracking-tight">
                <p>In unter <span className="text-[#d4e137]">5 Minuten</span> starten</p>
                <p>Bis zu <span className="text-[#d4e137]">820 €</span> verdienen</p>
                <p>+ bis zu <span className="text-[#d4e137]">800 €</span> jährlich sparen</p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-md mx-auto p-8 pt-20 animate-in slide-in-from-right duration-500 text-center relative z-20">
            <CheckCircle2 className="text-[#d4e137] mx-auto mb-6" size={60} />
            <h2 className="text-4xl font-black uppercase italic mb-6 leading-none">Deine <span className="text-[#d4e137]">Vorteile</span></h2>
            <ul className="text-left space-y-4 mb-10">
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10 font-bold italic uppercase text-xs">✓ 0€ Investitionskosten</li>
              <li className="bg-white/5 p-4 rounded-2xl border border-white/10 font-bold italic uppercase text-xs">✓ Staatliche Förderung</li>
            </ul>
            <button onClick={() => handleNextStep(3, "FINALE REGISTRIERUNG")} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase flex justify-between px-8 items-center">
              Weiter <ChevronRight />
            </button>
          </div>
        )}

        {/* PASO 3: EL FORMULARIO DE REGISTRO RECUPERADO */}
        {currentStep === 3 && (
          <div className="max-w-md mx-auto p-4 pt-10 animate-in slide-in-from-right duration-500 text-center relative z-20 w-full">
            <div className="bg-[#d4e137] p-8 rounded-[2rem] text-black shadow-2xl mb-8">
              <Gift className="mx-auto mb-2" size={40} />
              <h2 className="text-2xl font-black uppercase italic leading-tight tracking-tighter">FAST FERTIG!</h2>
              <p className="font-bold text-xs mt-2 uppercase italic">Bitte füllen Sie Ihre Daten aus, um den 50€ Bonus zu aktivieren.</p>
            </div>
            
            <form onSubmit={handleSubmitForm} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-2">Vorname (Nombre)</label>
                <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:outline-none focus:border-[#d4e137]" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-2">Nachname (Apellido)</label>
                <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:outline-none focus:border-[#d4e137]" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-2">E-Mail Adresse</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 text-white focus:outline-none focus:border-[#d4e137]" />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-6 py-5 bg-orange-600 text-white font-black rounded-2xl uppercase text-center block shadow-xl hover:scale-105 transition-all text-sm disabled:opacity-50"
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