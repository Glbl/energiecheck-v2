"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useParams } from 'next/navigation';
import { ArrowLeft, User, ShoppingCart, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeProfile() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployeeData() {
      if (!id) return;
      const { data: empData } = await supabase.from('employees').select('*').eq('id_employee', id).single();
      if (empData) setEmployee(empData);

      const { data: custData } = await supabase.from('customers').select('*').eq('worker_id', id).order('registration_date', { ascending: false });
      if (custData) setCustomers(custData);
      setLoading(false);
    }
    fetchEmployeeData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white flex justify-center items-center">Laden...</div>;

  // CORRECCIÓN DE TIPADO EN REDUCE
  const totalSales = customers.reduce((acc: number, c: any) => acc + (Number(c.purchase_amount) || 0), 0);
  const pendingComm = customers.filter(c => c.commission_status === 'pending').reduce((acc: number, c: any) => acc + (Number(c.commission_earned) || 0), 0);
  const paidComm = customers.filter(c => c.commission_status === 'paid').reduce((acc: number, c: any) => acc + (Number(c.commission_earned) || 0), 0);

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center px-6 sticky top-0 z-50">
        <Link href="/dashboard/admin" className="p-2 bg-white/5 rounded-full mr-4 hover:bg-white/10 transition-colors"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-black italic uppercase">Mitarbeiter Profil</h1>
      </nav>

      <main className="max-w-7xl mx-auto p-10">
        <div className="flex items-center gap-8 mb-12 bg-white/5 p-10 rounded-[3rem] border border-white/10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#d4e137]">
            <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${employee?.photo_url}`} alt="" className="w-full h-full object-cover" onError={(e) => {(e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${employee?.full_name}&background=d4e137&color=black`;}}/>
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">{employee?.full_name}</h2>
            <p className="text-gray-400 font-mono text-sm mt-1 uppercase">Worker ID: {employee?.id_employee}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
            <ShoppingCart className="text-blue-400 mb-4" size={24} />
            <p className="text-gray-500 text-[10px] font-bold uppercase">Umsatzvolumen</p>
            <h2 className="text-3xl font-black mt-1">{totalSales.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-[2rem]">
            <Clock className="text-orange-500 mb-4" size={24} />
            <p className="text-orange-500/70 text-[10px] font-bold uppercase">Offen (Pendiente)</p>
            <h2 className="text-3xl font-black text-orange-500 mt-1">{pendingComm.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-[#d4e137]/10 border border-[#d4e137]/20 p-8 rounded-[2rem]">
            <CheckCircle2 className="text-[#d4e137] mb-4" size={24} />
            <p className="text-[#d4e137]/70 text-[10px] font-bold uppercase">Bezahlt (Pagado)</p>
            <h2 className="text-3xl font-black text-[#d4e137] mt-1">{paidComm.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
            <TrendingUp className="text-purple-400 mb-4" size={24} />
            <p className="text-gray-500 text-[10px] font-bold uppercase">Kundenanzahl</p>
            <h2 className="text-3xl font-black mt-1">{customers.length}</h2>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10">
          <h3 className="text-2xl font-black uppercase italic mb-8">Kunden Historie</h3>
          <div className="space-y-4">
            {customers.map((c: any) => (
              <div key={c.id} className="p-6 bg-black/40 rounded-2xl border border-white/5 flex justify-between items-center transition-all hover:bg-white/5">
                <div>
                  <p className="font-bold text-lg">{c.full_name}</p>
                  <p className="text-xs text-gray-500 font-mono">{c.email}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[#d4e137] font-black`}>{c.commission_earned} €</p>
                  <p className="text-[10px] uppercase font-bold text-gray-600">{c.commission_status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}