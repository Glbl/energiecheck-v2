'use client';
import { useState, useEffect } from 'react';

export default function BusinessDashboard() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    // Añadimos un timestamp (?t=...) al final para romper la caché del navegador de forma definitiva
    fetch(`/api/game/report?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        setReportData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm font-mono text-gray-500 animate-pulse">Lade Dashboard-Daten...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm font-bold text-red-500">Fehler beim Laden des Berichts.</p>
      </div>
    );
  }

  const { summary, inventory, history } = reportData;

  return (
    <div className="max-w-6xl mx-auto my-10 p-6 font-sans">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-8 gap-4 print:mb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">WIN BIG — Standanalyse</h1>
          <p className="text-sm text-gray-500 mt-1">Echtzeit-Reporting für Verteilung und Budgetkontrolle der Gutscheine</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-black hover:bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 print:hidden"
        >
          Bericht als PDF drucken
        </button>
      </div>

      {/* METRICAS DE RENDIMIENTO COMERCIAL (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="p-6 bg-red-50/60 border border-red-100 rounded-2xl shadow-sm">
          <span className="text-xs text-red-600 font-bold uppercase tracking-wider block">Ausgegebenes Budget</span>
          <h3 className="text-3xl font-black text-red-700 mt-2">€ {summary.totalPrizeAllocated},00</h3>
          <p className="text-xs text-red-500/80 mt-1">Gutscheinwert im Umlauf</p>
        </div>
        
        <div className="p-6 bg-emerald-50/60 border border-emerald-100 rounded-2xl shadow-sm">
          <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider block">Gesendete Gutscheine</span>
          <h3 className="text-3xl font-black text-emerald-700 mt-2">{summary.totalWinners}</h3>
          <p className="text-xs text-emerald-500/80 mt-1">Gewinner am Stand</p>
        </div>

        <div className="p-6 bg-gray-50 border border-gray-200/60 rounded-2xl shadow-sm">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">Nieten (Kein Gewinn)</span>
          <h3 className="text-3xl font-black text-gray-700 mt-2">{summary.totalLosses}</h3>
          <p className="text-xs text-gray-400 mt-1">Teilnehmer mit €0 Trostpreis</p>
        </div>

        <div className="p-6 bg-blue-50/60 border border-blue-100 rounded-2xl shadow-sm">
          <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block">Registrierungen Gesamt</span>
          <h3 className="text-3xl font-black text-blue-700 mt-2">{summary.totalPlayers}</h3>
          <p className="text-xs text-blue-400 mt-1">Bruttospieleranzahl</p>
        </div>
      </div>

      {/* MONITOR DE RESERVA EN ALMACÉN (SUPABASE COUPOUN INVENTORY - INTEGRADO SIMÉTRICO) */}
      <div className="mb-10 p-6 bg-gray-900 text-white rounded-2xl shadow-md border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold uppercase text-amber-400 tracking-wide">Gutschein-Lagerbestand (Supabase)</h3>
          <span className="text-[10px] bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded font-mono">Max 450 Codes</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
            <span className="text-gray-300">Gutscheine <b className="text-white">€10</b>:</span>
            <span>
              Verwendet: <b className="text-red-400 mr-2">{inventory.prize10?.used || 0}</b> 
              Frei: <b className="text-emerald-400">{inventory.prize10?.free || 0}</b>
            </span>
          </div>
          <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
            <span className="text-gray-300">Gutscheine <b className="text-white">€30</b>:</span>
            <span>
              Verwendet: <b className="text-red-400 mr-2">{inventory.prize30?.used || 0}</b> 
              Frei: <b className="text-emerald-400">{inventory.prize30?.free || 0}</b>
            </span>
          </div>
          <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
            <span className="text-gray-300">Gutscheine <b className="text-white">€50</b>:</span>
            <span>
              Verwendet: <b className="text-red-400 mr-2">{inventory.prize50?.used || 0}</b> 
              Frei: <b className="text-emerald-400">{inventory.prize50?.free || 0}</b>
            </span>
          </div>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA DETALLADA */}
      <div className="flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Gewinner-Logbuch (Audit-Trail)</h3>
        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 border-collapse">
              <thead className="bg-gray-50 text-[11px] text-gray-500 uppercase font-mono tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4 font-semibold">Datum </th>
                  <th className="p-4 font-semibold">Name (Customer)</th>
                  <th className="p-4 font-semibold">E-Mail-Adresse</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right">Gutscheincode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((row: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 text-xs font-mono text-gray-400">
                      {new Date(row.created_at).toLocaleDateString('de-DE')} {new Date(row.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 font-bold text-gray-900">{row.full_name}</td>
                    <td className="p-4 text-xs text-gray-500">{row.email}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase ${
                        row.prize_won > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {row.prize_won > 0 ? `+ €${row.prize_won}` : 'Niete'}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-right text-xs text-gray-800 tracking-tight">
                      {row.assigned_coupon ? (
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{row.assigned_coupon}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}