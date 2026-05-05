"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Phone, Mail, CheckCircle, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BusinessPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [workerId, setWorkerId] = useState("04091981P0001");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) setWorkerId(code);
  }, []);

  const handlePurchase = async (customerId: string, amount: number) => {
    const commission = amount * 0.10;
    await supabase.from('customers').update({ 
      status: 'purchased',
      purchase_amount: amount,
      commission_earned: commission,
      commission_status: 'pending'
    }).eq('id', customerId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('customers').insert([
      { full_name: fullName, phone: phone, email: email, worker_id: workerId, status: 'registered' }
    ]).select();

    if (!error && data) {
      setIsSaved(true);
      await handlePurchase(data[0].id, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="absolute top-6 left-6">
        <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-white transition-all text-xs uppercase font-bold">
          <ArrowLeft size={16} /> Login Portal
        </Link>
      </div>
      <main className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-orange-500 font-black italic text-3xl uppercase tracking-tighter">Energiecheck-24</h1>
        </div>
        {isSaved ? (
          <div className="text-center p-12 bg-white/5 border border-[#d4e137]/30 rounded-[2.5rem]">
            <CheckCircle className="text-[#d4e137] mx-auto mb-4" size={60} />
            <h2 className="text-2xl font-black uppercase italic text-white font-sans">Danke!</h2>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="text" placeholder="Name" required className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white" onChange={(e) => setFullName(e.target.value)} />
              <input type="tel" placeholder="Telefon" required className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white" onChange={(e) => setPhone(e.target.value)} />
              <input type="email" placeholder="E-Mail" required className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white" onChange={(e) => setEmail(e.target.value)} />
              <button className="w-full py-5 bg-[#d4e137] text-black font-black rounded-2xl uppercase">Anmelden</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}