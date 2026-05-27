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
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [activeLanding, setActiveLanding] = useState('');
  // Estado financiero optimizado y segmentado para reflejar el panel del admin
  const [stats, setStats] = useState({ sales: 0, umsatz: 0, offen: 0, bezahlt: 0 });
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

        // 3. Cargar Leads / Clientes Registrados iniciales (Para la agenda de nombres)
        const { data: custData } = await supabase
          .from('customers')
          .select('*')
          .eq('worker_id', workerId);
        if (custData) setCustomers(custData);

        // 4. Cargar Órdenes y Comisiones reales desde la nueva tabla 'orders'
        const { data: ordsData } = await supabase
          .from('orders')
          .select('*')
          .eq('worker_id', workerId)
          .order('created_at', { ascending: false });

        if (ordsData) {
          setOrders(ordsData);
          
          // 📊 Cálculos financieros basados en estados 'pending' y 'paid'
          const totalUmsatz = ordsData.reduce((acc, o) => acc + (Number(o.purchase_amount) || 0), 0);
          const pendingComm = ordsData.filter(o => o.commission_status === 'pending').reduce((acc, o) => acc + (Number(o.commission_earned) || 0), 0);
          const paidComm = ordsData.filter(o => o.commission_status === 'paid').reduce((acc, o) => acc + (Number(o.commission_earned) || 0), 0);

          setStats({ 
            sales: ordsData.length, 
            umsatz: totalUmsatz,
            offen: pendingComm, 
            bezahlt: paidComm 
          });
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
          {/* SECCIÓN DE LA LANDING DINÁMICA CON QR AJUSTADO A PROPORCIÓN DE MARCO */}
          <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-black aspect-[3/4] shadow-2xl group">
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

            {/* Capa del QR sobre la imagen con tamaño y tolerancia simétrica */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-t from-black via-transparent to-transparent">
              <div className="p-4 bg-white rounded-[2rem] shadow-[0_0_50px_rgba(212,225,55,0.3)] transform transition-transform hover:scale-105">
                {promoLink ? (
                  <QRCodeSVG 
                    value={promoLink} 
                    size={160} 
                    level="H" 
                    imageSettings={{
                      src: "/energiecheck.png", 
                      height: 38,       
                      width: 38,        
                      excavate: true    
                    }} 
                  />
                ) : (
                  <div className="w-[160px] h-[160px] flex items-center justify-center text-black text-xs font-mono">Laden...</div>
                )}
              </div>
              <div className="mt-8 text-center">
                <p className="text-[10px] font-black uppercase text-[#d4e137] tracking-[0.3em] italic mb-2">Personalisierter QR</p>
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

          {/* SECCIÓN DE CONTADORES CORREGIDOS Y DISTRIBUIDOS */}
          <div className="grid grid-cols-1 gap-4">
            {/* 1. Volumen de Ventas (Umsatz) */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest italic">Umsatzvolumen</p>
              <h3 className="text-2xl font-black italic mt-1 text-blue-400">
                {stats.umsatz.toLocaleString('de-DE')} €
              </h3>
            </div>

            {/* 2. Comisiones Pendientes (Offen) */}
            <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-[2rem] backdrop-blur-sm">
              <p className="text-orange-500/70 text-[9px] font-black uppercase tracking-widest italic">Offene Provision</p>
              <h3 className="text-2xl font-black italic mt-1 text-orange-500">
                {stats.offen.toLocaleString('de-DE')} €
              </h3>
            </div>

            {/* 3. Comisiones Pagadas (Bezahlt) */}
            <div className="bg-[#d4e137]/5 border border-[#d4e137]/10 p-6 rounded-[2rem] backdrop-blur-sm">
              <p className="text-[#d4e137]/70 text-[9px] font-black uppercase tracking-widest italic">Bezahlte Provision</p>
              <h3 className="text-2xl font-black italic mt-1 text-[#d4e137]">
                {stats.bezahlt.toLocaleString('de-DE')} €
              </h3>
            </div>
          </div>
        </div>

        {/* LISTA DE HISTORIAL DE COMPRAS CON EMPAREJAMIENTO DE NOMBRE EN TIEMPO REAL */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 min-h-full backdrop-blur-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black italic uppercase tracking-tight">Geworbene Kunden</h3>
              <div className="bg-black/40 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2 shadow-inner">
                <Users size={16} className="text-gray-500" />
                <span className="text-sm font-black text-[#d4e137]">{orders.length}</span>
              </div>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-xs italic">Noch keine Kunden registriert</p>
                </div>
              ) : (
                orders.map((o: any) => {
                  // ✨ SOLUCIÓN DE UNIÓN: Buscar los datos del lead en customers usando el email como puente
                  const matchedCustomer = (customers || []).find(c => c.email.toLowerCase() === o.customer_email.toLowerCase());
                  const displayName = matchedCustomer ? matchedCustomer.full_name : "Gast-Kunde";

                  return (
                    <div key={o.id} className="p-6 bg-black/40 rounded-[2rem] border border-white/5 flex justify-between items-center group hover:border-white/20 transition-all">
                      <div className="text-left">
                        {/* Muestra el nombre real del cliente o Gast-Kunde en su defecto */}
                        <p className="font-black text-lg tracking-tight group-hover:text-[#d4e137] transition-colors uppercase italic">{displayName}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase font-bold tracking-widest">{o.customer_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#d4e137] font-black italic text-xl leading-none">{Number(o.commission_earned).toLocaleString('de-DE')} €</p>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded italic mt-2 block ${
                          o.commission_status === 'paid' ? 'text-[#d4e137] bg-[#d4e137]/5' : 'text-orange-500 bg-orange-500/5'
                        }`}>
                          Status: {o.commission_status === 'paid' ? 'Bezahlt' : 'Offen'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}