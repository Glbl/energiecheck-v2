"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, BarChart3, Clock, Wallet, ArrowLeft, LayoutDashboard, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [funnelLogs, setFunnelLogs] = useState<any[]>([]);
  const [totals, setTotals] = useState({ sales: 0, commissions: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role !== 'admin') { router.push('/login'); return; }

    async function fetchAdminData() {
      // 1. Empleados
      const { data: emps } = await supabase.from('employees').select('*').order('full_name');
      // 2. Clientes (para sumatorias globales)
      const { data: custs } = await supabase.from('customers').select('purchase_amount, commission_earned');
      // 3. Funnel (Última hora)
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: logs } = await supabase.from('user_funnel_logs').select('*').gte('created_at', hourAgo).order('created_at', { ascending: false });

      if (emps) setEmployees(emps);
      if (logs) setFunnelLogs(logs);
      if (custs) {
        const s = custs.reduce((acc: number, c: any) => acc + (Number(c.purchase_amount) || 0), 0);
        const co = custs.reduce((acc: number, c: any) => acc + (Number(c.commission_earned) || 0), 0);
        setTotals({ sales: s, commissions: co });
      }
      setLoading(false);
    }
    fetchAdminData();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic">LADEN...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg rotate-3"><LayoutDashboard className="text-black" size={20} /></div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Admin Panel</h1>
        </div>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={14} /> Abmelden
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <Users className="text-orange-500 mb-4" size={20} />
            <p className="text-gray-500 text-[10px] font-bold uppercase">Mitarbeiter</p>
            <h2 className="text-3xl font-black mt-1">{employees.length}</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <BarChart3 className="text-[#d4e137] mb-4" size={20} />
            <p className="text-gray-500 text-[10px] font-bold uppercase">Umsatz Gesamt</p>
            <h2 className="text-3xl font-black mt-1">{totals.sales.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <Wallet className="text-blue-400 mb-4" size={20} />
            <p className="text-gray-500 text-[10px] font-bold uppercase">Provisionen</p>
            <h2 className="text-3xl font-black mt-1">{totals.commissions.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <Clock className="text-purple-400 mb-4" size={20} />
            <p className="text-gray-500 text-[10px] font-bold uppercase">Live Aktiv</p>
            <h2 className="text-3xl font-black mt-1">{funnelLogs.length}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
            <h3 className="text-xl font-black uppercase italic mb-8 tracking-tight">Mitarbeiter Liste</h3>
            <div className="grid grid-cols-1 gap-4">
              {employees.map((emp) => (
                <Link href={`/dashboard/admin/employee/${emp.id_employee}`} key={emp.id}>
                  <div className="flex justify-between items-center p-4 bg-black/40 rounded-3xl border border-white/5 hover:border-[#d4e137] transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
                         <img src={`https://ui-avatars.com/api/?name=${emp.full_name}&background=d4e137&color=black&bold=true`} alt="" />
                      </div>
                      <p className="font-bold">{emp.full_name}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-600" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
            <h3 className="text-xl font-black uppercase italic mb-8 tracking-tight text-orange-500">Live Funnel</h3>
            <div className="space-y-6">
              {funnelLogs.map((log) => (
                <div key={log.id} className="border-l-2 border-white/10 pl-4 py-1">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-gray-500">{log.worker_id}</span>
                    <span className="text-[#d4e137] uppercase font-black">{log.current_step}</span>
                  </div>
                  <p className="text-[11px] text-gray-300">Session: {log.session_id.slice(-6)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}