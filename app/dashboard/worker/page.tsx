"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Copy, 
  CheckCircle2, 
  Users, 
  Wallet, 
  QrCode as QrIcon, 
  LogOut, 
  LayoutDashboard 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function WorkerDashboard() {
  const [employee, setEmployee] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState({ sales: 0, comm: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Obtener datos de la sesión actual
    const workerId = localStorage.getItem('worker_id');
    const userRole = localStorage.getItem('user_role');

    // 2. Verificación de seguridad y rol
    if (!workerId || userRole !== 'worker') {
      router.push('/login');
      return;
    }

    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // 3. Traer perfil del trabajador (esto asegura que el nombre sea el de Norma)
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('id_employee', workerId)
          .single();

        if (empError || !empData) {
          console.error("Error al cargar perfil:", empError);
          return;
        }
        setEmployee(empData);

        // 4. Traer SOLO los clientes asociados al id_employee de Norma
        const { data: custData, error: custError } = await supabase
          .from('customers')
          .select('*')
          .eq('worker_id', workerId)
          .order('registration_date', { ascending: false });

        if (custError) {
          console.error("Error al cargar clientes:", custError);
        } else if (custData) {
          setCustomers(custData);
          
          // 5. Calcular estadísticas solo para este usuario
          const totalComm = custData.reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0);
          setStats({
            sales: custData.length,
            comm: totalComm
          });
        }
      } catch (err) {
        console.error("Error inesperado en el dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  // Link dinámico que usa el ID real cargado desde Supabase
  const promoLink = employee 
    ? `https://energiecheck-v2.vercel.app/promotion?code=${employee.id_employee}`
    : "";

  const copyToClipboard = () => {
    if (!promoLink) return;
    navigator.clipboard.writeText(promoLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic uppercase tracking-widest">
        Laden...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center justify-between px-10 sticky top-0 z-50">
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
          className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <LogOut size={14} /> Abmelden
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="flex flex-col gap-6">
          {/* QR Y LINK */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center shadow-2xl backdrop-blur-sm">
            <h3 className="text-[#d4e137] font-black uppercase text-[10px] mb-6 tracking-widest italic text-center">Dein persönlicher QR-Code</h3>
            
            <div className="p-4 bg-white rounded-[2rem] shadow-[0_0_50px_rgba(212,225,55,0.15)]">
              <QRCodeSVG value={promoLink} size={180} level="H" />
            </div>

            <div className="mt-8 w-full">
              <p className="text-[9px] text-gray-600 uppercase font-bold text-center mb-2 tracking-widest italic">Link kopieren</p>
              <div className="flex items-center gap-2 bg-black/50 p-2 rounded-xl border border-white/5">
                <input 
                  readOnly 
                  value={promoLink} 
                  className="bg-transparent text-[10px] font-mono text-gray-500 w-full outline-none px-2"
                />
                <button onClick={copyToClipboard} className="p-2 bg-[#d4e137] text-black rounded-lg hover:scale-105 transition-all active:scale-95">
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* COMISIONES */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm">
            <Wallet className="text-[#d4e137] mb-4" size={24} />
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Meine Provisionen</p>
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
                  <div 
                    key={c.id} 
                    className="p-6 bg-black/40 rounded-[2rem] border border-white/5 flex justify-between items-center hover:border-white/20 transition-all group"
                  >
                    <div className="text-left">
                      <p className="font-black text-lg tracking-tight group-hover:text-[#d4e137] transition-colors">
                        {c.full_name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase font-bold tracking-widest">{c.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#d4e137] font-black italic text-xl leading-none">
                        {c.commission_earned} €
                      </p>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 italic mt-2 block">Registriert</span>
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