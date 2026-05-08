"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Users, Wallet, BarChart3, Clock, LayoutDashboard, 
  LogOut, Search, ChevronRight, Activity, History 
} from 'lucide-react';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [funnelLogs, setFunnelLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // URL BASE DEL BUCKET PÚBLICO
  const STORAGE_URL = "https://hoigzuytnzlkypkruyom.supabase.co/storage/v1/object/public/avatars/";

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'admin') {
      router.push('/login');
      return;
    }

    loadAdminData();

    const channel = supabase
      .channel('admin_live_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => loadAdminData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_funnel_logs' }, () => loadAdminData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  async function loadAdminData() {
    try {
      const { data: emps } = await supabase.from('employees').select('*').order('full_name');
      const { data: custs } = await supabase.from('customers').select('*');
      const { data: logs } = await supabase.from('user_funnel_logs').select('*').order('created_at', { ascending: false }).limit(9);

      if (emps) setEmployees(emps);
      if (custs) setCustomers(custs);
      if (logs) setFunnelLogs(logs);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m`;
  };

  const totalUmsatz = customers.reduce((acc, c) => acc + (Number(c.purchase_amount) || 0), 0);
  const totalOffen = customers.filter(c => c.commission_status === 'pending').reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0);
  const totalBezahlt = customers.filter(c => c.commission_status === 'paid').reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0);
  
  const filteredEmployees = employees.filter(emp => 
    emp.role === 'worker' && emp.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic uppercase">Loading Master...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left pb-20">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg rotate-3 shadow-lg shadow-orange-600/20"><LayoutDashboard className="text-black" size={20} /></div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Admin Panel</h1>
        </div>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <LogOut size={14} /> Abmelden
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]"><BarChart3 className="text-[#d4e137] mb-4" size={20} /><h2 className="text-3xl font-black italic">{totalUmsatz.toLocaleString('de-DE')} €</h2></div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]"><Clock className="text-orange-500 mb-4" size={20} /><h2 className="text-3xl font-black italic">{totalOffen.toLocaleString('de-DE')} €</h2></div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]"><Wallet className="text-blue-400 mb-4" size={20} /><h2 className="text-3xl font-black italic">{totalBezahlt.toLocaleString('de-DE')} €</h2></div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]"><Users className="text-purple-400 mb-4" size={20} /><h2 className="text-3xl font-black italic">{customers.length}</h2></div>
        </div>

        {/* LIVE FUNNEL CON AVATARES */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="text-orange-500 animate-pulse" size={24} />
            <h3 className="text-2xl font-black italic uppercase tracking-tight">Live Aktivität (Funnel)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funnelLogs.map((log) => {
              const emp = employees.find(e => e.id_employee === log.worker_id);
              return (
                <div key={log.id} className="bg-black/40 border border-white/5 p-5 rounded-3xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-orange-600 flex-shrink-0">
                        {emp?.photo_url ? (
                          <img src={`${STORAGE_URL}${emp.photo_url}`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-black text-xs uppercase">{log.worker_id.slice(0,2)}</div>
                        )}
                      </div>
                      <div className="px-2 py-1 bg-orange-600/10 border border-orange-600/20 rounded text-[9px] font-bold text-orange-500 uppercase">{log.worker_id}</div>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono italic">{getTimeAgo(log.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1 italic">Schritt:</p>
                  <p className="text-sm font-black text-white uppercase truncate italic">{log.current_step}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* MITARBEITER LISTE */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
            <h3 className="text-2xl font-black italic uppercase tracking-tight">Mitarbeiter Liste</h3>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input type="text" placeholder="Suchen..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 text-sm outline-none focus:border-orange-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {filteredEmployees.map((emp) => (
              <div key={emp.id} onClick={() => router.push(`/dashboard/admin/employee/${emp.id_employee}`)} className="group p-6 bg-black/40 rounded-[2.5rem] border border-white/5 flex justify-between items-center hover:border-orange-500/50 transition-all cursor-pointer">
                <div className="flex items-center gap-6 w-full min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-orange-600 flex-shrink-0 overflow-hidden border border-white/10 shadow-lg">
                    {emp.photo_url ? (
                      <img src={`${STORAGE_URL}${emp.photo_url}`} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-black text-xl italic">{emp.full_name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-black text-lg group-hover:text-orange-500 transition-colors uppercase italic truncate">{emp.full_name}</p>
                    <p className="text-[10px] text-gray-500 font-mono font-bold tracking-widest">{emp.id_employee}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-700 group-hover:text-white flex-shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}