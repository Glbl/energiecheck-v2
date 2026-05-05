"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  User, Phone, Mail, CheckCircle, 
  ArrowLeft, Gift, Sparkles, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

// 1. Inicialización de Supabase con variables de entorno
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BusinessPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // ID por defecto de Jose Alejandro Lorusso (JL040981)
  const [workerId, setWorkerId] = useState("JL040981");

  // Capturar el ID del trabajador desde la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setWorkerId(code.trim().toUpperCase());
    }
  }, []);

  // Función para procesar la comisión automática (10%)
  const handlePurchase = async (customerId: string, amount: number) => {
    const commission = amount * 0.10;
    await supabase
      .from('customers')
      .update({ 
        status: 'purchased',
        purchase_amount: amount,
        commission_earned: commission,
        commission_status: 'pending'
      })
      .eq('id', customerId);
  };

  // Función principal de registro con manejo de Foreign Keys
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Limpieza estricta del ID para evitar conflictos (Error 409)
    const cleanWorkerId = workerId.trim().toUpperCase();

    const { data, error } = await supabase.from('customers').insert([
      {
        full_name: fullName,
        phone: phone,
        email: email,
        worker_id: cleanWorkerId,
        status: 'registered'
      }
    ]).select();

    if (error) {
      console.error("Error detallado de Supabase:", error);
      
      // Error 23503: Violación de Foreign Key (El ID no existe en employees)
      if (error.code === '23503') {
        setErrorMessage(`Der Mitarbeiter-Code "${cleanWorkerId}" ist ungültig.`);
      } else {
        setErrorMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      }
      return;
    }

    if (data) {
      setIsSaved(true);
      await handlePurchase(data[0].id, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      
      <div className="absolute top-6 left-6">
        <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-xs uppercase font-bold">
          <ArrowLeft size={16} /> Portal
        </Link>
      </div>

      <main className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-orange-500 font-black italic text-3xl uppercase tracking-tighter">Energiecheck-24</h1>
        </div>

        {isSaved ? (
          <div className="text-center p-12 bg-white/5 border border-[#d4e137]/30 rounded-[3rem] animate-in fade-in zoom-in duration-500 shadow-[0_0_50px_rgba(212,225,55,0.1)]">
            <CheckCircle className="text-[#d4e137] mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-black uppercase italic">Vielen Dank!</h2>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              Deine Daten und el <span className="text-[#d4e137] font-bold">50€ Gutschein</span> wurden registriert.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Tag Visual del Bono de 50€ */}
            <div className="absolute -top-4 -right-4 bg-[#d4e137] text-black text-[10px] font-black px-4 py-2 rounded-full rotate-12 shadow-xl z-10 flex items-center gap-2 animate-bounce">
              <Gift size={14} /> 50€ BONUS ACTIVATED
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-3xl shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-[#d4e137] to-orange-500 opacity-50" />
              
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-white/10 p-2 rounded-xl">
                  <Sparkles className="text-[#d4e137]" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase italic leading-none">Deine Anmeldung</h3>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Ref-ID: {workerId}</p>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase italic animate-shake">
                  <AlertCircle size={18} />
                  {errorMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" placeholder="Vollständiger Name" required
                    className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-[#d4e137] transition-all text-white text-sm"
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="tel" placeholder="Telefonnummer" required
                    className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-[#d4e137] transition-all text-white text-sm"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" placeholder="E-Mail Adresse" required
                    className="w-full bg-black/50 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-[#d4e137] transition-all text-white text-sm"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <button className="w-full py-5 bg-[#d4e137] text-black font-black rounded-2xl uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#d4e137]/20">
                    BONUS SICHERN
                  </button>
                  <p className="text-[8px] text-gray-600 text-center mt-6 uppercase tracking-[0.2em] font-bold">
                    *Gutschein gültig nach erfolgreicher Erstberatung
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}