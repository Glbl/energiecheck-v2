"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Copy, 
  CheckCircle2, 
  Users, 
  Wallet, 
  LogOut, 
  LayoutDashboard,
  Image as ImageIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function WorkerDashboard() {
  const [employee, setEmployee] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [activeLanding, setActiveLanding] = useState('');
  const [stats, setStats] = useState({ sales: 0, comm: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const STORAGE_URL = "https://hoigzuytnzlkypkruyom.supabase.co/storage/v1/object/public/avatars/";

  useEffect(() => {
    const workerId = localStorage.getItem('worker_id');
    const userRole = localStorage.getItem('user_role');

    if (!workerId || userRole !== 'worker') {
      router.push('/login');
      return;
    }

    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // 1. Cargar Perfil del Trabajador
        const { data: empData } = await supabase
          .from('employees')
          .select('*')
          .eq('id_employee', workerId)
          .single();
        if (empData) setEmployee(empData);

        // 2. Cargar Landing Activa de José
        const { data: promoData } = await supabase
          .from('promotions')
          .select('image_url')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (promoData) setActiveLanding(promoData.image_url);

        // 3. Cargar Clientes y Stats
        const { data: custData } = await supabase
          .from('customers')
          .select('*')
          .eq('worker_id', workerId)
          .order('registration_date', { ascending: false });

        if (custData) {
          setCustomers(custData);
          const totalComm = custData.reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0);
          setStats({ sales: custData.length, comm: totalComm });
        }
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  // Link dinámico para el QR y para copiar
  const promoLink = employee 
    ? `https://energiecheck-v2.vercel.app/promotion?code=${employee.id_employee}&source=qr`
    : "";

  const copyToClipboard = () => {
    if (!promoLink) return;
    navigator.clipboard.writeText(promoLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic uppercase tracking-widest">
      WIRD GELADEN...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left">
      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#d4e137] p-2 rounded-lg rotate-3 shadow-[0_0_15px_rgba(212,225,55,0.3)]">
            <LayoutDashboard className="text-black" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Mitarbeiter Portal</h1>
            <p className="text-[10px] text-[#d4e137] uppercase tracking-[0.2em] mt-1 font-bold italic">
              Willkommen, {employee?.full_name}
            </p>
          </div>
        </div>
        <button 
          onClick={() => { localStorage.clear(); router.push('/login'); }} 
          className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <LogOut size={14} /> Abmelden
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="flex flex-col gap-6">
          {/* SECCIÓN DE LA LANDING DINÁMICA CON QR */}
          <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-black aspect-[3/4] shadow-2xl group">
            {/* Imagen que sube José */}
            {activeLanding ? (
              <img 
                src={`${STORAGE_URL}${activeLanding}`} 
                className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-40"
                alt="Aktuelle Promotion"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 gap-4">
                <ImageIcon size={40} />
                <p className="text-[10px] font-bold uppercase italic tracking-widest">Warten auf Landing-Design</p>
              </div>
            )}

            {/* Capa del QR sobre la imagen */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-t from-black via-transparent to-transparent">
              <div className="p-4 bg-white rounded-[2rem] shadow-[0_0_50px_rgba(212,225,55,0.3)] transform transition-transform hover:scale-105">
               <QRCodeSVG 
  value={promoLink} 
  size={160} 
  level="H" // Mantiene la máxima tolerancia de escaneo
  imageSettings={{
    src: "/energiecheck.png", // ✅ CORREGIDO: Apunta al archivo correcto en tu carpeta /public
    height: 42,       // ✅ Ajustado: Un poco más grande para mejor legibilidad
    width: 42,        // ✅ Ajustado: Proporción simétrica ideal
    excavate: true    // Mantiene recortados los puntos traseros para un fondo limpio
  }} 
/>
              </div>
              <div className="mt-8 text-center">
                <p className="text-[10px] font-black uppercase text-[#d4e137] tracking-[0.3em] italic mb-2">Personalosierter QR</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-tight">
                  Scannen lassen, <br/>um Provision zu sichern
                </p>
              </div>
            </div>
          </div>

          {/* LINK DE COPIADO RÁPIDO */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
            <p className="text-[9px] text-gray-500 uppercase font-bold text-center mb-3 tracking-widest italic">Link manuell teilen</p>
            <div className="flex items-center gap-2 bg-black/50 p-2 rounded-xl border border-white/5">
              <input readOnly value={promoLink} className="bg-transparent text-[10px] font-mono text-gray-600 w-full outline-none px-2" />
              <button onClick={copyToClipboard} className="p-3 bg-[#d4e137] text-black rounded-xl hover:scale-105 transition-all">
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* COMISIONES */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm">
            <Wallet className="text-[#d4e137] mb-4" size={24} />
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic">Meine Provisionen</p>
            <h2 className="text-4xl font-black italic mt-1 text-[#d4e137]">{stats.comm.toLocaleString('de-DE')} €</h2>
          </div>
        </div>

        {/* LISTA DE CLIENTES */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 min-h-full backdrop-blur-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black italic uppercase tracking-tight">Geworbene Kunden</h3>
              <div className="bg-black/40 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2 shadow-inner">
                <Users size={16} className="text-gray-500" />
                <span className="text-sm font-black text-[#d4e137]">{customers.length}</span>
              </div>
            </div>

            <div className="space-y-4">
              {customers.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-xs italic">Noch keine Kunden registriert</p>
                </div>
              ) : (
                customers.map((c: any) => (
                  <div key={c.id} className="p-6 bg-black/40 rounded-[2rem] border border-white/5 flex justify-between items-center group hover:border-white/20 transition-all">
                    <div className="text-left">
                      <p className="font-black text-lg tracking-tight group-hover:text-[#d4e137] transition-colors uppercase italic">{c.full_name}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase font-bold tracking-widest">{c.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#d4e137] font-black italic text-xl leading-none">{c.commission_earned} €</p>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 italic mt-2 block">Status: {c.commission_status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}