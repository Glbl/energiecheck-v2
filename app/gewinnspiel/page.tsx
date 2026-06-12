'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'; // 1. Agregamos useEffect aquí

export default function ClientRegistration() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  // 2. TEMPORIZADOR AUTOMÁTICO: Regresa al formulario después de 7 segundos
  useEffect(() => {
    if (registered) {
      const timer = setTimeout(() => {
        setRegistered(false);
        setForm({ fullName: '', email: '', phone: '' }); // Limpia los inputs para el siguiente
      }, 7000); // 7000 milisegundos = 7 segundos

      return () => clearTimeout(timer); // Limpieza del timer si el componente se desmonta
    }
  }, [registered]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/game/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) setRegistered(true);
    } catch (err) {
      alert('Fehler bei der Registrierung.');
    } finally {
      setLoading(false);
    }
  };

  // 3. PANTALLA DE ÉXITO (Actualizada con el botón manual rápido)
  if (registered) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-2xl shadow-xl border flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-green-600 mb-4">Bereit zum Spielen! 🚀</h2>
        <p className="text-gray-600 mb-6">Du bist in der Warteschlange. Bitte sag dem Mitarbeiter am Stand deinen Namen, um dein Spiel zu starten.</p>
        
        {/* BOTÓN MANUAL DE RETORNO RÁPIDO */}
        <button
          onClick={() => {
            setRegistered(false);
            setForm({ fullName: '', email: '', phone: '' });
          }}
          className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm"
        >
          Nächster Teilnehmer →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Energiecheck-24 Gewinnspiel</h2>
      <p className="text-sm text-gray-500 mb-6">Registriere dich, um dein Spiel freizuschalten.</p>
      <form onSubmit={handleRegister} className="space-y-4">
        <input 
          type="text" placeholder="Vollständiger Name" required
          value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
          className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
        />
        <input 
          type="email" placeholder="E-Mail-Adresse" required
          value={form.email} onChange={e => setForm({...form, email: e.target.value})}
          className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
        />
        <input 
          type="tel" placeholder="Telefonnummer (Optional)"
          value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
          className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
        />
        <button type="submit" disabled={loading} className="w-full bg-black text-white p-4 rounded-lg font-bold">
          {loading ? 'Wird registriert...' : 'In die Warteschlange eintreten'}
        </button>
      </form>
    </div>
  );
}