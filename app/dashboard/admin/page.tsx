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
  TrendingUp,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
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
  }, [router]);

  async function loadAdminData() {
    try {
      setLoading(true);
      
      // 1. Obtener todos los trabajadores
      const { data: emps } = await supabase
        .from('employees')
        .select('*')
        .eq('role', 'worker')
        .order('full_name');

      // 2. Obtener todos los clientes para cálculos automáticos
      const { data: custs } = await supabase
        .from('customers')
        .select('*');

      if (emps) setEmployees(emps);
      if (custs) setCustomers(custs);

    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }

  // --- LÓGICA AUTOMÁTICA DE TOTALES ---
  const totalUmsatz = customers.reduce((acc, c) => acc + (Number(c.purchase_amount) || 0), 0);
  
  const totalOffen = customers
    .filter(c => c.commission_status === 'pending')
    .reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0);
    
  const totalBezahlt = customers
    .filter(c => c.commission_status === 'paid')
    .reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0);
    
  const totalKunden = customers.length;

  // --- LÓGICA DEL LIVE FUNNEL (EMBUDO) ---
  const pendingCount = customers.filter(c => c.status === 'pending').length;
  const completedCount = customers.filter(c => c.status === 'completed' || c.status === 'active').length;

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id_employee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic uppercase tracking-widest">
      MASTER CONTROL LOADING...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left">
      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg rotate-3 shadow-lg shadow-orange-600/20">
            <LayoutDashboard className="text-black" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Admin Panel</h1>
            <p className="text-orange-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-1 italic">Master Control</p>
          </div>
        </div>
        <button 
          onClick={() => { localStorage.clear(); router.push('/login'); }} 
          className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <LogOut size={14} /> Abmelden
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* INDICADORES AUTOMÁTICOS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
            <BarChart3 className="text-[#d4e137] mb-4" size={20} />
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Umsatzvolumen</p>
            <h2 className="text-3xl font-black italic mt-1">{totalUmsatz.toLocaleString('de-DE')} €</h2>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
            <Clock className="text-orange-500 mb-4" size={20} />
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Offen</p>
            <h2 className="text-3xl font-black italic mt-1">{totalOffen.toLocaleString('de-DE')} €</h2>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
            <Wallet className="text-blue-400 mb-4" size={20} />
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Bezahlt</p>
            <h2 className="text-3xl font-black italic mt-1">{totalBezahlt.toLocaleString('de-DE')} €</h2>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
            <Users className="text-purple-400 mb-4" size={20} />
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Kundenanzahl</p>
            <h2 className="text-3xl font-black italic mt-1">{totalKunden}</h2>
          </div>
        </div>

        {/* LIVE FUNNEL RESTAURADO */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="text-orange-500" size={24} />
            <h3 className="text-2xl font-black italic uppercase tracking-tight">Live Sales Funnel</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Prospects / Pending</span>
                <span className="text-xl font-black italic">{pendingCount}</span>
              </div>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-600 transition-all duration-1000" 
                  style={{ width: `${(pendingCount / (totalKunden || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Closed / Active</span>
                <span className="text-xl font-black italic text-[#d4e137]">{completedCount}</span>
              </div>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#d4e137] transition-all duration-1000" 
                  style={{ width: `${(completedCount / (totalKunden || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* LISTA DE TRABAJADORES */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-orange-500" size={24} />
              <h3 className="text-2xl font-black italic uppercase tracking-tight">Mitarbeiter Performance</h3>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Mitarbeiter suchen..." 
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
                className="group p-6 bg-black/40 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row justify-between items-center hover:border-orange-500/50 transition-all cursor-pointer shadow-xl"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center font-black text-xl italic text-black shadow-lg">
                    {emp.full_name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-xl tracking-tight group-hover:text-orange-500 transition-colors uppercase italic">
                      {emp.full_name}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono font-bold tracking-widest uppercase">{emp.id_employee}</p>
                  </div>
                </div>

                <div className="flex items-center gap-10 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1">Status</p>
                    <span className="bg-orange-500/10 text-orange-500 text-[10px] px-3 py-1 rounded-full font-black uppercase italic border border-orange-500/20">
                      Aktiv
                    </span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-orange-500 group-hover:text-black transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}