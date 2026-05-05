"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, BarChart3, Clock, Wallet, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 1. Inicialización de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [funnelLogs, setFunnelLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // 2. Protección de ruta y carga de datos
  useEffect(() => {
    const role = localStorage.getItem('user_role');
    
    // Si no es admin, fuera
    if (!role || role !== 'admin') {
      router.push('/login');
      return;
    }

    async function fetchData() {
      setLoading(true);
      
      // Obtener empleados (incluyendo la columna avatar_url)
      const { data: empData } = await supabase
        .from('employees')
        .select('*')
        .order('full_name', { ascending: true });

      // Obtener rastro de clientes (Paso 10 del prototipo)
      const { data: logData } = await supabase
        .from('user_funnel_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      if (empData) setEmployees(empData);
      if (logData) setFunnelLogs(logData);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#d4e137] font-black italic uppercase animate-pulse">
        Lade Daten...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-[#d4e137] selection:text-black">
      
      {/* HEADER ESTATAL */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg rotate-3">
              <LayoutDashboard className="text-black" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">HAUPT DASHBOARD</h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Admin: Jose Alejandro Lorusso</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Abmelden
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        
        {/* CARDS DE RESUMEN (Umsatz Gesamt - Paso 10) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:border-orange-500/50 transition-all">
            <Users className="text-orange-500 mb-4" size={20} />
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Mitarbeiter</p>
            <h2 className="text-3xl font-black mt-1">{employees.length}</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:border-[#d4e137]/50 transition-all">
            <BarChart3 className="text-[#d4e137] mb-4" size={20} />
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Umsatz Gesamt</p>
            <h2 className="text-3xl font-black mt-1">12.500 €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:border-blue-500/50 transition-all">
            <Wallet className="text-blue-400 mb-4" size={20} />
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Provisionen</p>
            <h2 className="text-3xl font-black mt-1">1.250 €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:border-purple-500/50 transition-all">
            <Clock className="text-purple-400 mb-4" size={20} />
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Live Tracking</p>
            <h2 className="text-3xl font-black mt-1">{funnelLogs.length} Aktiv</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LISTA DE EMPLEADOS CON FOTO */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black uppercase italic tracking-tight">Mitarbeiter Übersicht</h3>
              <span className="text-[10px] bg-[#d4e137] text-black px-3 py-1 rounded-full font-bold uppercase">Online</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map((emp: any) => (
                <div key={emp.id} className="flex items-center justify-between p-4 bg-black/40 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-orange-500/50 transition-all">
                      <img 
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${emp.avatar_url}`}
                        alt={emp.full_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${emp.full_name}&background=orange&color=black&bold=true`;
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">{emp.full_name}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1">{emp.id_employee}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#d4e137] font-black text-sm italic">3.450 €</p>
                    <p className="text-[8px] text-gray-600 uppercase font-bold tracking-tighter">Umsatz</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LIVE TRACKING (Funnel Tracking - Pasos 1-12) */}
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col">
            <h3 className="text-xl font-black uppercase italic mb-8 tracking-tight">Live Funnel</h3>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 max-h-[500px]">
              {funnelLogs.length > 0 ? funnelLogs.map((log: any) => (
                <div key={log.id} className="relative pl-6 border-l border-white/10">
                  <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono text-gray-500">SESS_{log.session_id.slice(-4)}</span>
                    <span className="text-[#d4e137] text-[10px] font-black uppercase italic">{log.current_step}</span>
                  </div>
                  <p className="text-[11px] text-gray-300">
                    Verweilzeit: <span className="font-bold">{log.time_spent_seconds}s</span>
                  </p>
                  <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-widest font-bold">Ref: {log.worker_id}</p>
                </div>
              )) : (
                <div className="text-center py-20 text-gray-700 uppercase text-xs font-black italic tracking-widest">
                  Warten auf Daten...
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="p-12 text-center opacity-20 mt-10">
        <p className="text-[9px] uppercase tracking-[0.5em] font-black">Energiecheck-24 Technical Lead: Giovanni Lazo</p>
      </footer>
    </div>
  );
}