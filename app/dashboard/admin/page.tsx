"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Wallet, 
  BarChart3, 
  Clock, 
  LayoutDashboard, 
  LogOut, 
  Search,
  ChevronRight,
  Activity,
  History
} from 'lucide-react';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [funnelLogs, setFunnelLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'admin') {
      router.push('/login');
      return;
    }
    loadAdminData();

    // Opcional: Recarga automática cada 30 segundos para ver el funnel en vivo
    const interval = setInterval(loadAdminData, 30000);
    return () => clearInterval(interval);
  }, [router]);

  async function loadAdminData() {
    try {
      // 1. Trabajadores
      const { data: emps } = await supabase.from('employees').select('*').eq('role', 'worker').order('full_name');
      
      // 2. Clientes para totales
      const { data: custs } = await supabase.from('customers').select('*');

      // 3. LIVE FUNNEL: Últimos 10 movimientos únicos por sesión
      const { data: logs } = await supabase
        .from('user_funnel_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (emps) setEmployees(emps);
      if (custs) setCustomers(custs);
      if (logs) setFunnelLogs(logs);

    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }

  // --- CÁLCULOS AUTOMÁTICOS ---
  const totalUmsatz = customers.reduce((acc, c) => acc + (Number(c.purchase_amount) || 0), 0);
  const totalOffen = customers.filter(c => c.commission_status === 'pending').reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0);
  const totalBezahlt = customers.filter(c => c.commission_status === 'paid').reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0);
  const totalKunden = customers.length;

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para calcular hace cuánto tiempo fue el log
  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `vor ${seconds} Sek.`;
    const mins = Math.floor(seconds / 60);
    return `vor ${mins} Min.`;
  };

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic">LADEN...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left pb-20">
      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg rotate-3 shadow-lg shadow-orange-600/20"><LayoutDashboard className="text-black" size={20} /></div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Admin Panel</h1>
            <p className="text-orange-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-1 italic">Master Control</p>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
          <LogOut size={14} /> Abmelden
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* TOTALES AUTOMÁTICOS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <BarChart3 className="text-[#d4e137] mb-4" size={20} />
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Umsatzvolumen</p>
            <h2 className="text-3xl font-black italic mt-1">{totalUmsatz.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <Clock className="text-orange-500 mb-4" size={20} />
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Offen</p>
            <h2 className="text-3xl font-black italic mt-1">{totalOffen.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <Wallet className="text-blue-400 mb-4" size={20} />
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Bezahlt</p>
            <h2 className="text-3xl font-black italic mt-1">{totalBezahlt.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
            <Users className="text-purple-400 mb-4" size={20} />
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Kundenanzahl</p>
            <h2 className="text-3xl font-black italic mt-1">{totalKunden}</h2>
          </div>
        </div>

        {/* LIVE FUNNEL REAL (USER_FUNNEL_LOGS) */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Activity className="text-orange-500 animate-pulse" size={24} />
              <h3 className="text-2xl font-black italic uppercase tracking-tight">Live Aktivität (Funnel)</h3>
            </div>
            <span className="text-[9px] bg-white/10 px-3 py-1 rounded-full font-bold uppercase text-gray-400 tracking-widest">Echtzeit-Tracker</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funnelLogs.map((log) => (
              <div key={log.id} className="bg-black/40 border border-white/5 p-5 rounded-3xl hover:border-orange-500/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="px-2 py-1 bg-orange-600/10 border border-orange-600/20 rounded text-[9px] font-bold text-orange-500 uppercase">
                    {log.worker_id}
                  </div>
                  <span className="text-[10px] text-gray-600 font-mono italic">{getTimeAgo(log.created_at)}</span>
                </div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter mb-1">Aktueller Schritt:</p>
                <p className="text-sm font-black text-white italic uppercase tracking-tight truncate">
                  {log.current_step}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500 italic">
                   <History size={12} />
                   <span>Verweildauer: {log.time_spent_seconds}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MITARBEITER LISTE */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
            <h3 className="text-2xl font-black italic uppercase tracking-tight">Performance Liste</h3>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Suchen..." 
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-orange-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredEmployees.map((emp) => (
              <div 
                key={emp.id}
                onClick={() => router.push(`/dashboard/admin/employee/${emp.id_employee}`)}
                className="group p-6 bg-black/40 rounded-[2.5rem] border border-white/5 flex justify-between items-center hover:border-orange-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center font-black text-xl italic text-black">
                    {emp.full_name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-lg group-hover:text-orange-500 transition-colors uppercase italic">{emp.full_name}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{emp.id_employee}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-700 group-hover:text-white" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}