"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Users, Wallet, BarChart3, Clock, LayoutDashboard, 
  LogOut, Search, ChevronRight, Trash2, UserPlus, X, Edit3 
} from 'lucide-react';

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [funnelLogs, setFunnelLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para Modales
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
    role: 'worker'
  });

  const STORAGE_URL = "https://hoigzuytnzlkypkruyom.supabase.co/storage/v1/object/public/avatars/";

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'admin') {
      router.push('/login');
      return;
    }
    loadAdminData();
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

  // --- ELIMINAR ---
  const deleteWorker = async (id: string, name: string) => {
    if (!confirm(`Möchten Sie ${name} wirklich löschen?`)) return;
    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
      loadAdminData();
    } catch (error: any) { alert("Error: " + error.message); }
  };

  // --- CREAR ---
  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('employees').insert([formData]);
      if (error) throw error;
      setIsCreateModalOpen(false);
      resetForm();
      loadAdminData();
    } catch (error: any) { alert("Error: " + error.message); }
  };

  // --- EDITAR ---
  const openEditModal = (worker: any) => {
    setSelectedWorker(worker);
    setFormData({
      id_employee: worker.id_employee,
      full_name: worker.full_name,
      email: worker.email,
      username: worker.username,
      password: worker.password,
      role: 'worker'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('employees')
        .update(formData)
        .eq('id', selectedWorker.id);
      
      if (error) throw error;
      setIsEditModalOpen(false);
      resetForm();
      loadAdminData();
    } catch (error: any) { alert("Error: " + error.message); }
  };

  const resetForm = () => {
    setFormData({ id_employee: '', full_name: '', email: '', username: '', password: '', role: 'worker' });
    setSelectedWorker(null);
  };

  if (loading) return <div className="min-h-screen bg-[#05070a] text-white flex items-center justify-center font-black italic">LADEN...</div>;

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans text-left pb-20 relative">
      
      {/* MODAL CREAR / EDITAR (Reutilizable) */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f1115] border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 relative shadow-2xl">
            <button onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); resetForm(); }} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24}/></button>
            <h3 className="text-2xl font-black italic uppercase mb-6 text-[#d4e137]">
              {isCreateModalOpen ? 'Neuer Mitarbeiter' : 'Mitarbeiter Bearbeiten'}
            </h3>
            <form onSubmit={isCreateModalOpen ? handleCreateWorker : handleUpdateWorker} className="space-y-4">
              <input type="text" placeholder="ID (z.B. KM2026)" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4" 
                value={formData.id_employee} onChange={e => setFormData({...formData, id_employee: e.target.value})} />
              <input type="text" placeholder="Vollständiger Name" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4"
                value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              <input type="email" placeholder="E-Mail" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input type="text" placeholder="Username" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4"
                value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              <input type="password" placeholder="Passwort" required className="w-full bg-white/5 border border-white/10 rounded-xl p-4"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              <button type="submit" className="w-full py-4 bg-[#d4e137] text-black font-black rounded-xl uppercase italic mt-4 hover:scale-105 transition-all">
                {isCreateModalOpen ? 'Registrieren' : 'Speichern'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl h-20 flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-lg rotate-3"><LayoutDashboard className="text-black" size={20} /></div>
          <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none">Admin Panel</h1>
        </div>
        <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-gray-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><LogOut size={14} /> Abmelden</button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        {/* LISTA DE TRABAJADORES */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black italic uppercase tracking-tight">Mitarbeiter Liste</h3>
              <button onClick={() => setIsCreateModalOpen(true)} className="bg-[#d4e137] text-black p-2 rounded-full hover:scale-110 transition-all"><UserPlus size={20} /></button>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
              <input type="text" placeholder="Suchen..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {employees.filter(e => e.role === 'worker' && e.full_name.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
              <div key={emp.id} className="group p-6 bg-black/40 rounded-[2.5rem] border border-white/5 flex justify-between items-center hover:border-white/20 transition-all">
                <div className="flex items-center gap-6 w-full min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-orange-600 flex-shrink-0 overflow-hidden border border-white/10">
                    {emp.photo_url ? (
                      <img src={`${STORAGE_URL}${emp.photo_url}`} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-black text-xl italic">{emp.full_name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-black text-lg uppercase italic truncate tracking-tight">{emp.full_name}</p>
                    <p className="text-[10px] text-gray-500 font-mono font-bold tracking-widest">{emp.id_employee}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button onClick={() => openEditModal(emp)} className="p-4 bg-white/5 text-blue-400 rounded-2xl hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={18} /></button>
                  <button onClick={() => deleteWorker(emp.id, emp.full_name)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                  <button onClick={() => router.push(`/dashboard/admin/employee/${emp.id_employee}`)} className="p-4 bg-white/5 text-gray-500 rounded-2xl hover:text-white"><ChevronRight size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}