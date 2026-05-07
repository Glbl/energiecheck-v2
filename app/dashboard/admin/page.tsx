"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Wallet, 
  ArrowUpRight, 
  LayoutDashboard, 
  LogOut, 
  Search,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, totalComm: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    // 1. Verificación de seguridad: Solo Admins
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
      
      // 2. Traer todos los empleados que son 'worker'
      const { data: emps, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('role', 'worker');

      if (empError) throw empError;

      // 3. Traer todos los clientes para calcular totales globales
      const { data: allCusts, error: custError } = await supabase
        .from('customers')
        .select('commission_earned');

      if (custError) throw custError;

      const totalComm = allCusts?.reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0) || 0;

      setEmployees(emps || []);
      setStats({
        totalSales: allCusts?.length || 0,
        totalComm: totalComm
      });
    } catch (err) {
      console.error("Error cargando datos de admin:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id_employee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic uppercase tracking-widest">
        ADMIN-DATEN LADEN...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left">
      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg rotate-3 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
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

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* STATS GLOBALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users size={80} />
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Gesamtverkäufe</p>
            <h2 className="text-5xl font-black italic mt-1 text-white">{stats.totalSales}</h2>
            <p className="text-orange-500 text-[10px] font-bold mt-2 italic uppercase">Registrierte Kunden</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet size={80} />
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Gesamtprovision</p>
            <h2 className="text-5xl font-black italic mt-1 text-orange-500">{stats.totalComm.toLocaleString('de-DE')} €</h2>
            <p className="text-white/40 text-[10px] font-bold mt-2 italic uppercase">Auszahlungsbereit</p>
          </div>
        </div>

        {/* LISTA DE TRABAJADORES */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <h3 className="text-2xl font-black italic uppercase tracking-tight">Mitarbeiter Liste</h3>
            
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
                className="group p-6 bg-black/40 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center hover:border-orange-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center font-black text-xl italic text-black shadow-lg">
                    {emp.full_name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-xl tracking-tight group-hover:text-orange-500 transition-colors uppercase italic">
                      {emp.full_name}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono font-bold tracking-widest">{emp.id_employee}</p>
                  </div>
                </div>

                <div className="flex items-center gap-10 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1">Status</p>
                    <span className="bg-orange-500/10 text-orange-500 text-[10px] px-3 py-1 rounded-full font-black uppercase italic border border-orange-500/20">
                      Aktiv
                    </span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl group-hover:bg-orange-500 group-hover:text-black transition-all">
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