"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Ajusta la ruta si es necesario
import { useRouter } from 'next/navigation';
import { Copy, CheckCircle2, Users, Wallet, QrCode as QrIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState({ sales: 0, comm: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const workerId = localStorage.getItem('worker_id');
    const userRole = localStorage.getItem('user_role');

    // IMPORTANTE: Permitir el rol 'worker'
    if (!workerId || userRole !== 'worker') {
      router.push('/login');
      return;
    }

    async function loadData() {
      const { data: emp } = await supabase.from('employees').select('*').eq('id_employee', workerId).single();
      if (emp) setEmployee(emp);

      const { data: custs } = await supabase.from('customers').select('*').eq('worker_id', workerId);
      if (custs) {
        setCustomers(custs);
        const totalComm = custs.reduce((acc: number, c: any) => acc + (Number(c.commission_earned) || 0), 0);
        setStats({ sales: custs.length, comm: totalComm });
      }
      setLoading(false);
    }
    loadData();
  }, [router]);

  const promoLink = employee ? `https://energiecheck-v2.vercel.app/promotion?code=${employee.id_employee}` : "";

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic">LADEN...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left">
      <nav className="border-b border-white/5 bg-black/50 h-20 flex items-center justify-between px-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#d4e137] p-2 rounded-lg"><LayoutDashboard className="text-black" size={20} /></div>
          <h1 className="text-xl font-black italic uppercase italic">Mitarbeiter Portal</h1>
        </div>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase italic">
          <LogOut size={14} /> Abmelden
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center">
          <h3 className="text-[#d4e137] font-black uppercase text-xs mb-6 italic">Dein QR-Code</h3>
          <div className="p-4 bg-white rounded-[2rem]">
            <QRCodeSVG value={promoLink} size={150} />
          </div>
          <div className="mt-6 w-full bg-black/50 p-3 rounded-xl border border-white/5 flex justify-between">
             <span className="text-[10px] text-gray-500 truncate mr-2">{promoLink}</span>
             <button onClick={() => { navigator.clipboard.writeText(promoLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
               {copied ? <CheckCircle2 size={16} className="text-[#d4e137]" /> : <Copy size={16} className="text-gray-400" />}
             </button>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
          <Users className="text-blue-400 mb-4" size={24} />
          <p className="text-gray-500 text-[10px] font-bold uppercase">Kunden</p>
          <h2 className="text-4xl font-black italic">{customers.length}</h2>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
          <Wallet className="text-[#d4e137] mb-4" size={24} />
          <p className="text-gray-500 text-[10px] font-bold uppercase">Provisionen</p>
          <h2 className="text-4xl font-black italic">{stats.comm} €</h2>
        </div>
      </main>
    </div>
  );
}