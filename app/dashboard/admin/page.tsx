"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Users, BarChart3, Clock, Wallet, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [funnelLogs, setFunnelLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (!role || role !== 'admin') {
      router.push('/login');
      return;
    }

    async function fetchData() {
      const { data: empData } = await supabase.from('employees').select('*');
      const { data: logData } = await supabase.from('user_funnel_logs').select('*').order('created_at', { ascending: false }).limit(10);
      if (empData) setEmployees(empData);
      if (logData) setFunnelLogs(logData);
      setLoading(false);
    }
    fetchData();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-3xl font-black uppercase italic text-orange-500 font-sans">Haupt Dashboard</h1>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 uppercase text-xs">Abmelden</button>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
          <h3 className="font-bold mb-4 font-sans">Mitarbeiter</h3>
          {employees.map((emp) => (
            <div key={emp.id} className="p-3 border-b border-white/5 text-sm">{emp.full_name} - {emp.id_employee}</div>
          ))}
        </div>
        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
          <h3 className="font-bold mb-4 font-sans">Live Funnel</h3>
          {funnelLogs.map((log) => (
            <div key={log.id} className="text-[10px] text-gray-400">{log.current_step} - {log.time_spent_seconds}s</div>
          ))}
        </div>
      </div>
    </div>
  );
}