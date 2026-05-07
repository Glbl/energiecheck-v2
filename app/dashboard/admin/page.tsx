"use client";
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [userInput, setUserInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanUser = String(userInput).trim();
      const cleanPass = String(password).trim();

      // 1. Buscamos directamente en la tabla 'employees' que ya confirmamos que tiene a todos
      const { data: user, error } = await supabase
        .from('employees')
        .select('*')
        .eq('username', cleanUser)
        .eq('password', cleanPass)
        .maybeSingle();

      if (error) {
        console.error("Error de Supabase:", error);
        alert("Error de conexión con la base de datos.");
        return;
      }

      if (!user) {
        alert("Usuario o contraseña incorrectos.");
        return;
      }

      // 2. Guardamos la sesión en el navegador
      localStorage.setItem('user_role', user.role); // 'admin' o 'worker'
      localStorage.setItem('worker_id', user.id_employee); // Ej: 'JL040981' para José o 'NG021284' para Norma
      localStorage.setItem('full_name', user.full_name);

      // 3. Redirección inteligente según el rol de tu tabla
      if (user.role === 'admin') {
        // Si es José (admin000), va al panel de control total
        router.push('/dashboard/admin');
      } else if (user.role === 'worker') {
        // Si es Norma, Henry, etc., van a su portal de ventas
        router.push('/dashboard/worker');
      } else {
        alert("Rol no reconocido: " + user.role);
      }

    } catch (err) {
      console.error("Error crítico:", err);
      alert("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-orange-600 p-3 rounded-2xl rotate-3 mb-4 shadow-lg shadow-orange-600/20">
            <LayoutDashboard className="text-black" size={28} />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">EnergieCheck</h1>
          <p className="text-[#d4e137] text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic">Portal-Zugang</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <User className="absolute left-4 top-4 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Benutzername"
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-[#d4e137] transition-all"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-500" size={18} />
              <input
                type="password"
                placeholder="Passwort"
                autoComplete="current-password"
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-[#d4e137] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4e137] text-black font-black uppercase italic p-4 rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 shadow-xl shadow-[#d4e137]/10"
          >
            {loading ? 'PRÜFUNG...' : 'ANMELDEN'}
          </button>
        </form>
      </div>
    </div>
  );
}