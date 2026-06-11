'use client';
import { useState } from 'react';

export default function ClientRegistration() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

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
      alert('Fehler bei de Registrierung.');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white rounded-2xl shadow-xl border">
        <h2 className="text-3xl font-extrabold text-green-600 mb-4">Bereit zum Spielen! 🚀</h2>
        <p className="text-gray-600">Du bist in der Warteschlange. Bitte sag dem Mitarbeiter am Stand deinen Namen, um dein Spiel zu starten.</p>
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