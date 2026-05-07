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
      const cleanUser = String(userInput).trim();
      const cleanPass = String(password).trim();

      // Buscamos en 'username' y validamos 'password'
      const { data: user, error } = await supabase
        .from('employees')
        .select('*')
        .eq('username', cleanUser)
        .eq('password', cleanPass)
        .maybeSingle();

      if (error) {
        alert("Error de conexión: " + error.message);
        return;
      }

      if (!user) {
        alert("Usuario o contraseña incorrectos.");
        return;
      }

      // GUARDAR DATOS CLAVE
      // worker_id guardará el código (ej: JL260190) para el tracking
      localStorage.setItem('worker_id', user.id_employee); 
      localStorage.setItem('user_role', user.role); // Aquí guardará 'worker' o 'admin'

      // REDIRECCIÓN SEGÚN TU TABLA
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user.role === 'worker') {
        // Redirigimos a la carpeta que creamos para los trabajadores
        router.push('/dashboard/employee');
      } else {
        alert("Rol no reconocido: " + user.role);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-orange-600 p-3 rounded-2xl rotate-3 mb-4 shadow-lg shadow-orange-600/20">
            <LayoutDashboard className="text-black" size={28} />
          </div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">EnergieCheck</h1>
          <p className="text-[#d4e137] text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Mitarbeiter-Zugang</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-4 mb-2 block">Benutzername (user003)</label>
            <div className="relative">
              <User className="absolute left-4 top-4 text-gray-500" size={18} />
              <input
                type="text"
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 pl-12 text-white outline-none focus:border-[#d4e137] transition-all"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-4 mb-2 block">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-500" size={18} />
              <input
                type="password"
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
            className="w-full bg-[#d4e137] text-black font-black uppercase italic p-5 rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 shadow-xl shadow-[#d4e137]/10"
          >
            {loading ? 'PRÜFUNG...' : 'ANMELDEN'}
          </button>
        </form>
      </div>
    </div>
  );
}