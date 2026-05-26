"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Users, Wallet, BarChart3, Clock, LayoutDashboard, 
  LogOut, Search, ChevronRight, Trash2, UserPlus, X, Edit3, Activity, Upload 
} from 'lucide-react';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
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
    id_employee: '', full_name: '', email: '', username: '', password: '', photo_url: '', role: 'worker'
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
      const { data: custs } = await supabase.from('customers').select('*');
      const { data: logs } = await supabase.from('user_funnel_logs').select('*').order('created_at', { ascending: false }).limit(6);
      if (emps) setEmployees(emps);
      if (custs) setCustomers(custs);
      if (logs) setFunnelLogs(logs);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  // FUNCIÓN PARA ACTUALIZAR IMAGEN DE LANDING (GLOBAL)
  const handleUploadLanding = async () => {
    if (!promoImage) {
      alert("Selecciona una imagen primero");
      return;
    }

    setUploading(true);
    const fileExt = promoImage.name.split('.').pop();
    const fileName = `landing_${Date.now()}.${fileExt}`;

    try {
      // 1. Subir al Storage (Bucket 'promotions')
      const { error: storageError } = await supabase.storage
        .from('promotions')
        .upload(fileName, promoImage);

      if (storageError) throw storageError;

      // 2. Desactivar promos anteriores
      await supabase.from('promotions').update({ is_active: false }).eq('is_active', true);

      // 3. Insertar nueva promo activa
      const { error: dbError } = await supabase.from('promotions').insert([{ 
        title: "Nueva Promo Global", 
        image_url: fileName,
        is_active: true
      }]);

      if (dbError) throw dbError;

      alert("Landing actualizada para todos los trabajadores");
      setPromoImage(null);
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error } = await supabase.storage.from('avatars').upload(fileName, file);
      if (error) throw error;
      setFormData({ ...formData, photo_url: fileName });
    } catch (err: any) { alert("Upload error: " + err.message); } finally { setUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
   // ✅ REEMPLAZA TU BLOQUE DE GUARDADO ACTUAL POR ESTE CORREGIDO:
if (isEditMode) {
  const { error } = await supabase
    .from('employees')
    .update({
      id_employee: formData.id_employee,
      full_name: formData.full_name,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      photo_url: formData.photo_url,
      role: formData.role
    })
    .eq('id', selectedDbId);
  if (error) { alert(error.message); return; }
} else {
  const { error } = await supabase
    .from('employees')
    .insert([{
      id_employee: formData.id_employee,
      full_name: formData.full_name,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      photo_url: formData.photo_url,
      role: formData.role
    }]);
  if (error) { alert(error.message); return; }
  // 📧 DISPARADOR DE RESEND: Se ejecuta solo si la inserción en Supabase fue exitosa
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
    console.log("Petición de correo enviada a Resend con éxito.");
  } catch (mailErr) {
    console.error("Error llamando a la API de correos:", mailErr);
  }
}
  }
