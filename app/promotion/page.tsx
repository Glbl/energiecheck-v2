"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronRight, Gift, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// Configuración del cliente de Supabase
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

  // Captura segura de parámetros
  const workerCodeParam = searchParams.get('code');
  const sourceParam = searchParams.get('source') || 'direct_link';

  // 1. RASTREO INICIAL (Se ejecuta una sola vez al cargar)
  useEffect(() => {
    const initTracking = async () => {
      if (!workerCodeParam) {
        console.warn("⚠️ No worker code found in URL. Tracking skipped.");
        return;
      }

      const cleanCode = workerCodeParam.trim().toUpperCase();
      setWorkerId(cleanCode);

      // Manejo de Session ID
      let sId = localStorage.getItem('funnel_session_id');
      if (!sId) {
        sId = `sess_${Math.random().toString(36).substring(2, 11)}`;
        localStorage.setItem('funnel_session_id', sId);
      }

      const userAgent = window.navigator.userAgent;
      const isMobile = /iPhone|Android/i.test(userAgent);

      console.log("🚀 Iniciando rastreo para:", cleanCode, "vía", sourceParam);

      try {
        // Registro en user_funnel_logs
        const { error: fErr } = await supabase.from('user_funnel_logs').insert([{
          session_id: sId,
          worker_id: cleanCode,
          current_step: 'AKTION START',
          action_type: 'view_step',
          metadata: { source: sourceParam, device: isMobile ? 'mobile' : 'desktop' }
        }]);
        if (fErr) console.error("❌ Error user_funnel_logs:", fErr.message);
        else console.log("✅ funnel_log registrado");

        // Registro en leads_tracking
        const { error: lErr } = await supabase.from('leads_tracking').insert([{
          worker_code: cleanCode,
          user_agent: userAgent,
          device_type: isMobile ? 'Celular' : 'Desktop/Laptop',
          scanned_qr: sourceParam === 'qr' ? 'Yes' : 'No'
        }]);
        if (lErr) console.error("❌ Error leads_tracking:", lErr.message);
        else console.log("✅ lead_tracking registrado");

      } catch (err) {
        console.error("❌ Error de red/conexión:", err);
      }
    };

    initTracking();
  }, [workerCodeParam, sourceParam]);

  // 2. RASTREO DE PASOS (Se ejecuta cada vez que cambia currentStep)
  useEffect(() => {
    if (currentStep === 1 || !workerCodeParam) return;

    const trackStep = async () => {
      const sId = localStorage.getItem('funnel_session_id');
      const stepName = currentStep === 2 ? 'SOLAR VORTEILE' : 'KUNDENDATEN FORMULAR';
      
      console.log("📍 Cambiando a paso:", stepName);

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
      // Registro final del cliente
      const { error: custError } = await supabase.from('customers').insert([{
        full_name: fullName,
        phone: phone,
        email: email,
        worker_id: workerId,
        status: 'pending',
        commission_status: 'pending',
        purchase_amount: 0,
        commission_earned: 0
      }]);

      if (custError) throw custError;

      // Log de conversión final
      const sId = localStorage.getItem('funnel_session_id');
      await supabase.from('user_funnel_logs').insert([{
        session_id: sId,
        worker_id: workerId,
        current_step: 'FORMULAR GESENDET (KONVERSION)',
        action_type: 'conversion',
        metadata: { source: sourceParam }
      }]);

      console.log("🎯 Conversión exitosa");
      window.location.href = "https://energiecheck-24.de";
    } catch (error: any) {
      console.error("❌ Error final:", error.message);
      setIsSubmitting(false);
      alert("Fehler bei der Registrierung.");
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto px-4">
      {currentStep === 1 && (
        <div className="animate-in fade-in duration-1000 w-full pb-16 pt-10">
          <h2 className="text-[#d4e137] text-4xl font-black italic uppercase leading-none">500€ sofort CASH</h2>
          <p className="text-white text-3xl font-black mt-1">+</p>
          <div className="relative w-full mt-4 flex justify-center">
             <img src="/produkte-bundle.webp" alt="Bundle" className="w-[90%] h-auto drop-shadow-2xl" />
          </div>
          <div className="mt-8 space-y-1">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">ENERGIE <span className="text-[#d4e137]">FÖRDERUNG</span></h1>
          </div>
          <div className="w-full max-w-xs mt-10 mx-auto">
            <button onClick={() => setCurrentStep(2)} className="w-full py-5 bg-[#d4e137] text-black font-black text-xl rounded-full uppercase italic hover:scale-105 transition-all">
              Jetzt Tarif prüfen
            </button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="max-w-md mx-auto p-8 pt-20 animate-in slide-in-from-right text-center">
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

      {currentStep === 3 && (
        <div className="max-w-md mx-auto p-4 pt-10 animate-in slide-in-from-right w-full">
          <div className="bg-[#d4e137] p-8 rounded-[2rem] text-black mb-8 shadow-2xl">
            <Gift className="mx-auto mb-2" size={40} />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">FAST FERTIG!</h2>
            <p className="font-bold text-xs mt-2 uppercase italic">Bitte füllen Sie Ihre Daten aus.</p>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4 text-left">
            <input type="text" placeholder="Vollständiger Name" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#d4e137]" />
            <input type="text" placeholder="Telefonnummer" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#d4e137]" />
            <input type="email" placeholder="E-Mail Adresse" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#d4e137]" />
            <button type="submit" disabled={isSubmitting} className="w-full mt-6 py-5 bg-orange-600 text-white font-black rounded-2xl uppercase italic tracking-widest disabled:opacity-50">
              {isSubmitting ? "WIRD BEARBEITET..." : "GUTSCHEIN SICHERN"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// COMPONENTE PRINCIPAL CON SUSPENSE
export default function PromotionPage() {
  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans overflow-x-hidden relative">
      <div className="absolute inset-0 z-0 flex justify-center items-center opacity-30">
        <img 
          src="/germany-bg-glow.webp" 
          alt="DE Map" 
          className="w-full max-w-2xl h-auto object-contain" 
          style={{ maskImage: 'radial-gradient(circle, black 30%, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 80%)' }} 
        />
      </div>
      <Suspense fallback={<div className="text-white text-center pt-20 font-black italic">LADEN...</div>}>
        <PromotionContent />
      </Suspense>
    </div>
  );
}