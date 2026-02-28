/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  LayoutDashboard,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  X,
  Trash2,
  CalendarDays,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCheck,
  Ban,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  plan: string;
  created_at: string;
}

interface Schedule {
  id: string;
  student_id: string;
  scheduled_date: string;
  scheduled_time: string;
  description: string | null;
  status: string;
  created_at: string;
  students: { name: string; email: string; phone: string } | null;
}

interface FinancialEntry {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  amount: number;
  due_date: string;
  status: string;
  created_at: string;
}

type Page = 'dashboard' | 'agenda' | 'financeiro';

// â”€â”€â”€ App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-900">VOLL Candidate</h1>
          </div>

          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={page === 'dashboard'} onClick={() => setPage('dashboard')} />
            <NavItem icon={<Users size={20} />} label="Alunos" active={page === 'dashboard'} onClick={() => setPage('dashboard')} />
            <NavItem icon={<CalendarDays size={20} />} label="Agenda" active={page === 'agenda'} onClick={() => setPage('agenda')} />
            <NavItem icon={<TrendingUp size={20} />} label="Financeiro" active={page === 'financeiro'} onClick={() => setPage('financeiro')} />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <NavItem icon={<Settings size={20} />} label="ConfiguraÃ§Ãµes" onClick={() => {}} />
          <NavItem icon={<LogOut size={20} />} label="Sair" onClick={() => {}} />
        </div>
      </aside>

      {/* Page Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {page === 'dashboard'  && <StudentsPage />}
        {page === 'agenda'     && <AgendaPage />}
        {page === 'financeiro' && <FinanceiroPage />}
      </main>
    </div>
  );
}

// â”€â”€â”€ Students / Dashboard Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [newStudent, setNewStudent] = useState({
    name: '', email: '', phone: '', plan: 'Mensal', status: 'Ativo',
  });

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });
      if (response.ok) {
        fetchStudents();
        setIsModalOpen(false);
        setNewStudent({ name: '', email: '', phone: '', plan: 'Mensal', status: 'Ativo' });
      }
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Remover este aluno?')) return;
    try {
      await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erro ao remover aluno:', error);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'Ativo').length,
    trial: students.filter(s => s.status === 'Experimental').length,
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar alunos..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <UserPlus size={18} /> Novo Aluno
        </button>
      </header>

      <div className="p-8 overflow-y-auto flex-1">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Bem-vindo ao VOLL</h2>
          <p className="text-slate-500 text-sm">Gerencie seus alunos e acompanhe o crescimento do seu studio.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total de Alunos"    value={stats.total}  icon={<Users        className="text-blue-600"    />} trend="+12% este mÃªs" />
          <StatCard label="Alunos Ativos"      value={stats.active} icon={<CheckCircle2 className="text-emerald-600" />} trend="94% de retenÃ§Ã£o" />
          <StatCard label="Aulas Experimentais" value={stats.trial} icon={<Clock        className="text-amber-600"   />} trend="3 pendentes" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Lista de Alunos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Aluno</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Plano</th>
                  <th className="px-6 py-4 font-semibold">Contato</th>
                  <th className="px-6 py-4 font-semibold text-right">AÃ§Ãµes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Carregando alunos...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Nenhum aluno encontrado.</td></tr>
                ) : (
                  filtered.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{student.name}</p>
                            <p className="text-xs text-slate-500">Desde {new Date(student.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={student.status} /></td>
                      <td className="px-6 py-4"><span className="text-sm text-slate-600">{student.plan}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-slate-500"><Phone size={12} /> {student.phone}</div>
                          <div className="flex items-center gap-2 text-xs text-slate-500"><Mail size={12} /> {student.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Novo Aluno</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                  <input required type="text"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ex: JoÃ£o Silva"
                    value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label>
                    <input required type="email"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="joao@email.com"
                      value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                    <input required type="tel"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="(11) 99999-9999"
                      value={newStudent.phone} onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plano</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={newStudent.plan} onChange={e => setNewStudent({ ...newStudent, plan: e.target.value })}>
                    <option>Mensal</option>
                    <option>Trimestral</option>
                    <option>Semestral</option>
                    <option>Anual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Inicial</label>
                  <div className="flex gap-2">
                    {['Ativo', 'Experimental'].map(status => (
                      <button key={status} type="button"
                        onClick={() => setNewStudent({ ...newStudent, status })}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newStudent.status === status ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >{status}</button>
                    ))}
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                    <Plus size={20} /> Cadastrar Aluno
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// â”€â”€â”€ Agenda Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AgendaPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [newSchedule, setNewSchedule] = useState({
    student_id: '', scheduled_date: today, scheduled_time: '08:00', description: '', status: 'Agendado',
  });

  useEffect(() => {
    Promise.all([fetchSchedules(), fetchStudents()]).finally(() => setLoading(false));
  }, []);

  const fetchSchedules = async () => {
    const res = await fetch('/api/schedules');
    setSchedules(await res.json());
  };

  const fetchStudents = async () => {
    const res = await fetch('/api/students');
    setStudents(await res.json());
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSchedule),
    });
    if (res.ok) {
      const created = await res.json();
      setSchedules(prev => [...prev, created].sort((a, b) =>
        (a.scheduled_date + a.scheduled_time).localeCompare(b.scheduled_date + b.scheduled_time)
      ));
      setIsModalOpen(false);
      setNewSchedule({ student_id: '', scheduled_date: today, scheduled_time: '08:00', description: '', status: 'Agendado' });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/schedules?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSchedules(prev => prev.map(s => s.id === id ? updated : s));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este agendamento?')) return;
    const res = await fetch(`/api/schedules?id=${id}`, { method: 'DELETE' });
    if (res.status === 204) setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const filtered = filterDate ? schedules.filter(s => s.scheduled_date === filterDate) : schedules;

  const grouped = filtered.reduce<Record<string, Schedule[]>>((acc, s) => {
    if (!acc[s.scheduled_date]) acc[s.scheduled_date] = [];
    acc[s.scheduled_date].push(s);
    return acc;
  }, {});

  const counts = {
    total: schedules.length,
    pendentes: schedules.filter(s => s.status === 'Agendado').length,
    concluidos: schedules.filter(s => s.status === 'ConcluÃ­do').length,
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-800">Agenda de Aulas</h2>
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{counts.pendentes} pendentes</span>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50" />
          {filterDate && (
            <button onClick={() => setFilterDate('')} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <X size={14} /> Limpar
            </button>
          )}
          <button onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
            <Plus size={18} /> Novo Agendamento
          </button>
        </div>
      </header>

      <div className="p-8 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total"     value={counts.total}     icon={<Calendar     className="text-blue-600"    />} trend="histÃ³rico" />
          <StatCard label="Agendados" value={counts.pendentes} icon={<Clock        className="text-amber-600"   />} trend="aguardando" />
          <StatCard label="ConcluÃ­dos" value={counts.concluidos} icon={<CheckCircle2 className="text-emerald-600" />} trend="realizados" />
        </div>

        {loading ? (
          <p className="text-center text-slate-400 py-16">Carregando agenda...</p>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-center text-slate-400 py-16">Nenhum agendamento encontrado.</p>
        ) : (
          (Object.entries(grouped) as [string, Schedule[]][]).map(([date, items]) => (
            <div key={date} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-bold text-slate-700">
                  {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">{items.length} aula{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {items.map((s, idx) => (
                  <div key={s.id} className={`flex items-center gap-4 px-6 py-4 ${idx !== 0 ? 'border-t border-slate-100' : ''} hover:bg-slate-50/50 transition-colors group`}>
                    <div className="w-14 text-center flex-shrink-0">
                      <span className="text-sm font-bold text-slate-700">{s.scheduled_time.substring(0, 5)}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {(s.students?.name || '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{s.students?.name ?? 'Aluno removido'}</p>
                      {s.description && <p className="text-xs text-slate-500 truncate">{s.description}</p>}
                      {s.students?.phone && <p className="text-xs text-slate-400 flex items-center gap-1"><Phone size={10} /> {s.students.phone}</p>}
                    </div>
                    <ScheduleStatusBadge status={s.status} />
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {s.status === 'Agendado' && (<>
                        <button onClick={() => handleUpdateStatus(s.id, 'ConcluÃ­do')} title="Concluir"
                          className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"><CheckCheck size={15} /></button>
                        <button onClick={() => handleUpdateStatus(s.id, 'Cancelado')} title="Cancelar"
                          className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><Ban size={15} /></button>
                      </>)}
                      <button onClick={() => handleDelete(s.id)} title="Remover"
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Schedule Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Novo Agendamento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Aluno</label>
                  <select required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={newSchedule.student_id}
                    onChange={e => setNewSchedule({ ...newSchedule, student_id: e.target.value })}>
                    <option value="">Selecione um aluno...</option>
                    {students.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                    <input required type="date"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={newSchedule.scheduled_date}
                      onChange={e => setNewSchedule({ ...newSchedule, scheduled_date: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">HorÃ¡rio</label>
                    <input required type="time"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={newSchedule.scheduled_time}
                      onChange={e => setNewSchedule({ ...newSchedule, scheduled_time: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">DescriÃ§Ã£o da Aula</label>
                  <textarea rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    placeholder="Ex: Aula de yoga para iniciantes, foco em respiraÃ§Ã£o..."
                    value={newSchedule.description}
                    onChange={e => setNewSchedule({ ...newSchedule, description: e.target.value })} />
                </div>
                <div className="pt-2">
                  <button type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                    <CalendarDays size={18} /> Agendar Aula
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// â”€â”€â”€ Financeiro Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FinanceiroPage() {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'todos' | 'receita' | 'despesa'>('todos');

  const today = new Date().toISOString().split('T')[0];
  const [newEntry, setNewEntry] = useState({
    type: 'receita' as 'receita' | 'despesa',
    description: '', amount: '', due_date: today, status: 'Pendente',
  });

  useEffect(() => {
    fetch('/api/financial').then(r => r.json()).then(setEntries).finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/financial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newEntry, amount: parseFloat(newEntry.amount) }),
    });
    if (res.ok) {
      const created = await res.json();
      setEntries(prev => [...prev, created].sort((a, b) => a.due_date.localeCompare(b.due_date)));
      setIsModalOpen(false);
      setNewEntry({ type: 'receita', description: '', amount: '', due_date: today, status: 'Pendente' });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/financial?id=${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setEntries(prev => prev.map(e => e.id === id ? updated : e));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este lanÃ§amento?')) return;
    const res = await fetch(`/api/financial?id=${id}`, { method: 'DELETE' });
    if (res.status === 204) setEntries(prev => prev.filter(e => e.id !== id));
  };

  const filtered = filterType === 'todos' ? entries : entries.filter(e => e.type === filterType);
  const totalReceitas = entries.filter(e => e.type === 'receita').reduce((s, e) => s + e.amount, 0);
  const totalDespesas = entries.filter(e => e.type === 'despesa').reduce((s, e) => s + e.amount, 0);
  const saldo = totalReceitas - totalDespesas;
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
        <h2 className="text-lg font-bold text-slate-800">Financeiro</h2>
        <button onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={18} /> Novo LanÃ§amento
        </button>
      </header>

      <div className="p-8 overflow-y-auto flex-1">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ArrowUpCircle className="text-emerald-600" size={22} />
              </div>
              <span className="text-slate-500 text-sm font-medium">Total Receitas</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{fmt(totalReceitas)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <ArrowDownCircle className="text-red-500" size={22} />
              </div>
              <span className="text-slate-500 text-sm font-medium">Total Despesas</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{fmt(totalDespesas)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <DollarSign className={saldo >= 0 ? 'text-emerald-600' : 'text-red-500'} size={22} />
              </div>
              <span className="text-slate-500 text-sm font-medium">Saldo</span>
            </div>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmt(saldo)}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(['todos', 'receita', 'despesa'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${filterType === t ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              {t === 'todos' ? 'Todos' : t === 'receita' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold">DescriÃ§Ã£o</th>
                  <th className="px-6 py-4 font-semibold">Valor</th>
                  <th className="px-6 py-4 font-semibold">Vencimento</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">AÃ§Ãµes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Nenhum lanÃ§amento encontrado.</td></tr>
                ) : filtered.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${entry.type === 'receita' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        {entry.type === 'receita'
                          ? <ArrowUpCircle size={16} className="text-emerald-600" />
                          : <ArrowDownCircle size={16} className="text-red-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 text-sm">{entry.description}</p>
                      <p className="text-xs text-slate-400 capitalize">{entry.type}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-sm ${entry.type === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {entry.type === 'despesa' ? '- ' : '+ '}{fmt(entry.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {new Date(entry.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-6 py-4"><FinanceStatusBadge status={entry.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {entry.status === 'Pendente' && (
                          <button onClick={() => handleUpdateStatus(entry.id, 'Pago')} title="Marcar como pago"
                            className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"><CheckCheck size={15} /></button>
                        )}
                        <button onClick={() => handleDelete(entry.id)} title="Remover"
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Entry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Novo LanÃ§amento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                  <div className="flex gap-2">
                    {(['receita', 'despesa'] as const).map(t => (
                      <button key={t} type="button" onClick={() => setNewEntry({ ...newEntry, type: t })}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all flex items-center justify-center gap-1 ${
                          newEntry.type === t
                            ? t === 'receita' ? 'bg-emerald-600 text-white shadow-md' : 'bg-red-500 text-white shadow-md'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}>
                        {t === 'receita' ? <ArrowUpCircle size={13} /> : <ArrowDownCircle size={13} />}
                        {t === 'receita' ? 'Receita' : 'Despesa'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">DescriÃ§Ã£o</label>
                  <input required type="text"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ex: Mensalidade JoÃ£o Silva"
                    value={newEntry.description} onChange={e => setNewEntry({ ...newEntry, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                    <input required type="number" min="0.01" step="0.01"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="0,00"
                      value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vencimento</label>
                    <input required type="date"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={newEntry.due_date} onChange={e => setNewEntry({ ...newEntry, due_date: e.target.value })} />
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                    <DollarSign size={18} /> Registrar LanÃ§amento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// â”€â”€â”€ Shared UI Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {active && <ChevronRight size={14} />}
    </div>
  );
}

function StatCard({ label, value, icon, trend }: { label: string; value: number; icon: React.ReactNode; trend: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">{icon}</div>
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <h4 className="text-3xl font-bold text-slate-800">{value}</h4>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Ativo': 'bg-emerald-100 text-emerald-700',
    'Experimental': 'bg-amber-100 text-amber-700',
    'Inativo': 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}

function ScheduleStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Agendado': 'bg-blue-100 text-blue-700',
    'ConcluÃ­do': 'bg-emerald-100 text-emerald-700',
    'Cancelado': 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
}

function FinanceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Pendente': 'bg-amber-100 text-amber-700',
    'Pago': 'bg-emerald-100 text-emerald-700',
    'Cancelado': 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  );
}
