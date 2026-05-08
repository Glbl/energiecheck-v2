"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronRight, Gift, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function PromotionContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [workerId, setWorkerId] = useState("JL040981");
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLanding, setActiveLanding] = useState('');

  const workerCodeParam = searchParams.get('code');
  const sourceParam = searchParams.get('source') || 'direct_link';

  // 1. Cargar imagen de fondo dinámica
  useEffect(() => {
    async function loadActiveLanding() {
      const { data } = await supabase
        .from('promotions')
        .select('image_url')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) setActiveLanding(data.image_url);
    }
    loadActiveLanding();
  }, []);

  // 2. Tracking Inicial
  useEffect(() => {
    const initTracking = async () => {
      if (!workerCodeParam) return;
      const cleanCode = workerCodeParam.trim().toUpperCase();
      setWorkerId(cleanCode);

      let sId = localStorage.getItem('funnel_session_id');
      if (!sId) {
        sId = `sess_${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem('funnel_session_id', sId);
      }

      const userAgent = window.navigator.userAgent;
      const isMobile = /iPhone|Android/i.test(userAgent);

      try {
        await supabase.from('user_funnel_logs').insert([{
          session_id: sId,
          worker_id: cleanCode,
          current_step: 'AKTION START',
          action_type: 'view_step',
          metadata: { source: sourceParam, device: isMobile ? 'mobile' : 'desktop' }
        }]);

        await supabase.from('leads_tracking').insert([{
          worker_code: cleanCode,
          user_agent: userAgent,
          device_type: isMobile ? 'Celular' : 'Desktop/Laptop',
          scanned_qr: sourceParam === 'qr' ? 'Yes' : 'No'
        }]);
      } catch (err) {
        console.error("Tracking error:", err);
      }
    };
    initTracking();
  }, [workerCodeParam, sourceParam]);

  // 3. Tracking de pasos
  useEffect(() => {
    if (currentStep === 1 || !workerCodeParam) return;
    const trackStep = async () => {
      const sId = localStorage.getItem('funnel_session_id');
      const stepName = currentStep === 2 ? 'SOLAR VORTEILE' : 'KUNDENDATEN FORMULAR';
      await supabase.from('user_funnel_logs').insert([{
        session_id: sId,
        worker_id: workerCodeParam.toUpperCase(),
        current_step: stepName,
        action_type: 'view_step',
        metadata: { source: sourceParam }
      }]);
    };
    trackStep();
  }, [currentStep]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await supabase.from('customers').insert([{
        full_name: fullName, phone: phone, email: email, worker_id: workerId,
        status: 'pending', commission_status: 'pending', purchase_amount: 0, commission_earned: 0
      }]);
      
      const sId = localStorage.getItem('funnel_session_id');
      await supabase.from('user_funnel_logs').insert([{
        session_id: sId, worker_id: workerId,
        current_step: 'FORMULAR GESENDET (KONVERSION)', action_type: 'conversion',
        metadata: { source: sourceParam }
      }]);

      window.location.href = "https://energiecheck-24.de";
    } catch (error) {
      setIsSubmitting(false);
      alert("Fehler.");
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto px-4">
      
      {/* PASO 1: LANDING */}
      {currentStep === 1 && (
        <div className="animate-in fade-in duration-1000 w-full pb-16">
          {activeLanding ? (
            /* DISEÑO DE JOSÉ (IMAGEN DINÁMICA) */
            <div className="fixed inset-0 z-50 bg-[#05070a] flex flex-col items-center justify-center">
              <img 
                src={`https://hoigzuytnzlkypkruyom.supabase.co/storage/v1/object/public/promotions/${activeLanding}`} 
                className="w-full h-full object-contain"
                alt="Promotion Design"
              />
              <button 
                onClick={() => setCurrentStep(2)}
                className="absolute bottom-10 bg-[#d4e137] px-10 py-4 rounded-full text-black font-black uppercase italic shadow-2xl hover:scale-105 transition-transform"
              >
                Jetzt prüfen
              </button>
            </div>
          ) : (
            /* DISEÑO POR DEFECTO (EL "BACKUP") */
            <>
              <div className="pt-10 pb-4">
                <h2 className="text-[#d4e137] text-4xl font-black italic tracking-tighter uppercase leading-none">500€ sofort CASH</h2>
                <p className="text-white text-3xl font-black mt-1">+</p>
              </div>
              
              <div className="relative w-full mt-2 flex justify-center">
                <div className="absolute bottom-6 w-[80%] h-[15px] bg-[#d4e137] rounded-[100%] blur-[25px] opacity-30"></div>
                <img src="/produkte-bundle.webp" alt="Bundle" className="relative z-10 w-[90%] h-auto drop-shadow-2xl" />
              </div>

              <div className="mt-8 space-y-1">
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">ENERGIE <span className="text-[#d4e137]">FÖRDERUNG</span></h1>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">sichern</h1>
              </div>

              <div className="w-full max-w-xs mt-10 mx-auto">
                <button onClick={() => setCurrentStep(2)} className="w-full py-5 bg-[#d4e137] text-black font-black text-xl rounded-full uppercase italic">
                  Jetzt Tarif prüfen
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* PASO 2: VENTAJAS */}
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
            <p className="font-bold text-xs mt-2 uppercase italic">Bitte füllen Sie Ihre Datos aus.</p>
          </div>
          <form onSubmit={handleSubmitForm} className="space-y-4 text-left">
            <input type="text" placeholder="Vollständiger Name" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4e137]" />
            <input type="text" placeholder="Telefonnummer" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4e137]" />
            <input type="email" placeholder="E-Mail Adresse" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4e137]" />
            <button type="submit" disabled={isSubmitting} className="w-full mt-6 py-5 bg-orange-600 text-white font-black rounded-2xl uppercase italic disabled:opacity-50">
              {isSubmitting ? "WIRD BEARBEITET..." : "GUTSCHEIN SICHERN"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function PromotionPage() {
  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans overflow-x-hidden relative">
      <div className="absolute inset-0 z-0 flex justify-center items-center opacity-30">
        <img 
          src="/germany-bg-glow.webp" 
          alt="DE Map" 
          className="w-full max-w-2xl h-auto object-contain" 
        />
      </div>
      <Suspense fallback={<div className="text-white text-center pt-20 font-black italic">LADEN...</div>}>
        <PromotionContent />
      </Suspense>
    </div>
  );
}