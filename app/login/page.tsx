"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Consulta simple a la tabla que creaste
    const { data, error: dbError } = await supabase
      .from('employees')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (dbError || !data) {
      setError('Falscher Benutzername oder falsches Passwort');
      return;
    }

    // Guardar sesión básica (puedes mejorar esto con NextAuth luego)
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('worker_id', data.id_employee);

    // Redirección según el rol definido en tu CSV
    if (data.role === 'admin') {
      router.push('/dashboard/admin'); // Haupt Dashboard
    } else {
      router.push('/dashboard/worker'); // Detail Dashboard
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-orange-500 font-black italic text-2xl uppercase">Energiecheck-24</h1>
          <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Internal Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-4 top-4 text-gray-500" size={20} />
              <input 
                type="text" placeholder="Usuario (ej: admin000)" 
                className="w-full bg-black border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-orange-500 transition-all text-white"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-500" size={20} />
              <input 
                type="password" placeholder="Contraseña" 
                className="w-full bg-black border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-orange-500 transition-all text-white"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-xl border border-red-400/20">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-500/20">
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
}