setIsModalOpen(false);
loadAdminData();

  const resetForm = () => {
    setFormData({ id_employee: '', full_name: '', email: '', username: '', password: '', photo_url: '', role: 'worker' });
    setIsEditMode(false); setSelectedDbId(null);
  };

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic">LADEN...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left pb-20">
      
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0f1115] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 relative overflow-y-auto max-h-[95vh]">
            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="absolute top-6 right-6 text-gray-500"><X size={24}/></button>
            <h3 className="text-xl font-black italic uppercase mb-6 text-[#d4e137]">{isEditMode ? 'Bearbeiten' : 'Neu'}</h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                  {formData.photo_url ? <img src={STORAGE_URL + formData.photo_url} className="w-full h-full object-cover" /> : <Upload className="text-gray-600" />}
                </div>
                <label className="cursor-pointer bg-white/5 px-4 py-2 rounded-lg text-[10px] font-bold uppercase">
                  {uploading ? 'Lädt...' : 'Foto hochladen'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
              <input type="text" placeholder="ID" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs" value={formData.id_employee} onChange={e => setFormData({...formData, id_employee: e.target.value})} />
              <input type="text" placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="text" placeholder="User" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              <input type="text" placeholder="Pass" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              <button type="submit" className="w-full py-4 bg-[#d4e137] text-black font-black rounded-xl uppercase italic">Speichern</button>
            </form>
          </div>
        </div>
      )}

      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg rotate-3"><LayoutDashboard className="text-black" size={20} /></div>
          <h1 className="text-lg font-black italic uppercase tracking-tighter">Admin Panel</h1>
        </div>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 hover:text-white flex items-center gap-2 text-[10px] font-bold uppercase"><LogOut size={14} /> <span className="hidden md:inline">Abmelden</span></button>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-10 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
            <BarChart3 className="text-[#d4e137] mb-2" size={18} />
            <p className="text-gray-500 text-[8px] font-bold uppercase">Umsatz</p>
            <h2 className="text-xl font-black italic">{customers.reduce((acc, c) => acc + (Number(c.purchase_amount) || 0), 0).toLocaleString()} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
            <Clock className="text-orange-500 mb-2" size={18} />
            <p className="text-gray-500 text-[8px] font-bold uppercase">Offen</p>
            <h2 className="text-xl font-black italic">{customers.filter(c => c.commission_status === 'pending').reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0).toLocaleString()} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
            <Wallet className="text-blue-400 mb-2" size={18} />
            <p className="text-gray-500 text-[8px] font-bold uppercase">Bezahlt</p>
            <h2 className="text-xl font-black italic">{customers.filter(c => c.commission_status === 'paid').reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0).toLocaleString()} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem]">
            <Users className="text-purple-400 mb-2" size={18} />
            <p className="text-gray-500 text-[8px] font-bold uppercase">Team</p>
            <h2 className="text-xl font-black italic">{employees.length}</h2>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6">
          <div className="flex items-center gap-3 mb-6"><Activity className="text-orange-500 animate-pulse" size={20} /><h3 className="text-lg font-black italic uppercase">Live Funnel</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {funnelLogs.map((log) => (
              <div key={log.id} className="bg-black/40 border border-white/5 p-4 rounded-3xl">
                <div className="flex justify-between mb-2"><span className="text-[8px] text-orange-500 font-bold uppercase">{log.worker_id}</span></div>
                <p className="text-[10px] font-bold text-white uppercase italic">{log.current_step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN ACTUALIZAR LANDING */}
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
          <h3 className="text-lg font-black italic uppercase mb-4 text-orange-500">Landingpage-Bild aktualisieren</h3>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setPromoImage(e.target.files?.[0] || null)} 
              className="text-xs file:bg-white/10 file:border-none file:text-white file:px-4 file:py-2 file:rounded-lg file:mr-4" 
            />
            <button 
              onClick={handleUploadLanding} 
              disabled={uploading}
              className={`${uploading ? 'bg-gray-600' : 'bg-orange-600'} px-6 py-3 rounded-xl font-bold uppercase text-xs transition-all active:scale-95 disabled:opacity-50`}
            >
              {uploading ? 'Lädt...' : 'Subir y Aplicar'}
            </button>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-4 w-full"><h3 className="text-xl font-black italic uppercase">Mitarbeiter</h3><button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-[#d4e137] text-black p-2 rounded-full"><UserPlus size={18} /></button></div>
            <input type="text" placeholder="Suchen..." className="w-full md:w-64 bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-xs outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {employees.filter(e => e.full_name.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
              <div key={emp.id} className="p-4 bg-black/40 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 group transition-all">
                <div className="flex items-center gap-4 w-full cursor-pointer" onClick={() => router.push(`/dashboard/admin/employee/${emp.id_employee}`)}>
                  <div className="w-12 h-12 rounded-xl bg-orange-600 flex-shrink-0 overflow-hidden border border-white/10">
                    {emp.photo_url ? <img src={STORAGE_URL + emp.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black italic">{emp.full_name[0]}</div>}
                  </div>
                  <div className="text-left"><p className="font-black text-sm uppercase italic group-hover:text-orange-500 transition-colors">{emp.full_name}</p><p className="text-[9px] text-gray-500 font-mono">{emp.id_employee}</p></div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button onClick={() => { setFormData(emp); setSelectedDbId(emp.id); setIsEditMode(true); setIsModalOpen(true); }} className="p-3 bg-white/5 text-blue-400 rounded-xl"><Edit3 size={14} /></button>
                  <button onClick={async () => { if(confirm(`Löschen?`)) { await supabase.from('employees').delete().eq('id', emp.id); loadAdminData(); } }} className="p-3 bg-red-500/10 text-red-500 rounded-xl"><Trash2 size={14} /></button>
                  <button onClick={() => router.push(`/dashboard/admin/employee/${emp.id_employee}`)} className="p-3 bg-white/5 text-gray-500 rounded-xl"><ChevronRight size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}