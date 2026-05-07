"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
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

    try {
      // Forzamos que 'username' sea tratado como String para evitar el error 400
      const { data: user, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id_employee', String(username).trim()) 
        .eq('password', String(password).trim())
        .single();

      if (error || !user) {
        console.error("Login Error:", error);
        alert("Anmeldedaten falsch o ID no existe.");
      } else {
        // GUARDAR DATOS EN LOCALSTORAGE
        localStorage.setItem('worker_id', user.id_employee);
        localStorage.setItem('worker_name', user.full_name);
        localStorage.setItem('user_role', user.role);

        // REDIRECCIÓN SEGÚN ROL
        if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          // Esta es la nueva ruta que creaste: app/dashboard/employee/page.tsx
          router.push('/dashboard/employee');
        }
      }
    } catch (err) {
      console.error("System Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-orange-600 p-3 rounded-2xl rotate-3 mb-4 shadow-[0_0_20px_rgba(234,88,12,0.3)]">
            <LayoutDashboard className="text-black" size={28} />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">EnergieCheck Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Mitarbeiter ID (ej: user003)"
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
            className="w-full bg-[#d4e137] text-black font-black uppercase italic p-4 rounded-2xl hover:bg-[#e4f147] transition-all disabled:opacity-50 shadow-lg"
          >
            {loading ? 'PRÜFUNG...' : 'EINLOGGEN'}
          </button>
        </form>
      </div>
    </div>
  );
}