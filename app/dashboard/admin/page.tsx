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
  const [customers, setCustomers] = useState<any[]>([]);
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
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'admin') { router.push('/login'); return; }
    loadAdminData();
    
    const channel = supabase.channel('admin_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_funnel_logs' }, () => loadAdminData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);

  async function loadAdminData() {
    try {
      const { data: emps } = await supabase.from('employees').select('*').order('full_name');
      const { data: ords } = await supabase.from('orders').select('*');
      const { data: custs } = await supabase.from('customers').select('id');
      const { data: logs } = await supabase.from('user_funnel_logs').select('*').order('created_at', { ascending: false }).limit(50);
      
      if (emps) setEmployees(emps);
      if (ords) setOrders(ords);
      if (custs) setCustomers(custs);
      if (logs) setFunnelLogs(logs);
    } catch (err) { 
      console.error("Error cargando datos del administrador:", err); 
    } finally { 
      setLoading(false); 
    }
  }

  const handleUploadLanding = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `landing_${Date.now()}.${fileExt}`;

    try {
      const { error: storageError } = await supabase.storage.from('promotions').upload(fileName, file);
      if (storageError) throw storageError;
      
      await supabase.from('promotions').update({ is_active: false }).eq('is_active', true);

      const { error: dbError } = await supabase.from('promotions').insert([{ 
        title: "Nueva Promo Global", 
        image_url: fileName, 
        is_active: true
      }]);

      if (dbError) throw dbError;
      alert("Landing aktualisiert!");
    } catch (error: any) { 
      alert("Error: " + error.message); 
    } finally { 
      setUploading(false); 
    }
  };

  const handleFileUpload = async (e: any) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage.from('avatars').upload(fileName, file);
      if (error) throw error;
      setFormData({ ...formData, photo_url: fileName });
    } catch (err: any) { 
      alert("Upload error: " + err.message); 
    } finally { 
      setUploading(false); 
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      await supabase.from('employees').update(formData).eq('id', selectedDbId);
    } else {
      await supabase.from('employees').insert([formData]);
      try {
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            fullName: formData.full_name,
            username: formData.username,
            password: formData.password
          })
        });
      } catch (err) { 
        console.error("Error al enviar correo de bienvenida:", err); 
      }
    }
    setIsModalOpen(false);
    resetForm();
    loadAdminData();
  };

  const handleMarkAsPaid = async (workerId: string) => {
    if (!confirm(`Möchtest du alle offenen Provisionen für diesen Mitarbeiter als bezahlt markieren?`)) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ commission_status: 'paid' })
        .eq('worker_id', workerId)
        .eq('commission_status', 'pending');
      
      if (error) throw error;
      loadAdminData();
    } catch (err: any) {
      alert("Error al procesar el pago: " + err.message);
    }
  };

  const resetForm = () => {
    setFormData({ id_employee: '', full_name: '', email: '', username: '', password: '', photo_url: '', role: 'worker' });
    setIsEditMode(false); setSelectedDbId(null);
  };

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic">LADEN...</div>;

  const totalUmsatz = (orders || []).reduce((acc, o) => acc + (Number(o?.purchase_amount) || 0), 0);
  const pendingComm = (orders || []).filter(o => o?.commission_status === 'pending').reduce((acc, o) => acc + (Number(o?.commission_earned) || 0), 0);
  const paidComm = (orders || []).filter(o => o?.commission_status === 'paid').reduce((acc, o) => acc + (Number(o?.commission_earned) || 0), 0);

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col md:flex-row text-left font-sans">
      
      {/* SIDEBAR NAVEGACIÓN - RESPONSIVO */}
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 bg-black/40 backdrop-blur-2xl p-6 md:p-8 flex flex-row md:flex-col justify-between sticky top-0 h-auto md:h-screen z-40">
        <div>
          <div className="flex items-center gap-3 mb-0 md:mb-12">
            <div className="w-3 h-3 bg-[#d4e137] rounded-full animate-pulse" />
            <h1 className="text-base md:text-xl font-black italic tracking-tighter uppercase">EnergieCheck V2</h1>
          </div>
          <nav className="hidden md:block mt-6">
            <button className="w-full flex items-center gap-4 px-5 py-4 bg-white/5 border border-white/10 text-[#d4e137] font-bold rounded-2xl transition-all">
              <LayoutDashboard size={18} /> Admin Dashboard
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4 md:flex-col md:w-full md:items-stretch">
          <div className="hidden md:block p-4 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Promotionsbanner</p>
            <label className="flex items-center justify-center gap-2 w-full p-3 bg-black/40 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[#d4e137] transition-all text-xs font-mono text-gray-400">
              <Upload size={14} />
              {uploading ? "Hochladen..." : "Bild ändern"}
              <input type="file" accept="image/*" onChange={handleUploadLanding} className="hidden" />
            </label>
          </div>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-red-400 hover:text-white bg-red-500/10 md:bg-transparent border border-red-500/20 md:border-none p-3 md:p-0 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase">
            <LogOut size={14} /> <span>Abmelden</span>
          </button>
        </div>
      </aside>

      {/* CUERPO DEL CONTENIDO */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-auto md:h-screen space-y-8 w-full max-w-full">
        
        {/* HEADER RESPONSIVO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 w-full">
          <div>
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight">Systemverwaltung</h2>
            <p className="text-gray-500 text-xs font-mono mt-1">Willkommen zurück, Administrator José.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 md:px-6 md:py-4 bg-[#d4e137] text-black font-black uppercase italic rounded-2xl hover:bg-[#c2cf2e] transition-all text-xs shadow-[0_0_30px_rgba(212,225,55,0.2)]"
          >
            <UserPlus size={16} /> Mitarbeiter anlegen
          </button>
        </div>

        {/* METRICAS PRINCIPALES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
            <Users className="text-purple-400 mb-2" size={18} />
            <p className="text-gray-500 text-[8px] font-bold uppercase">Registrierte Kunden</p>
            <h2 className="text-xl font-black italic">{customers.length}</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
            <BarChart3 className="text-[#d4e137] mb-2" size={18} />
            <p className="text-gray-500 text-[8px] font-bold uppercase">Umsatz</p>
            <h2 className="text-xl font-black italic">{totalUmsatz.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
            <Clock className="text-orange-500 mb-2" size={18} />
            <p className="text-gray-500 text-[8px] font-bold uppercase">Offen</p>
            <h2 className="text-xl font-black italic">{pendingComm.toLocaleString('de-DE')} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
            <Wallet className="text-blue-400 mb-2" size={18} />
            <p className="text-gray-500 text-[8px] font-bold uppercase">Bezahlt</p>
            <h2 className="text-xl font-black italic">{paidComm.toLocaleString('de-DE')} €</h2>
          </div>
        </div>

        {/* LIVE FUNNEL TRACKER CORREGIDO */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6">
          <div className="flex items-center gap-3 mb-6"><Activity className="text-purple-400 animate-pulse" size={20} /><h3 className="text-lg font-black italic uppercase">Live Funnel Tracker</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {funnelLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="bg-black/40 border border-white/5 p-4 rounded-3xl flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] text-[#d4e137] font-bold uppercase tracking-wider">[{log.worker_id || 'SYSTEM'}]</span>
                  <span className="text-[9px] text-gray-600 font-mono">{log.created_at ? new Date(log.created_at).toLocaleTimeString('de-DE') : ''}</span>
                </div>
                <p className="text-[11px] font-black text-white uppercase italic truncate">{log.current_step || 'Aktion Start'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN ACTUALIZAR IMAGEN EN CELULAR */}
        <div className="block md:hidden bg-white/5 p-6 rounded-[2rem] border border-white/10">
          <h3 className="text-xs font-black italic uppercase mb-3 text-orange-500">Landingpage-Bild aktualisieren</h3>
          <label className="flex items-center justify-center gap-2 w-full p-3 bg-black/40 border border-dashed border-white/20 rounded-xl cursor-pointer text-xs text-gray-400">
            <Upload size={14} /> {uploading ? 'Hochladen...' : 'Datei auswählen'}
            <input type="file" accept="image/*" onChange={handleUploadLanding} className="hidden" />
          </label>
        </div>

        {/* LISTADO DE TRABAJADORES (TARJETAS TOTALMENTE CLICKEABLES) */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black italic uppercase">Mitarbeiter</h3>
              <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-[#d4e137] text-black p-1.5 rounded-full"><UserPlus size={16} /></button>
            </div>
            <input type="text" placeholder="Suchen..." className="w-full sm:w-64 bg-black/20 border border-white/5 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-[#d4e137]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {employees.filter(e => e.full_name.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => {
              const empPending = (orders || []).filter(o => o.worker_id === emp.id_employee && o.commission_status === 'pending').reduce((acc, o) => acc + (Number(o.commission_earned) || 0), 0);
              const empSales = (orders || []).filter(o => o.worker_id === emp.id_employee).reduce((acc, o) => acc + (Number(o.purchase_amount) || 0), 0);

              return (
                <div 
                  key={emp.id} 
                  onClick={() => router.push(`/dashboard/admin/employee/${emp.id_employee}`)}
                  className="p-5 bg-black/40 rounded-[2rem] border border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 group transition-all hover:bg-white/5 hover:border-white/10 cursor-pointer w-full min-w-0"
                >
                  <div className="flex items-center gap-4 w-full min-w-0">
                    <div className="w-12 h-12 rounded-full bg-orange-600 flex-shrink-0 overflow-hidden border border-white/10">
                      {emp.photo_url ? <img src={STORAGE_URL + emp.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black italic text-xs">{emp.full_name[0]}</div>}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-black text-sm uppercase italic group-hover:text-[#d4e137] transition-colors truncate">{emp.full_name}</p>
                      <p className="text-[9px] text-gray-500 font-mono tracking-tighter truncate">ID: {emp.id_employee}</p>
                      {/* SOLUCIÓN CORREO LARGO: break-all y text-gray-400 para evitar desborde */}
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5 break-all sm:truncate max-w-full">{emp.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-row items-center justify-between lg:justify-end gap-4 w-full lg:w-auto pt-3 lg:pt-0 border-t border-white/5 lg:border-none font-mono text-xs">
                    <div className="text-left lg:text-right">
                      <p className="text-[8px] text-gray-500 uppercase font-sans font-bold">Volumen / Offen</p>
                      <p className="text-xs font-bold text-gray-300">{empSales.toLocaleString('de-DE')} € / <span className="text-orange-500">{empPending.toLocaleString('de-DE')} €</span></p>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {empPending > 0 && (
                        <button 
                          onClick={() => handleMarkAsPaid(emp.id_employee)} 
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-500 text-black font-bold uppercase text-[9px] rounded-xl hover:bg-orange-400 transition-all shadow-md"
                        >
                          <CheckSquare size={11} /> Bezahlen
                        </button>
                      )}
                      <button onClick={() => { setFormData(emp); setSelectedDbId(emp.id); setIsEditMode(true); setIsModalOpen(true); }} className="p-2.5 bg-white/5 text-blue-400 rounded-xl hover:bg-white/10"><Edit3 size={12} /></button>
                      <button onClick={async () => { if(confirm(`Löschen?`)) { await supabase.from('employees').delete().eq('id', emp.id); loadAdminData(); } }} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20"><Trash2 size={12} /></button>
                      <button onClick={() => router.push(`/dashboard/admin/employee/${emp.id_employee}`)} className="p-2.5 bg-white/5 text-gray-500 rounded-xl group-hover:text-white"><ChevronRight size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* MODAL CORREGIDO - CON CARGA DE IMAGEN MULTIMEDIA DISPONIBLE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0f1115] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 relative overflow-y-auto max-h-[95vh]">
            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><X size={20}/></button>
            <h3 className="text-xl font-black italic uppercase mb-6 text-[#d4e137]">{isEditMode ? 'Mitarbeiter Bearbeiten' : 'Mitarbeiter Anlegen'}</h3>
            
            <form onSubmit={handleSave} className="space-y-4 text-xs">
             {/* ZONA DE CONTROL DE CARGA FOTOGRÁFICA INTERACTIVA COMPLETA */}
<label className="cursor-pointer w-full group flex flex-col items-center gap-3 bg-black/20 p-6 rounded-2xl border border-white/5 hover:border-[#d4e137] transition-all">
  <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 group-hover:border-[#d4e137] flex items-center justify-center overflow-hidden transition-all">
    {formData.photo_url ? (
      <img src={STORAGE_URL + formData.photo_url} className="w-full h-full object-cover" />
    ) : (
      <Upload className="text-gray-500 group-hover:text-[#d4e137] transition-all" size={18} />
    )}
  </div>
  <span className="bg-white/5 group-hover:bg-[#d4e137] group-hover:text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all tracking-wider text-gray-300">
    {uploading ? 'Lädt...' : 'Foto hochladen'}
  </span>
  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
</label>
              <div>
                <label className="text-gray-500 text-[9px] font-bold uppercase font-mono block mb-1">Mitarbeiter-ID (Z.B. HN121285)</label>
                <input required type="text" placeholder="ID" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:border-[#d4e137] outline-none font-mono" value={formData.id_employee} onChange={e => setFormData({...formData, id_employee: e.target.value})} />
              </div>
              <div>
                <label className="text-gray-500 text-[9px] font-bold uppercase font-mono block mb-1">Vollständiger Name</label>
                <input required type="text" placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:border-[#d4e137] outline-none" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div>
                <label className="text-gray-500 text-[9px] font-bold uppercase font-mono block mb-1">E-Mail-Adresse</label>
                <input required type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:border-[#d4e137] outline-none font-mono" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="text-gray-500 text-[9px] font-bold uppercase font-mono block mb-1">Benutzername</label>
                <input required type="text" placeholder="User" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:border-[#d4e137] outline-none font-mono" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div>
                <label className="text-gray-500 text-[9px] font-bold uppercase font-mono block mb-1">Passwort</label>
                <input required type="text" placeholder="Pass" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:border-[#d4e137] outline-none font-mono" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              
              <button type="submit" className="w-full py-4 bg-[#d4e137] text-black font-black rounded-xl uppercase italic tracking-wider transition-all hover:bg-[#c2cf2e] active:scale-[0.98] mt-2">
                {isEditMode ? 'Speichern' : 'Mitarbeiter erstellen'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}