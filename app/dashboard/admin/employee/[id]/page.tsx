"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useParams } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Clock, CheckCircle2, Users } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeProfile() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchEmployeeData() {
      if (!id) return;
      
      // 1. Cargar los datos del empleado
      const { data: empData } = await supabase
        .from('employees')
        .select('*')
        .eq('id_employee', id)
        .maybeSingle();
        
      if (empData) setEmployee(empData);

      // 2. Cargar TODOS los clientes/leads asignados a este worker_id (hayan comprado o no)
      const { data: custsData } = await supabase
        .from('customers')
        .select('*')
        .eq('worker_id', id)
        .order('registration_date', { ascending: false });
        
      if (custsData) setCustomers(custsData);
      setLoading(false);
    }
    fetchEmployeeData();
  }, [id]);

  // CÁLCULOS CONFIGURADOS CON LOS ESTADOS REALES Y CON PROTECCIÓN PARA EL BUILD DE VERCEL
  const totalSales = (customers || []).reduce((acc: number, c: any) => acc + (Number(c?.purchase_amount) || 0), 0);
  const pendingComm = (customers || []).filter((c: any) => c?.commission_status === 'pending').reduce((acc: number, c: any) => acc + (Number(c?.commission_earned) || 0), 0);
  const paidComm = (customers || []).filter((c: any) => c?.commission_status === 'paid').reduce((acc: number, c: any) => acc + (Number(c?.commission_earned) || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white flex justify-center items-center">
        <span>Laden...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center px-6 sticky top-0 z-50">
        <Link href="/dashboard/admin" className="p-2 bg-white/5 rounded-full mr-4 hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-black italic uppercase">Mitarbeiter Profil</h1>
      </nav>

      <main className="max-w-7xl mx-auto p-10">
        {/* ENCABEZADO DEL PERFIL */}
        {/* ENCABEZADO DEL PERFIL */}
<div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 md:gap-8 mb-12 bg-white/5 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-white/10 w-full">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#d4e137]">
            <img 
              src={`https://hoigzuytnzlkypkruyom.supabase.co/storage/v1/object/public/avatars/${employee?.photo_url}`} 
              alt="" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${employee?.full_name}&background=d4e137&color=black`;
              }}
            />
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">{employee?.full_name}</h2>
            <p className="text-gray-400 font-mono text-sm mt-1 uppercase">Worker ID: {employee?.id_employee}</p>
          </div>
        </div>

        {/* TARJETAS DE MÉTRICAS INDIVIDUALES */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
            <ShoppingCart className="text-blue-400 mb-4" size={24} />
            <p className="text-gray-500 text-[10px] font-bold uppercase">Umsatzvolumen</p>
            <h2 className="text-3xl font-black mt-1">{totalSales.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-[2rem]">
            <Clock className="text-orange-500 mb-4" size={24} />
            <p className="text-orange-500/70 text-[10px] font-bold uppercase">Offen</p>
            <h2 className="text-3xl font-black text-orange-500 mt-1">{pendingComm.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-[#d4e137]/10 border border-[#d4e137]/20 p-8 rounded-[2rem]">
            <CheckCircle2 className="text-[#d4e137] mb-4" size={24} />
            <p className="text-[#d4e137]/70 text-[10px] font-bold uppercase">Bezahlt</p>
            <h2 className="text-3xl font-black text-[#d4e137] mt-1">{paidComm.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
            <Users className="text-purple-400 mb-4" size={24} />
            <p className="text-gray-500 text-[10px] font-bold uppercase">Registrierte Kunden</p>
            <h2 className="text-3xl font-black mt-1">{customers.length}</h2>
          </div>
        </div>

        {/* TABLA DE HISTORIAL DE CLIENTES (KUNDEN HISTORIE) */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10">
          <h3 className="text-2xl font-black uppercase italic mb-8">Kunden Historie</h3>
          <div className="space-y-4">
            {customers.length === 0 ? (
              <p className="text-gray-500 text-sm italic font-mono">Keine Kunden für diesen Mitarbeiter registriert.</p>
            ) : (
              customers.map((c: any) => (
                <div key={c.id} className="p-6 bg-black/40 rounded-2xl border border-white/5 flex justify-between items-center transition-all hover:bg-white/5">
                  <div>
                    <p className="font-bold text-lg font-mono text-gray-300 break-all truncate">{c.email || 'Keine E-Mail'}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500 font-mono mt-1">
                      <span>Kauf: {Number(c.purchase_amount).toLocaleString('de-DE')} €</span>
                      <span>•</span>
                      <span>Registriert: {c.registration_date ? new Date(c.registration_date).toLocaleDateString('de-DE') : '-'}</span>
                      <span>•</span>
                      <span className="uppercase text-blue-400">Status: {c.status || 'lead'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#d4e137] font-black">{Number(c.commission_earned).toLocaleString('de-DE')} €</p>
                    <p className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded inline-block mt-1 ${
                      c.commission_status === 'paid' ? 'text-[#d4e137] bg-[#d4e137]/5' : 'text-orange-500 bg-orange-500/5'
                    }`}>
                      {c.commission_status === 'paid' ? 'Bezahlt' : 'Offen'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}