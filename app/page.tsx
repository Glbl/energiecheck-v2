"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, ArrowRight, CheckCircle2, MapPin, Zap, Lightbulb } from 'lucide-react';

export default function LandingPage() {
  const [workerCode, setWorkerCode] = useState("04091981P0001");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ plz: '', consumption: '' });

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
    // Si la URL contiene source=qr, marcamos como "Yes", de lo contrario "No"
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
        console.error("Error en el registro técnico:", err);
      }
    };

    trackVisit();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
      {/* HEADER SEGÚN PROTOTIPO */}
      <nav className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-orange-500 font-black tracking-tighter text-lg md:text-xl uppercase italic leading-none">
            Energiecheck-24
          </span>
          <span className="text-[8px] text-gray-500 uppercase tracking-[0.2em] mt-1 hidden md:block">
            Energie. Überall. Jetztzeit.
          </span>
        </div>
        <div className="bg-white/5 px-3 py-1 md:px-4 md:py-2 rounded-full border border-white/10 flex items-center gap-2">
          <span className="text-[9px] text-gray-400 font-bold uppercase">ID Berater:</span>
          <span className="text-xs font-mono text-orange-400">{workerCode}</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* MAIN PROMOTION CARD */}
        <div className="bg-gradient-to-br from-slate-900 to-black rounded-[2.5rem] p-6 md:p-12 text-center border border-white/10 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500"></div>
          
          <div className="mb-8">
            <h2 className="text-orange-500 font-black text-xl md:text-2xl uppercase tracking-tighter">ECO-HOME-ENERGIE STATION</h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em]">Energie. Überall. Jederzeit.</p>
          </div>

          <div className="inline-block px-4 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase mb-6 border border-orange-500/20">
            Solar-Station Förderung Sichern
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black italic mb-8 tracking-tighter uppercase">
            ProMotion
          </h1>
          
          <div className="space-y-4 mb-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
              <span className="text-5xl md:text-7xl font-black">+500€</span>
              <span className="text-gray-400 font-light italic uppercase text-sm md:text-xl">Cash Back</span>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2">
              <span className="text-3xl md:text-5xl font-black text-green-400">+250€</span>
              <span className="text-gray-500 font-light italic uppercase text-sm md:text-lg">Eco-Starter-Bonus</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-blue-400 text-xs font-bold uppercase mt-4 tracking-widest">
              <Zap size={14} fill="currentColor" /> Inkl. E-Scooter Option
            </div>
          </div>

          {/* PLAN B: MINI TARIF-CHECK INTERACTIVO */}
          <div className="bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10 max-w-sm mx-auto shadow-inner">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 text-orange-500 uppercase font-black italic text-xs tracking-widest">
                  <MapPin size={16} /> Schritt 1: Postleitzahl
                </div>
                <input 
                  type="text" 
                  maxLength={5}
                  placeholder="Ej: 80331"
                  className="w-full bg-black border border-white/20 p-4 rounded-xl text-center text-2xl font-mono outline-none focus:border-orange-500 transition-all text-orange-500"
                  onChange={(e) => setFormData({...formData, plz: e.target.value})}
                />
                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-orange-500 text-white font-black rounded-xl uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-500/20"
                >
                  Weiter <ArrowRight size={18} className="inline ml-2" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 text-orange-500 uppercase font-black italic text-xs tracking-widest">
                  <Lightbulb size={16} /> Schritt 2: Jahresverbrauch
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['1500 kWh', '2500 kWh', '3500 kWh', '5000+ kWh'].map((val) => (
                    <button 
                      key={val}
                      onClick={() => { setFormData({...formData, consumption: val}); setStep(3); }}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-orange-500 hover:text-white transition-all text-[10px] font-bold uppercase"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-4 py-4 animate-in fade-in zoom-in duration-300">
                <div className="flex justify-center text-green-400"><CheckCircle2 size={48} /></div>
                <h3 className="text-xl font-black uppercase italic">Analyse Bereit!</h3>
                <p className="text-gray-500 text-[10px] uppercase">Beste Tarife für {formData.plz} gefunden</p>
                <button 
                  onClick={() => window.location.href = `https://www.energiecheck-24.de/de#energietarif-berechnen`}
                  className="w-full py-4 bg-white text-black font-black rounded-xl uppercase shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-orange-500 hover:text-white transition-all"
                >
                  Jetzt Tarife berechnen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* QR SECTION */}
        <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic mb-4">Mein <span className="text-orange-500">QR-Code</span></h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Scannen Sie diesen personalisierten Code, um die Promotion direkt auf Ihrem Smartphone zu aktivieren y registrar su visita.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 uppercase tracking-widest"><CheckCircle2 size={14}/> Live Tracking</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest"><Smartphone size={14}/> Mobile Ready</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-[2.5rem] shadow-2xl flex flex-col items-center border-4 border-orange-500/10">
              <QRCodeSVG 
                // IMPORTANTE: El source=qr asegura el "Yes" en Supabase
                value={`https://energiecheck-v2.vercel.app/?code=${workerCode}&source=qr`} 
                size={160}
                level={"H"}
                imageSettings={{ src: "/logo.png", height: 35, width: 35, excavate: true }}
              />
              <div className="mt-4 px-4 py-1 bg-black/5 rounded-full">
                <p className="text-black font-mono text-[10px] font-black">{workerCode}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center px-6">
        <p className="text-gray-600 text-[9px] uppercase tracking-[0.3em] font-medium">
          © 2026 Energiecheck-24 Deutschland | Technical Lead: Giovanni Lazo
        </p>
      </footer>
    </div>
  );
}