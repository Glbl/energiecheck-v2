"use client";
import React, { useEffect, useState } from 'react';
// Si te sigue fallando el @/, usa la ruta relativa: import { supabase } from '../../../lib/supabase';
import { supabase } from '../../lib/supabase'; 
import { Users, BarChart3, Clock, Wallet, ArrowLeft, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [funnelLogs, setFunnelLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ sales: 0, comm: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (!role || role !== 'admin') { router.push('/login'); return; }

    async function fetchData() {
      setLoading(true);
      
      const { data: empData } = await supabase.from('employees').select('*').order('full_name', { ascending: true });
      const { data: allCust } = await supabase.from('customers').select('purchase_amount, commission_earned');
      
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: logData } = await supabase.from('user_funnel_logs').select('*').gte('created_at', thirtyMinsAgo).order('created_at', { ascending: false });

      if (empData) setEmployees(empData);
      if (logData) setFunnelLogs(logData);
      
      // SOLUCIÓN AL ERROR 7006: Definimos acc: number y c: any
      const totalSales = allCust?.reduce((acc: number, c: any) => acc + (Number(c.purchase_amount) || 0), 0) || 0;
      const totalComm = allCust?.reduce((acc: number, c: any) => acc + (Number(c.commission_earned) || 0), 0) || 0;
      
      setStats({ sales: totalSales, comm: totalComm });
      setLoading(false);
    }
    fetchData();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg rotate-3"><LayoutDashboard className="text-black" size={20} /></div>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">HAUPT DASHBOARD</h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Admin: Jose Alejandro Lorusso</p>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <ArrowLeft size={14} /> Abmelden
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 text-left">
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <Users className="text-orange-500 mb-4" size={20} />
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Mitarbeiter</p>
            <h2 className="text-3xl font-black mt-1">{employees.length}</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <BarChart3 className="text-[#d4e137] mb-4" size={20} />
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Umsatz Gesamt</p>
            <h2 className="text-3xl font-black mt-1">{stats.sales.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <Wallet className="text-blue-400 mb-4" size={20} />
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Provisionen</p>
            <h2 className="text-3xl font-black mt-1">{stats.comm.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <Clock className="text-purple-400 mb-4" size={20} />
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Live Aktiv</p>
            <h2 className="text-3xl font-black mt-1">{funnelLogs.length}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-left">
            <h3 className="text-xl font-black uppercase italic tracking-tight mb-8">Mitarbeiter Übersicht</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map((emp: any) => (
                <Link href={`/dashboard/admin/employee/${emp.id_employee}`} key={emp.id}>
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-3xl border border-white/5 hover:border-[#d4e137] transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#d4e137]">
                        <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${emp.photo_url}`} alt="" className="w-full h-full object-cover" onError={(e) => {(e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${emp.full_name}&background=d4e137&color=black`;}}/>
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight">{emp.full_name}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">{emp.id_employee}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-600 group-hover:text-[#d4e137]" size={18} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-left">
            <h3 className="text-xl font-black uppercase italic mb-8 tracking-tight">Live Funnel</h3>
            <div className="space-y-6">
              {funnelLogs.map((log: any) => (
                <div key={log.id} className="relative pl-6 border-l border-white/10">
                  <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] bg-orange-500 rounded-full animate-pulse" />
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono text-gray-500">SESS_{log.session_id?.slice(-4)}</span>
                    <span className="text-[#d4e137] text-[10px] font-black uppercase italic">{log.current_step}</span>
                  </div>
                  <p className="text-[11px] text-gray-300">Worker ID: <span className="font-bold">{log.worker_id}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}