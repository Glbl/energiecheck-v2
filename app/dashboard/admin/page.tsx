"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Users, Wallet, BarChart3, Clock, LayoutDashboard, 
  LogOut, Search, ChevronRight, Trash2, UserPlus, X, Edit3, Activity, History 
} from 'lucide-react';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [funnelLogs, setFunnelLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  
  const router = useRouter();

  const [formData, setFormData] = useState({
    id_employee: '',
    full_name: '',
    email: '',
    username: '',
    password: '',
    photo_url: '',
    role: 'worker'
  });

  const STORAGE_URL = "https://hoigzuytnzlkypkruyom.supabase.co/storage/v1/object/public/avatars/";

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'admin') { router.push('/login'); return; }
    loadAdminData();

    // Realtime para el Funnel y Clientes
    const channel = supabase.channel('admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => loadAdminData())
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

  const deleteWorker = async (id: string, name: string) => {
    if (!confirm(`Möchten Sie ${name} wirklich löschen?`)) return;
    await supabase.from('employees').delete().eq('id', id);
    loadAdminData();
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('employees').insert([formData]);
    setIsCreateModalOpen(false);
    resetForm();
    loadAdminData();
  };

  const openEditModal = (worker: any) => {
    setSelectedWorker(worker);
    setFormData({
      id_employee: worker.id_employee,
      full_name: worker.full_name,
      email: worker.email,
      username: worker.username,
      password: worker.password,
      photo_url: worker.photo_url || '',
      role: 'worker'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('employees').update(formData).eq('id', selectedWorker.id);
    setIsEditModalOpen(false);
    resetForm();
    loadAdminData();
  };

  const resetForm = () => {
    setFormData({ id_employee: '', full_name: '', email: '', username: '', password: '', photo_url: '', role: 'worker' });
    setSelectedWorker(null);
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`;
  };

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic">MASTER LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left pb-20">
      
      {/* MODAL (REGISTRO / EDICIÓN) */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0f1115] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); resetForm(); }} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24}/></button>
            <h3 className="text-2xl font-black italic uppercase mb-6 text-[#d4e137]">{isCreateModalOpen ? 'Neuer Worker' : 'Worker Bearbeiten'}</h3>
            <form onSubmit={isCreateModalOpen ? handleCreateWorker : handleUpdateWorker} className="space-y-4">
              <input type="text" placeholder="Worker ID (z.B. RG060893)" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.id_employee} onChange={e => setFormData({...formData, id_employee: e.target.value})} />
              <input type="text" placeholder="Full Name" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              <input type="text" placeholder="Photo FileName (ej: rosa.jpg)" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.photo_url} onChange={e => setFormData({...formData, photo_url: e.target.value})} />
              <input type="email" placeholder="Email" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="text" placeholder="Username" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              <input type="password" placeholder="Passwort" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              <button type="submit" className="w-full py-4 bg-[#d4e137] text-black font-black rounded-xl uppercase italic shadow-lg shadow-[#d4e137]/20">{isCreateModalOpen ? 'Registrieren' : 'Speichern'}</button>
            </form>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg rotate-3"><LayoutDashboard className="text-black" size={20} /></div>
          <div>
            <h1 className="text-lg md:text-xl font-black italic uppercase tracking-tighter leading-none">Admin Panel</h1>
            <p className="text-orange-500 text-[8px] font-bold uppercase tracking-[0.2em] mt-1">Master Control</p>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
          <LogOut size={14} /> <span className="hidden md:inline">Abmelden</span>
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-[2rem]">
            <BarChart3 className="text-[#d4e137] mb-4" size={20} />
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Umsatz</p>
            <h2 className="text-xl md:text-3xl font-black italic mt-1">{customers.reduce((acc, c) => acc + (Number(c.purchase_amount) || 0), 0).toLocaleString()} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-[2rem]">
            <Clock className="text-orange-500 mb-4" size={20} />
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Offen</p>
            <h2 className="text-xl md:text-3xl font-black italic mt-1">{customers.filter(c => c.commission_status === 'pending').reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0).toLocaleString()} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-[2rem]">
            <Wallet className="text-blue-400 mb-4" size={20} />
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Bezahlt</p>
            <h2 className="text-xl md:text-3xl font-black italic mt-1">{customers.filter(c => c.commission_status === 'paid').reduce((acc, c) => acc + (Number(c.commission_earned) || 0), 0).toLocaleString()} €</h2>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-[2rem]">
            <Users className="text-purple-400 mb-4" size={20} />
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Kunden</p>
            <h2 className="text-xl md:text-3xl font-black italic mt-1">{customers.length}</h2>
          </div>
        </div>

        {/* LIVE FUNNEL */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="text-orange-500 animate-pulse" size={24} />
            <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight">Live Aktivität</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {funnelLogs.map((log) => (
              <div key={log.id} className="bg-black/40 border border-white/5 p-5 rounded-3xl">
                <div className="flex justify-between items-start mb-3">
                  <div className="px-2 py-1 bg-orange-600/10 border border-orange-600/20 rounded text-[8px] font-bold text-orange-500 uppercase">{log.worker_id}</div>
                  <span className="text-[9px] text-gray-600 font-mono italic">{getTimeAgo(log.created_at)}</span>
                </div>
                <p className="text-xs font-black text-white italic uppercase truncate">{log.current_step}</p>
                <div className="mt-3 flex items-center gap-2 text-[9px] text-gray-600 italic"><History size={10} /><span>{log.time_spent_seconds}s verbracht</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* LISTA DE MITARBEITER */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight">Mitarbeiter Liste</h3>
              <button onClick={() => setIsCreateModalOpen(true)} className="bg-[#d4e137] text-black p-2 rounded-full hover:scale-110 transition-all flex-shrink-0"><UserPlus size={20} /></button>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input type="text" placeholder="Suchen..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 text-sm outline-none focus:border-orange-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {employees.filter(e => e.role === 'worker' && e.full_name.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
              <div key={emp.id} className="group p-4 md:p-6 bg-black/40 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-white/20 transition-all">
                
                {/* Foto y Nombre Clickeables */}
                <div 
                  className="flex items-center gap-4 md:gap-6 w-full min-w-0 cursor-pointer" 
                  onClick={() => router.push(`/dashboard/admin/employee/${emp.id_employee}`)}
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-orange-600 flex-shrink-0 overflow-hidden border border-white/10">
                    {emp.photo_url ? (
                      <img src={`${STORAGE_URL}${emp.photo_url}`} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-black text-xl italic">{emp.full_name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-black text-base md:text-lg group-hover:text-orange-500 transition-colors uppercase italic truncate tracking-tight">{emp.full_name}</p>
                    <p className="text-[10px] text-gray-500 font-mono font-bold tracking-widest">{emp.id_employee}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button onClick={() => openEditModal(emp)} className="p-3 bg-white/5 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={16} /></button>
                  <button onClick={() => deleteWorker(emp.id, emp.full_name)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                  <button onClick={() => router.push(`/dashboard/admin/employee/${emp.id_employee}`)} className="p-3 bg-white/5 text-gray-500 rounded-xl hover:text-white"><ChevronRight size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}