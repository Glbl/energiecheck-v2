"use client";
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
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
      // Limpieza absoluta de datos
      const cleanUser = String(userInput).trim();
      const cleanPass = String(password).trim();

      // Buscamos en la columna 'username' forzando el valor como string
      const { data: user, error } = await supabase
        .from('employees')
        .select('*')
        .eq('username', cleanUser)
        .eq('password', cleanPass)
        .maybeSingle();

      if (error) {
        console.error("Supabase Error:", error);
        alert("Datenbankfehler. Bitte versuchen Sie es erneut.");
        return;
      }

      if (!user) {
        alert("Falscher Benutzername oder falsches Passwort.");
        return;
      }

      // GUARDAR DATOS CLAVE
      // Usamos id_employee para el tracking (ej: JL260190)
      localStorage.setItem('worker_id', user.id_employee); 
      localStorage.setItem('user_role', user.role);

      // REDIRECCIÓN SEGÚN TU ROL 'worker'
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user.role === 'worker') {
        router.push('/dashboard/worker');
      } else {
        alert("Nicht anerkannte Rolle: " + user.role);
      }

    } catch (err) {
      console.error("Error crítico:", err);
      alert("Es ist ein unerwarteter Fehler aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-orange-600 p-3 rounded-2xl rotate-3 mb-4">
            <LayoutDashboard className="text-black" size={28} />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">EnergieCheck</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-4 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Username (user003)"
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-[#d4e137] transition-all"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
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
            className="w-full bg-[#d4e137] text-black font-black uppercase italic p-4 rounded-2xl hover:bg-[#e4f147] transition-all"
          >
            {loading ? 'PRÜFUNG...' : 'EINLOGGEN'}
          </button>
        </form>
      </div>
    </div>
  );
}