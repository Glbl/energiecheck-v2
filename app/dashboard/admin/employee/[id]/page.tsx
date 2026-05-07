"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  Mail,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EmployeeProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployeeData() {
      if (!id) return;

      const { data: empData } = await supabase
        .from('employees')
        .select('*')
        .eq('id_employee', id)
        .single();

      if (empData) setEmployee(empData);

      const { data: custData } = await supabase
        .from('customers')
        .select('*')
        .eq('worker_id', id)
        .order('created_at', { ascending: false });

      if (custData) setCustomers(custData);
      setLoading(false);
    }
    fetchEmployeeData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white flex justify-center items-center font-black italic">LADE DATEN...</div>;
  if (!employee) return <div className="min-h-screen bg-[#05070a] text-white flex justify-center items-center">Mitarbeiter nicht gefunden.</div>;

  // Cálculos de métricas reales para Jose
  const totalClients = customers.length;
  const pendingCommissions = customers.filter(c => c.commission_status === 'pending').reduce((sum, c) => sum + (c.commission_earned || 0), 0);
  const paidCommissions = customers.filter(c => c.commission_status === 'paid').reduce((sum, c) => sum + (c.commission_earned || 0), 0);
  const totalCommission = pendingCommissions + paidCommissions;
  // Volumen de ventas aproximado (basado en que la comisión es el 10%)
  const estimatedSales = totalCommission * 10;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">MITARBEITER PROFIL</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Status: Aktiv</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {/* Cabecera de Perfil */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-white/5 p-10 rounded-[3rem] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <User size={200} />
          </div>
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#d4e137] shadow-[0_0_30px_rgba(212,225,55,0.2)]">
            <img 
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${employee.photo_url}`}
              alt={employee.full_name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${employee.full_name}&background=d4e137&color=black`; }}
            />
          </div>
          <div className="text-center md:text-left z-10">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">{employee.full_name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase">
                <Mail size={14} className="text-[#d4e137]" /> {employee.email}
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase">
                <TrendingUp size={14} className="text-[#d4e137]" /> ID: {employee.id_employee}
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <User className="text-blue-400 mb-4" size={24} />
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Geworbene Kunden</p>
            <h2 className="text-3xl font-black mt-1">{totalClients}</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <ShoppingCart className="text-purple-400 mb-4" size={24} />
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Umsatzvolumen (Est.)</p>
            <h2 className="text-3xl font-black mt-1">{estimatedSales.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-[2.5rem]">
            <Clock className="text-orange-500 mb-4" size={24} />
            <p className="text-orange-500/70 text-[10px] uppercase font-bold tracking-widest">Offene Provision</p>
            <h2 className="text-3xl font-black text-orange-500 mt-1">{pendingCommissions.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-[#d4e137]/10 border border-[#d4e137]/20 p-8 rounded-[2.5rem]">
            <CheckCircle2 className="text-[#d4e137] mb-4" size={24} />
            <p className="text-[#d4e137]/70 text-[10px] uppercase font-bold tracking-widest">Bezahlte Provision</p>
            <h2 className="text-3xl font-black text-[#d4e137] mt-1">{paidCommissions.toLocaleString('de-DE')} €</h2>
          </div>
        </div>

        {/* Tabla de Clientes del Empleado */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12">
          <h3 className="text-2xl font-black uppercase italic tracking-tight mb-10">Kunden Historie</h3>
          
          {customers.length === 0 ? (
            <div className="text-center py-20 bg-black/20 rounded-[2rem] border border-dashed border-white/10">
              <p className="text-gray-500 font-bold uppercase tracking-widest">Noch keine Kunden geworben</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black">
                    <th className="px-6 pb-4">Kunde</th>
                    <th className="px-6 pb-4">Datum</th>
                    <th className="px-6 pb-4">Status</th>
                    <th className="px-6 pb-4 text-right">Provision</th>
                    <th className="px-6 pb-4 text-right">Auszahlung</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="bg-white/5 hover:bg-white/10 transition-all group">
                      <td className="px-6 py-5 rounded-l-[1.5rem] border-y border-l border-white/5">
                        <p className="font-bold text-sm group-hover:text-[#d4e137] transition-colors">{customer.first_name} {customer.last_name}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{customer.email}</p>
                      </td>
                      <td className="px-6 py-5 border-y border-white/5 text-xs text-gray-400 font-mono">
                        {new Date(customer.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-5 border-y border-white/5">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest">
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 border-y border-white/5 text-right font-black italic text-sm text-[#d4e137]">
                        {customer.commission_earned} €
                      </td>
                      <td className="px-6 py-5 rounded-r-[1.5rem] border-y border-r border-white/5 text-right">
                        {customer.commission_status === 'paid' ? (
                          <span className="text-[#d4e137] text-[10px] font-black uppercase bg-[#d4e137]/10 px-4 py-2 rounded-xl border border-[#d4e137]/20">Bezahlt</span>
                        ) : (
                          <span className="text-orange-500 text-[10px] font-black uppercase bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/20">Ausstehend</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}