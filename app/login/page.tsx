"use client";
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  // Consultamos la tabla employees
  const { data: user, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id_employee', username) // 'user003'
    .eq('password', password)    // 'NGS_Energy#2026'
    .single();

  if (user) {
    // IMPORTANTE: Guardamos estos datos para que el Dashboard de Norma funcione
    localStorage.setItem('worker_id', user.id_employee); 
    localStorage.setItem('worker_name', user.full_name);
    localStorage.setItem('user_role', user.role);

    // Redirección según el campo 'role' de tu tabla
    if (user.role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/employee');
    }
  } else {
    alert("Anmeldedaten falsch (Datos incorrectos)");
  }
  setLoading(false);
};

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-orange-600 p-3 rounded-2xl rotate-3 mb-4">
            <LayoutDashboard className="text-black" size={28} />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">EnergieCheck Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Nutzername (ID)"
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-[#d4e137] transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-gray-500" size={18} />
            <input
              type="password"
              placeholder="Passwort"
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-[#d4e137] transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4e137] text-black font-black uppercase italic p-4 rounded-2xl hover:bg-[#e4f147] transition-all disabled:opacity-50"
          >
            {loading ? 'Laden...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
}