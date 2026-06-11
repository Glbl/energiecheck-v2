'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function StaffPanel() {
  const [queue, setQueue] = useState<any[]>([]);

  const fetchQueue = async () => {
    const { data } = await supabase
      .from('game_participants')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });
    if (data) setQueue(data);
  };

  useEffect(() => {
    // Carga inicial de la cola
    fetchQueue();

    // Escucha en tiempo real: Cada vez que ocurra un INSERT o UPDATE en Supabase, actualiza la pantalla
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_participants' },
        () => {
          fetchQueue(); // Recarga la lista automáticamente con el cambio en vivo
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAssignPrize = async (participantId: string, prize: number) => {
    try {
      const res = await fetch('/api/game/assign-prize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, prizeWon: prize }),
      });
      if (res.ok) fetchQueue(); // Recargamos la cola en pantalla
    } catch (err) {
      alert('Fehler beim Zuweisen des Preises.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Warteschlange (Staff Panel)</h2>
      {queue.length === 0 ? (
        <p className="text-gray-500 text-center py-10">Keine Teilnehmer in der Warteschlange.</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {queue.map((user) => (
            <div key={user.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-gray-900">{user.full_name}</h4>
                <p className="text-sm text-gray-500">{user.email} | {user.phone || 'Keine Tel.'}</p>
              </div>
              
              {/* BLOQUE DE BOTONES REEMPLAZADO Y CORREGIDO */}
              <div className="flex gap-2 self-end sm:self-center">
                {[0, 10, 30, 50].map((amount) => (
                  <button
                    key={amount} 
                    onClick={() => handleAssignPrize(user.id, amount)}
                    className={`px-4 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 border ${
                      amount === 0 
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200' 
                        : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                    }`}
                  >
                    {amount === 0 ? '€0' : `€${amount}`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}