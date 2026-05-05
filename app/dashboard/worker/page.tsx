"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';
import { Wallet, Users, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WorkerDashboard() {
  const [workerData, setWorkerData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    const workerId = localStorage.getItem('worker_id');
    if (!role || !workerId) {
      router.push('/login');
      return;
    }

    async function loadStats() {
      const { data } = await supabase.from('employees').select('*').eq('id_employee', workerId).single();
      if (data) setWorkerData(data);
    }
    loadStats();
  }, [router]);

  if (!workerData) return <div className="p-10 font-sans">Laden...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black italic uppercase font-sans">Mein Dashboard</h1>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500"><LogOut /></button>
      </div>
      <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 text-center">
        <QRCodeSVG value={`https://energiecheck-v2.vercel.app/?code=${workerData.id_employee}&source=qr`} size={150} className="mx-auto mb-4" />
        <p className="text-xs text-orange-500 font-mono">{workerData.id_employee}</p>
      </div>
    </div>
  );
}