"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Users, DollarSign, LayoutDashboard, CheckCircle2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WorkerDashboard() {
  const router = useRouter();
  const [workerId, setWorkerId] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // URL DE PROMOCIÓN DINÁMICA
  const promotionLink = workerId 
    ? `https://energiecheck-v2-git-main-gb128128-6735s-projects.vercel.app/promotion?code=${workerId}`
    : "";

  useEffect(() => {
    // RECUPERAR DATOS DEL LOGIN (Asegúrate de que el login guarde estos nombres)
    const storedId = localStorage.getItem('worker_code') || "HN121285"; 
    const storedName = localStorage.getItem('worker_name') || "Henry Neyra Calvo";
    
    setWorkerId(storedId);
    setWorkerName(storedName);
    fetchData(storedId);
  }, []);

  async function fetchData(id: string) {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('worker_id', id)
      .order('registration_date', { ascending: false });

    if (data) setCustomers(data);
    setLoading(false);
  }

  const handleCopy = () => {
    if(!promotionLink) return;
    navigator.clipboard.writeText(promotionLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-[#05070a] flex justify-center items-center font-black italic text-white">LADEN...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      <nav className="border-b border-white/5 p-6 flex justify-between items-center bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#d4e137] p-2 rounded-lg"><LayoutDashboard className="text-black" size={20}/></div>
          <div>
            <h1 className="font-black uppercase italic text-xl tracking-tighter">Mitarbeiter Portal</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">ID: {workerId} | {workerName}</p>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 hover:text-white transition-all"><LogOut size={20}/></button>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center shadow-2xl">
            <h3 className="text-[#d4e137] font-black uppercase mb-8 tracking-widest text-xs italic">Dein Promo-QR</h3>
            <div className="p-5 bg-white rounded-[2rem] shadow-[0_0_50px_rgba(212,225,55,0.15)] relative">
              <QRCodeSVG 
                value={promotionLink + "&source=qr"} 
                size={220}
                level="H"
                imageSettings={{
                  src: "/energiecheck.png", // Asegúrate de subir un logo pequeño a public/logo-qr.png
                  height: 45, width: 45, excavate: true,
                }}
              />
            </div>
            <p className="mt-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">ID: {workerId}</p>
            
            <div className="mt-10 w-full">
               <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest text-center mb-2">Direktlink zum Kopieren</p>
               <div className="flex bg-black border border-white/10 rounded-2xl p-2 items-center focus-within:border-[#d4e137] transition-all">
                  <input readOnly value={promotionLink} className="bg-transparent text-[10px] w-full px-3 outline-none text-gray-400 font-mono" />
                  <button onClick={handleCopy} className="p-3 bg-[#d4e137] text-black rounded-xl hover:scale-105 transition-all">
                    {copied ? <Check size={18}/> : <Copy size={18}/>}
                  </button>
               </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <DollarSign className="text-[#d4e137] mb-4" size={30} />
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Meine Provisionen</p>
            <h2 className="text-4xl font-black mt-1 italic">
              {customers.reduce((acc, c) => acc + (c.commission_earned || 0), 0).toFixed(2)} €
            </h2>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-2xl font-black italic uppercase tracking-tight">Meine Kunden</h3>
               <div className="bg-black/40 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
                  <Users size={14} className="text-gray-500"/><span className="text-xs font-bold">{customers.length}</span>
               </div>
            </div>

            <div className="space-y-4">
              {customers.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-gray-600 font-bold uppercase tracking-widest">Noch keine Kunden geworben</div>
              ) : (
                customers.map((c) => {
                  const isPurchased = c.status === 'purchased' || c.commission_status === 'paid';
                  return (
                    <div key={c.id} className={`p-6 rounded-3xl border transition-all flex justify-between items-center ${isPurchased ? 'bg-[#d4e137]/10 border-[#d4e137]/40 shadow-[0_0_20px_rgba(212,225,55,0.05)]' : 'bg-black/40 border-white/5 hover:bg-white/5'}`}>
                      <div>
                        <p className={`font-black text-lg tracking-tight ${isPurchased ? 'text-[#d4e137]' : 'text-white'}`}>{c.full_name}</p>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-1">{c.email} | {c.phone}</p>
                      </div>
                      <div className="text-right">
                        {isPurchased ? (
                          <div className="flex items-center gap-2 text-[#d4e137] bg-[#d4e137]/10 px-4 py-2 rounded-full border border-[#d4e137]/20">
                            <CheckCircle2 size={14}/> <span className="text-[10px] font-black uppercase tracking-widest">Kauf bestätigt</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full">In Bearbeitung</span>
                        )}
                        <p className="text-[10px] text-gray-600 font-mono mt-3 uppercase tracking-tighter">Registriert: {new Date(c.registration_date).toLocaleDateString('de-DE')}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}