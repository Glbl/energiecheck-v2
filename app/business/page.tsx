"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Users, DollarSign, LayoutDashboard, CheckCircle2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EmployeeDashboard() {
  const [workerId, setWorkerId] = useState("");
  const [employee, setEmployee] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // La URL que el empleado va a compartir para que los clientes vean la promoción
  const promotionLink = workerId 
    ? `https://energiecheck-v2-git-main-gb128128-6735s-projects.vercel.app/promotion?code=${workerId}`
    : "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      setWorkerId(cleanCode);
      fetchDashboardData(cleanCode);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchDashboardData(id: string) {
    // 1. Obtener datos del empleado
    const { data: empData } = await supabase
      .from('employees')
      .select('*')
      .eq('id_employee', id)
      .single();

    if (empData) setEmployee(empData);

    // 2. Obtener la lista de clientes referidos por este empleado
    const { data: custData } = await supabase
      .from('customers')
      .select('*')
      .eq('worker_id', id)
      .order('created_at', { ascending: false });

    if (custData) setCustomers(custData);
    setLoading(false);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(promotionLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white flex justify-center items-center">Laden...</div>;
  
  if (!workerId) return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col justify-center items-center">
      <h2 className="text-2xl font-black text-orange-500 mb-2">Zugriff verweigert</h2>
      <p className="text-gray-400">Bitte verwenden Sie Ihren persönlichen Mitarbeiter-Link.</p>
    </div>
  );

  // Cálculos de comisiones para el empleado
  const totalClients = customers.length;
  const totalCommissions = customers
    .filter(c => c.commission_status === 'pending' || c.commission_status === 'paid')
    .reduce((sum, c) => sum + (c.commission_earned || 0), 0);

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      
      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#d4e137] p-2 rounded-lg rotate-3">
              <LayoutDashboard className="text-black" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Mitarbeiter Portal</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                {employee ? employee.full_name : `ID: ${workerId}`}
              </p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: HERRAMIENTAS DE VENTA (QR y Link) */}
        <div className="md:col-span-1 space-y-6">
          <div className="flex flex-col items-center bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-[#d4e137] font-black uppercase tracking-widest mb-6">Dein Promo-QR</h3>
            
            {/* El Código QR */}
            <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(212,225,55,0.15)]">
              <QRCodeSVG value={promotionLink} size={180} level="H" />
            </div>
            <p className="mt-4 text-xs font-bold text-gray-400 tracking-widest uppercase">ID: {workerId}</p>
            
            {/* El enlace directo que pide Jose */}
            <div className="mt-8 w-full">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold text-center">
                Direktlink zum Kopieren
              </p>
              <div className="flex items-center bg-black border border-white/10 rounded-xl p-1.5 focus-within:border-[#d4e137] transition-colors">
                <input 
                  type="text" 
                  readOnly 
                  value={promotionLink} 
                  className="bg-transparent text-[11px] text-gray-300 w-full outline-none px-3"
                />
                <button 
                  onClick={handleCopy} 
                  className="ml-2 p-3 bg-[#d4e137] text-black rounded-lg hover:bg-yellow-400 transition-all flex-shrink-0"
                  title="Link kopieren"
                >
                  {copied ? <Check size={16} className="text-green-800" /> : <Copy size={16} />}
                </button>
              </div>
              {copied && (
                <p className="text-[10px] text-[#d4e137] text-center mt-3 animate-in fade-in font-bold uppercase tracking-widest">
                  Link kopiert!
                </p>
              )}
            </div>
          </div>

          {/* Tarjetas de Resumen Rápido */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <DollarSign className="text-[#d4e137] mb-3" size={24} />
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Meine Provisionen</p>
            <h2 className="text-3xl font-black mt-1">{totalCommissions.toFixed(2)} €</h2>
          </div>
        </div>

        {/* COLUMNA DERECHA: LISTA DE CLIENTES */}
        <div className="md:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 min-h-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase italic tracking-tight">Meine Kunden</h3>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                <Users size={14} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-300">{totalClients} Registriert</span>
              </div>
            </div>

            {customers.length === 0 ? (
              <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-white/10">
                <p className="text-gray-500 font-bold uppercase tracking-widest">Noch keine Kunden geworben</p>
                <p className="text-xs text-gray-600 mt-2">Teilen Sie Ihren QR-Code, um zu starten.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customers.map((customer) => {
                  // LÓGICA DE COLOR VERDE: Si ya compró o se le pagó la comisión
                  const isSuccess = customer.commission_status === 'paid' || customer.status === 'purchased';

                  return (
                    <div 
                      key={customer.id} 
                      className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
                        isSuccess 
                          ? 'bg-[#d4e137]/10 border-[#d4e137]/30 shadow-[0_0_20px_rgba(212,225,55,0.05)]' 
                          : 'bg-black/40 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <p className={`font-bold ${isSuccess ? 'text-[#d4e137]' : 'text-white'}`}>
                          {customer.first_name} {customer.last_name}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">{customer.email}</p>
                      </div>
                      
                      <div className="text-right flex flex-col items-end">
                        {isSuccess ? (
                          <div className="flex items-center gap-1.5 text-[#d4e137] bg-[#d4e137]/10 px-3 py-1 rounded-full border border-[#d4e137]/20">
                            <CheckCircle2 size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Kauf bestätigt</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
                            In Bearbeitung
                          </span>
                        )}
                        <span className="text-xs font-mono text-gray-500 mt-2">
                          {new Date(customer.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}