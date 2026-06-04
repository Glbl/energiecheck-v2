"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Users, Wallet, BarChart3, Clock, LayoutDashboard, 
  LogOut, Search, ChevronRight, Trash2, UserPlus, X, Edit3, Activity, Upload, CheckSquare
} from 'lucide-react';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]); // 👈 Agregado para contar los clientes globales
  const [funnelLogs, setFunnelLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDbId, setSelectedDbId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [promoImage, setPromoImage] = useState<File | null>(null);
  const router = useRouter();

  const STORAGE_URL = "https://hoigzuytnzlkypkruyom.supabase.co/storage/v1/object/public/avatars/";

  const [formData, setFormData] = useState({
    id_employee: '',
    full_name: '',
    email: '',
    username: '',
    password: '',
    photo_url: '',
    role: 'worker'
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    try {
      // 1. Cargar empleados
      const { data: empData } = await supabase.from('employees').select('*').order('full_name', { ascending: true });
      if (empData) setEmployees(empData);

      // 2. Cargar todas las órdenes
      const { data: ordData } = await supabase.from('orders').select('*');
      if (ordData) setOrders(ordData);

      // 3. Cargar todos los clientes (para el nuevo contador global de José)
      const { data: custData } = await supabase.from('customers').select('id');
      if (custData) setCustomers(custData);

      // 4. Cargar logs de conversión/embudo
      const { data: logs } = await supabase.from('funnel_logs').select('*').order('created_at', { ascending: false }).limit(50);
      if (logs) setFunnelLogs(logs);

    } catch (err) {
      console.error("Fehler beim Laden:", err);
    } finally {
      setLoading(false);
    }
  }

  // CÁLCULOS PARA LAS TARJETAS INFORMATIVAS
  const globalSales = (orders || []).reduce((acc, o) => acc + (Number(o.purchase_amount) || 0), 0);
  const globalPending = (orders || []).filter(o => o.commission_status === 'pending').reduce((acc, o) => acc + (Number(o.commission_earned) || 0), 0);
  const globalPaid = (orders || []).filter(o => o.commission_status === 'paid').reduce((acc, o) => acc + (Number(o.commission_earned) || 0), 0);

  // MANEJO DE IMAGEN PROMOCIONAL
  async function handlePromoImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setPromoImage(file);
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-promo.${fileExt}`;
      const filePath = `promotions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      alert("Promotionsbanner erfolgreich aktualisiert!");
    } catch (err: any) {
      alert("Fehler beim Hochladen: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  // ACCIÓN PARA MARCAR COMISIONES COMO PAGADAS DESDE EL PANEL
  async function handleMarkAsPaid(workerId: string) {
    if (!confirm(`Möchten Sie alle offenen Provisionen für ${workerId} als bezahlt markieren?`)) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ commission_status: 'paid' })
        .eq('worker_id', workerId)
        .eq('commission_status', 'pending');

      if (error) throw error;
      alert("Provisionen erfolgreich als bezahlt markiert.");
      loadAdminData();
    } catch (err: any) {
      alert("Fehler: " + err.message);
    }
  }

  // GUARDAR / ACTUALIZAR TRABAJADORES
  async function handleSaveEmployee(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEditMode && selectedDbId) {
        const { error } = await supabase
          .from('employees')
          .update({
            id_employee: formData.id_employee,
            full_name: formData.full_name,
            email: formData.email,
            username: formData.username,
            password: formData.password,
            photo_url: formData.photo_url
          })
          .eq('id', selectedDbId);

        if (error) throw error;
        alert("Mitarbeiter aktualisiert!");
      } else {
        const { error } = await supabase
          .from('employees')
          .insert([formData]);

        if (error) throw error;
        alert("Mitarbeiter hinzugefügt!");
      }
      setIsModalOpen(false);
      setFormData({ id_employee: '', full_name: '', email: '', username: '', password: '', photo_url: '', role: 'worker' });
      loadAdminData();
    } catch (err: any) {
      alert("Fehler: " + err.message);
    }
  }

  // FILTRADO DE BUSQUEDA
  const filteredEmployees = employees.filter(emp =>
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id_employee?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen bg-[#05070a] text-white flex justify-center items-center font-mono">Admin-Panel wird geladen...</div>;
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex text-left font-sans">
      
      {/* SIDEBAR ASIDE */}
      <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-2xl p-8 flex flex-col justify-between sticky top-0 h-screen z-40">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-4 h-4 bg-[#d4e137] rounded-full animate-pulse" />
            <h1 className="text-xl font-black italic tracking-tighter uppercase">EnergieCheck V2</h1>
          </div>
          
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-4 px-5 py-4 bg-white/5 border border-white/10 text-[#d4e137] font-bold rounded-2xl transition-all">
              <LayoutDashboard size={18} />
              Admin Dashboard
            </button>
          </nav>
        </div>

        <div>
          {/* CONTROL DE BANNER PROMOCIONAL DESDE EL SIDEBAR */}
          <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Promotionsbanner</p>
            <label className="flex items-center justify-center gap-2 w-full p-3 bg-black/40 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[#d4e137] transition-all text-xs font-mono text-gray-400">
              <Upload size={14} />
              {uploading ? "Hochladen..." : "Bild ändern"}
              <input type="file" accept="image/*" onChange={handlePromoImageUpload} className="hidden" />
            </label>
          </div>

          <button onClick={() => router.push('/login')} className="w-full flex items-center gap-4 px-5 py-4 bg-red-500/10 text-red-400 font-bold rounded-2xl hover:bg-red-500/20 transition-all border border-red-500/10">
            <LogOut size={18} />
            Abmelden
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-12 overflow-y-auto h-screen">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tight">Systemverwaltung</h2>
            <p className="text-gray-500 text-sm font-mono mt-1">Willkommen zurück, Administrator José.</p>
          </div>
          <button 
            onClick={() => { setIsEditMode(false); setSelectedDbId(null); setFormData({ id_employee: '', full_name: '', email: '', username: '', password: '', photo_url: '', role: 'worker' }); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-4 bg-[#d4e137] text-black font-black uppercase italic rounded-2xl hover:bg-[#c2cf2e] transition-all shadow-[0_0_30px_rgba(212,225,55,0.2)]"
          >
            <UserPlus size={18} /> Mitarbeiter anlegen
          </button>
        </div>

        {/* METRICAS PRINCIPALES (AQUÍ SE CAMBIÓ LA PRIMERA TARJETA) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4e137]/10 rounded-full blur-3xl group-hover:bg-[#d4e137]/20 transition-all" />
            <Users className="text-[#d4e137] mb-4" size={24} />
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Registrierte Kunden</p>
            <h2 className="text-4xl font-black italic mt-1 tracking-tighter">{customers.length}</h2>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem]">
            <BarChart3 className="text-blue-400 mb-4" size={24} />
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Gesamtumsatz</p>
            <h2 className="text-4xl font-black italic mt-1 tracking-tighter">{globalSales.toLocaleString('de-DE')} €</h2>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-[2rem]">
            <Clock className="text-orange-500 mb-4" size={24} />
            <p className="text-orange-500/70 text-[10px] font-bold uppercase tracking-wider">Offene Provisionen</p>
            <h2 className="text-4xl font-black italic mt-1 tracking-tighter text-orange-500">{globalPending.toLocaleString('de-DE')} €</h2>
          </div>

          <div className="bg-[#d4e137]/10 border border-[#d4e137]/20 p-8 rounded-[2rem]">
            <Wallet className="text-[#d4e137] mb-4" size={24} />
            <p className="text-[#d4e137]/70 text-[10px] font-bold uppercase tracking-wider">Gezahlte Provisionen</p>
            <h2 className="text-4xl font-black italic mt-1 tracking-tighter text-[#d4e137]">{globalPaid.toLocaleString('de-DE')} €</h2>
          </div>
        </div>

        {/* BUSCADOR Y TABLA DE TRABAJADORES */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h3 className="text-2xl font-black uppercase italic tracking-tight">Mitarbeiterliste</h3>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Mitarbeiter suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4e137] transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredEmployees.map((emp) => {
              const empOrders = orders.filter(o => o.worker_id === emp.id_employee);
              const empSales = empOrders.reduce((acc, o) => acc + (Number(o.purchase_amount) || 0), 0);
              const empPending = empOrders.filter(o => o.commission_status === 'pending').reduce((acc, o) => acc + (Number(o.commission_earned) || 0), 0);

              return (
                <div key={emp.id} className="p-6 bg-black/40 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5">
                      <img 
                        src={emp.photo_url ? `${STORAGE_URL}${emp.photo_url}` : `https://ui-avatars.com/api/?name=${emp.full_name}&background=d4e137&color=black`} 
                        alt="" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{emp.full_name}</h4>
                      <p className="text-xs text-gray-500 font-mono uppercase">{emp.id_employee} • {emp.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right font-mono">
                      <p className="text-xs text-gray-500 uppercase font-sans font-bold">Volumen / Offen</p>
                      <p className="text-sm font-bold text-gray-300">{empSales.toLocaleString('de-DE')} € / <span className="text-orange-500">{empPending.toLocaleString('de-DE')} €</span></p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {/* 💰 BOTÓN DE PAGO OPERATIVO EN VIVO */}
                      {empPending > 0 && (
                        <button 
                          onClick={() => handleMarkAsPaid(emp.id_employee)} 
                          className="flex items-center gap-1 px-3 py-2 bg-orange-500 text-black font-bold uppercase text-[9px] rounded-xl hover:bg-orange-400 transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                        >
                          <CheckSquare size={12} /> {empPending.toLocaleString('de-DE')} € Bezahlen
                        </button>
                      )}

                      <button onClick={() => { setFormData(emp); setSelectedDbId(emp.id); setIsEditMode(true); setIsModalOpen(true); }} className="p-3 bg-white/5 text-blue-400 rounded-xl hover:bg-white/10 transition-all"><Edit3 size={14} /></button>
                      <button onClick={async () => { if(confirm(`Löschen?`)) { await supabase.from('employees').delete().eq('id', emp.id); loadAdminData(); } }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"><Trash2 size={14} /></button>
                      <button onClick={() => router.push(`/dashboard/admin/employee/${emp.id_employee}`)} className="p-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-all"><ChevronRight size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LOGS DE ACTIVIDAD DEL EMBUDO (FUNNEL) */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="text-purple-400" size={20} />
            <h3 className="text-2xl font-black uppercase italic tracking-tight">Live Funnel Tracker</h3>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 font-mono text-xs">
            {funnelLogs.map((log) => (
              <div key={log.id} className="p-4 bg-black/20 rounded-xl border border-white/5 flex justify-between items-center text-gray-400">
                <div>
                  <span className="text-[#d4e137] font-bold">[{log.step?.toUpperCase()}]</span> {log.message}
                </div>
                <span className="text-[10px] text-gray-600">{log.created_at ? new Date(log.created_at).toLocaleTimeString() : ''}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* MODAL PARA CREAR / EDITAR MITARBEITER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-[#0b0e14] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white rounded-full bg-white/5">
              <X size={16} />
            </button>

            <h3 className="text-2xl font-black uppercase italic mb-6">
              {isEditMode ? "Mitarbeiter bearbeiten" : "Mitarbeiter anlegen"}
            </h3>

            <form onSubmit={handleSaveEmployee} className="space-y-4 font-mono text-sm">
              <div>
                <label className="text-gray-500 text-[10px] font-bold uppercase block mb-1">Mitarbeiter-ID (Z.B. HN121285)</label>
                <input required type="text" value={formData.id_employee} onChange={(e) => setFormData({...formData, id_employee: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 focus:outline-none focus:border-[#d4e137] text-white" />
              </div>
              <div>
                <label className="text-gray-500 text-[10px] font-bold uppercase block mb-1">Vollständiger Name</label>
                <input required type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 focus:outline-none focus:border-[#d4e137] text-white" />
              </div>
              <div>
                <label className="text-gray-500 text-[10px] font-bold uppercase block mb-1">E-Mail-Adresse</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 focus:outline-none focus:border-[#d4e137] text-white" />
              </div>
              <div>
                <label className="text-gray-500 text-[10px] font-bold uppercase block mb-1">Benutzername</label>
                <input required type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 focus:outline-none focus:border-[#d4e137] text-white" />
              </div>
              <div>
                <label className="text-gray-500 text-[10px] font-bold uppercase block mb-1">Passwort</label>
                <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 focus:outline-none focus:border-[#d4e137] text-white" />
              </div>
              <div>
                <label className="text-gray-500 text-[10px] font-bold uppercase block mb-1">Foto Dateiname (Z.B. avatar1.png)</label>
                <input type="text" value={formData.photo_url} onChange={(e) => setFormData({...formData, photo_url: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl p-3 focus:outline-none focus:border-[#d4e137] text-white" placeholder="Optional" />
              </div>

              <button type="submit" className="w-full py-4 bg-[#d4e137] text-black font-black uppercase italic rounded-xl hover:bg-[#c2cf2e] transition-all pt-4">
                {isEditMode ? "Änderungen speichern" : "Mitarbeiter Erstellen"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}