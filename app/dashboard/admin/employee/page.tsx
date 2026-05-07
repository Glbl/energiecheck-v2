"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
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

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState({ sales: 0, comm: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Recuperamos el ID del trabajador guardado en el Login
    const workerId = localStorage.getItem('worker_id');
    const userRole = localStorage.getItem('user_role');

    // Seguridad: Si no hay ID o el rol no es employee, al login
    if (!workerId || userRole !== 'employee') {
      router.push('/login');
      return;
    }

    async function loadDashboardData() {
      setLoading(true);
      
      // 2. Traer datos del perfil del empleado
      const { data: empData } = await supabase
        .from('employees')
        .select('*')
        .eq('id_employee', workerId)
        .single();

      if (empData) setEmployee(empData);

      // 3. Traer SOLO los clientes registrados por este empleado
      const { data: custData } = await supabase
        .from('customers')
        .select('*')
        .eq('worker_id', workerId)
        .order('registration_date', { ascending: false });

      if (custData) {
        setCustomers(custData);
        // Calcular sumatorias reales de este empleado
        const totalSales = custData.reduce((acc: number, c: any) => acc + (Number(c.purchase_amount) || 0), 0);
        const totalComm = custData.reduce((acc: number, c: any) => acc + (Number(c.commission_earned) || 0), 0);
        setStats({ sales: totalSales, comm: totalComm });
      }
      setLoading(false);
    }

    loadDashboardData();
  }, [router]);

  // Generamos el link de promoción con el ID REAL del logueado
  const promoLink = employee 
    ? `https://energiecheck-v2-git-main-gb128128-6735s-projects.vercel.app/promotion?code=${employee.id_employee}`
    : "";

  const copyToClipboard = () => {
    if (!promoLink) return;
    navigator.clipboard.writeText(promoLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic">LADEN...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left">
      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#d4e137] p-2 rounded-lg rotate-3"><LayoutDashboard className="text-black" size={20} /></div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Mitarbeiter Portal</h1>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1 italic">{employee?.full_name} | ID: {employee?.id_employee}</p>
          </div>
        </div>
        <button 
          onClick={() => { localStorage.clear(); router.push('/login'); }} 
          className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <LogOut size={14} /> Abmelden
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: QR Y LINK PERSONAL */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center shadow-2xl">
            <h3 className="text-[#d4e137] font-black uppercase text-xs mb-6 tracking-widest italic text-center">Dein persönlicher QR-Code</h3>
            
            <div className="p-4 bg-white rounded-[2rem] shadow-[0_0_40px_rgba(212,225,55,0.1)]">
              <QRCodeSVG value={promoLink + "&source=qr"} size={180} level="H" />
            </div>

            <div className="mt-8 w-full">
              <p className="text-[9px] text-gray-600 uppercase font-bold text-center mb-2 tracking-widest">Link kopieren</p>
              <div className="flex items-center gap-2 bg-black/50 p-2 rounded-xl border border-white/5">
                <input 
                  readOnly 
                  value={promoLink} 
                  className="bg-transparent text-[10px] font-mono text-gray-500 w-full outline-none px-2"
                />
                <button onClick={copyToClipboard} className="p-2 bg-[#d4e137] text-black rounded-lg hover:scale-105 transition-all">
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <Wallet className="text-[#d4e137] mb-4" size={24} />
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Meine Provisionen</p>
            <h2 className="text-4xl font-black italic mt-1 text-[#d4e137]">{stats.comm.toLocaleString('de-DE')} €</h2>
          </div>
        </div>

        {/* COLUMNA DERECHA: LISTA DE CLIENTES REGISTRADOS POR EL EMPLEADO */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 min-h-full">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black italic uppercase tracking-tight">Geworbene Kunden</h3>
              <div className="bg-black/40 px-4 py-2 rounded-full border border-white/5 flex items-center gap-2">
                <Users size={16} className="text-gray-500" />
                <span className="text-sm font-black text-[#d4e137]">{customers.length}</span>
              </div>
            </div>

            <div className="space-y-4">
              {customers.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">Noch keine Kunden geworben</p>
                </div>
              ) : (
                customers.map((c: any) => {
                  const isSuccess = c.status === 'purchased' || c.commission_status === 'paid';
                  return (
                    <div 
                      key={c.id} 
                      className={`p-6 rounded-2xl border transition-all flex justify-between items-center ${
                        isSuccess ? 'bg-[#d4e137]/10 border-[#d4e137]/30' : 'bg-black/40 border-white/5'
                      }`}
                    >
                      <div>
                        <p className={`font-black text-lg tracking-tight ${isSuccess ? 'text-[#d4e137]' : 'text-white'}`}>
                          {c.full_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-tighter">{c.email}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black italic ${isSuccess ? 'text-[#d4e137]' : 'text-white'}`}>
                          {c.commission_earned} €
                        </p>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                          {c.status === 'pending' ? 'In Bearbeitung' : 'Abgeschlossen'}
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