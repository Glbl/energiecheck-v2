"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const [workerCode, setWorkerCode] = useState("04091981P0001");

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Lógica para detectar dispositivo
    const getDeviceType = () => {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) return "Celular";
      return "Desktop/Laptop";
    };

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || "04091981P0001";
    setWorkerCode(code);

    const trackVisit = async () => {
      try {
        await supabase.from('leads_tracking').insert([
          { 
            worker_code: code, 
            user_agent: navigator.userAgent,
            device_type: getDeviceType() // Captura si es Celular o PC
          }
        ]);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    trackVisit();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Navbar con ID Berater dinámico */}
      <nav className="p-6 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <span className="text-orange-500 font-black text-xl uppercase italic">Energiecheck-24</span>
        <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-bold uppercase">ID Berater:</span>
          <span className="text-xs font-mono text-orange-400">{workerCode}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Banner de Promoción Principal */}
        <div className="bg-gradient-to-br from-slate-900 to-black rounded-[2.5rem] p-12 text-center border border-white/10 shadow-2xl mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase mb-6">Aktion 2026</span>
          <h1 className="text-7xl font-black italic mb-6">PROMOTION</h1>
          <div className="text-5xl font-black mb-2">+500€ <span className="text-xl text-gray-400 font-light italic">CASH BACK</span></div>
          <div className="text-3xl font-black text-green-400">+250€ <span className="text-lg text-gray-500 font-light">BONUS</span></div>
          
          <button className="mt-10 px-10 py-5 bg-white text-black font-black rounded-2xl flex items-center gap-2 mx-auto hover:bg-orange-500 hover:text-white transition-all uppercase">
            Tarif-Check Starten <ArrowRight size={20} />
          </button>
        </div>

        {/* Sección del QR */}
        <div className="grid md:grid-cols-2 gap-8 bg-white/5 p-10 rounded-[2.5rem] border border-white/10 items-center">
          <div>
            <h2 className="text-3xl font-black uppercase italic mb-4">Mein QR-Code</h2>
            <p className="text-gray-400 mb-6">Scannen Sie diesen Code, um die Promotion direkt auf Ihrem Smartphone zu aktivieren.</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-400"><CheckCircle2 size={16} /> Live Tracking Aktiv</div>
              <div className="flex items-center gap-2 text-sm text-blue-400"><Smartphone size={16} /> Optimiert für Mobilgeräte</div>
            </div>
          </div>
          <div className="flex flex-col items-center bg-white p-6 rounded-3xl w-fit mx-auto">
            <QRCodeSVG 
              value={`https://energiecheck-v2.vercel.app/?code=${workerCode}`} 
              size={180} 
              includeMargin={true}
              imageSettings={{ src: "/logo.png", height: 35, width: 35, excavate: true }}
            />
            <span className="text-black font-mono text-[10px] mt-2">{workerCode}</span>
          </div>
        </div>
      </main>

      <footer className="p-10 text-center text-gray-600 text-[10px] uppercase tracking-widest">
        © 2026 Energiecheck-24 Deutschland | Technical Lead: Giovanni Lazo
      </footer>
    </div>
  );
}