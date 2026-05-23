'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import QRCode from 'qrcode';

export default function WorkerDashboard() {
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [activeLanding, setActiveLanding] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState({ sales: 0, comm: 0 });
  const [loading, setLoading] = useState(true);

  // 1. PRIMER USEEFFECT: Carga de sesión, autenticación y datos de Supabase (INTACTO)
  useEffect(() => {
    const workerId = localStorage.getItem('worker_id');
    const userRole = localStorage.getItem('user_role');

    if (!workerId || userRole !== 'worker') {
      router.push('/login');
      return;
    }

    async function loadDashboardData() {
      try {
        setLoading(true);
        
        // 1. Cargar Perfil del Trabajador
        const { data: empData } = await supabase
          .from('employees')
          .select('*')
          .eq('id_employee', workerId)
          .single();
        if (empData) setEmployee(empData);

        // 2. Cargar Landing Activa de José
        const { data: promoData } = await supabase
          .from('promotions')
          .select('image_url')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (promoData) setActiveLanding(promoData.image_url);

        // 3. Cargar Clientes y Stats
        const { data: custData } = await supabase
          .from('customers')
          .select('*')
          .eq('worker_id', workerId)
          .order('registration_date', { ascending: false });

        if (custData) {
          setCustomers(custData);
          const totalComm = custData.reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0);
          setStats({ sales: custData.length, comm: totalComm });
        }
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  // 2. SEGUNDO USEEFFECT: Generación del Código QR con el logotipo en el centro (CORREGIDO)
  useEffect(() => {
    if (!employee) return;

    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const promotionLink = `${window.location.origin}/promotion?code=${employee.emp_code}&source=qr`;
      
      // Se añade errorCorrectionLevel: 'H' para recuperar datos al tapar el centro con el logo
      QRCode.toCanvas(canvas, promotionLink, { 
        width: 220, 
        margin: 2,
        errorCorrectionLevel: 'H' 
      }, (error: any) => { // ✅ CORREGIDO: Se añade explícitamente el tipo ': any' para evitar el error 7006
        if (error) {
          console.error("Error generando el QR:", error);
          return;
        }

        // Proceso de dibujo del logo en el Canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const logo = new Image();
          logo.src = '/energiecheck.png'; // Ruta del archivo logo.png en /public
          
          logo.onload = () => {
            const logoSize = 45; // Tamaño del logotipo central
            const x = (canvas.width - logoSize) / 2;
            const y = (canvas.height - logoSize) / 2;
            
            // Cuadrado blanco de fondo para aislar el diseño del logo de los módulos negros
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(x - 3, y - 3, logoSize + 6, logoSize + 6);
            
            // Renderizado final del logo de la empresa
            ctx.drawImage(logo, x, y, logoSize, logoSize);
          };
        }
      });
    }
  }, [employee]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold">
        Laden...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Encabezado */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center border-b border-[#BCBE32] pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#BCBE32]">
            MITARBEITER PORTAL
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Willkommen zurück, <span className="text-white font-semibold">{employee?.first_name} {employee?.last_name}</span>
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-600 text-white font-bold px-5 py-2.结尾 rounded-full text-sm hover:bg-red-700 transition-all shadow-md self-end sm:self-center"
        >
          Abmelden
        </button>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: QR y Estadísticas */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Tarjeta del Código QR Único */}
          <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 text-center flex flex-col items-center shadow-lg">
            <h3 className="text-[#BCBE32] font-bold text-lg uppercase mb-2 tracking-wide">Dein QR-Code</h3>
            <p className="text-xs text-gray-400 mb-6">Kunden scannen diesen Code, um sich unter dir zu registrieren.</p>
            
            <div className="bg-white p-3 rounded-xl inline-block shadow-inner">
              <canvas id="qr-canvas"></canvas>
            </div>

            <div className="mt-6 bg-[#1A1A1A] px-4 py-2 rounded-lg border border-gray-850 w-full">
              <span className="text-xs text-gray-400 block uppercase font-mono">Code:</span>
              <strong className="text-white text-base tracking-widest font-mono">{employee?.emp_code}</strong>
            </div>
          </div>

          {/* Tarjeta de Estadísticas de Rendimiento */}
          <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-white font-bold text-lg mb-4 tracking-wide uppercase border-b border-gray-850 pb-2">Deine Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1A1A1A] p-4 rounded-xl border border-gray-850 text-center">
                <span className="text-xs text-gray-400 block uppercase">Kunden</span>
                <strong className="text-2xl font-black text-[#BCBE32] block mt-1">{stats.sales}</strong>
              </div>
              <div className="bg-[#1A1A1A] p-4 rounded-xl border border-gray-850 text-center">
                <span className="text-xs text-gray-400 block uppercase">Provision</span>
                <strong className="text-2xl font-black text-green-400 block mt-1">€{stats.comm}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Clientes Registrados y Landing Activa */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Vista de la Campaña / Landing Activa asignada por José */}
          {activeLanding && (
            <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-white font-bold text-lg mb-3 tracking-wide uppercase">Aktuelle Kampagne</h3>
              <div className="rounded-xl overflow-hidden border border-gray-850 max-h-60 bg-black flex items-center justify-center">
                <img 
                  src={activeLanding} 
                  alt="Aktuelle Promotion" 
                  className="w-full h-full object-cover max-h-60"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Tabla de Control de Clientes Adquiridos */}
          <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 shadow-lg flex-1">
            <h3 className="text-white font-bold text-lg mb-4 tracking-wide uppercase border-b border-gray-850 pb-2">Registrierte Kunden</h3>
            {customers.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm italic">
                Noch keine Kunden registriert.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-2">Name</th>
                      <th className="py-3 px-2">E-Mail</th>
                      <th className="py-3 px-2">Datum</th>
                      <th className="py-3 px-2 text-right">Provision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-850 text-sm">
                    {customers.map((c: any) => (
                      <tr key={c.id_customer} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="py-3 px-2 font-medium text-white">{c.first_name} {c.last_name}</td>
                        <td className="py-3 px-2 text-gray-300 font-mono text-xs">{c.email}</td>
                        <td className="py-3 px-2 text-gray-400 text-xs">
                          {new Date(c.registration_date).toLocaleDateString('de-DE')}
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-green-400">
                          €{Number(c.commission_earned || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}