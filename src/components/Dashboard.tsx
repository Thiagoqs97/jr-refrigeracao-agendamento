import React, { useEffect, useState } from 'react';
import { COMPANY_INFO, TECHNICIANS, SERVICES } from '../constants';
import { Users, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Loader2, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { appointmentService } from '../services/appointmentService';
import { Appointment } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { isSameDay } from '../lib/utils';
import AppointmentForm from './AppointmentForm';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
};

interface DashboardProps {
  onNavigate: (tab: any) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isConfigured = isSupabaseConfigured();

  const loadAppointments = async () => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await appointmentService.getAll();
      setAppointments(data);
    } catch (err: any) {
      console.error('Error loading appointments:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [isConfigured]);

  const handleFinalize = async (id: string) => {
    setActionLoading(id);
    try {
      await appointmentService.updateStatus(id, 'completed');
      await loadAppointments();
    } catch (err: any) {
      console.error('Erro ao finalizar:', err);
      alert('Erro ao finalizar agendamento: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await appointmentService.remove(id);
      setDeletingId(null);
      await loadAppointments();
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      alert('Erro ao excluir agendamento: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setActionLoading(null);
    }
  };

  const today = new Date();
  const todayAppointments = appointments.filter(a => isSameDay(a.scheduled_at, today));
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const completedAppointments = appointments.filter(a => a.status === 'completed');

  const stats = [
    { label: 'Agendamentos Hoje', value: todayAppointments.length.toString(), icon: Calendar, color: 'bg-emerald-500' },
    { label: 'Técnicos Ativos', value: TECHNICIANS.length.toString(), icon: Users, color: 'bg-teal-500' },
    { label: 'Pendentes', value: pendingAppointments.length.toString(), icon: AlertCircle, color: 'bg-amber-500' },
    { label: 'Concluídos', value: completedAppointments.length.toString(), icon: CheckCircle2, color: 'bg-blue-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card w-full p-4 sm:p-5 flex flex-row items-center gap-4 sm:gap-5 border border-white/60 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 ${stat.color} opacity-5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500`}></div>
            <div className={`${stat.color} p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-white shadow-md relative z-10 group-hover:shadow-lg transition-shadow duration-300 group-hover:-translate-y-1 shrink-0`}>
              <stat.icon size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1 sm:mb-1.5">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card w-full overflow-hidden">
          <div className="w-full p-5 border-b border-slate-100 bg-white/40 flex justify-between items-center backdrop-blur-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-emerald-500" /> Próximos Agendamentos
            </h3>
            <button 
              onClick={() => onNavigate('calendar')}
              className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider hover:text-emerald-800 transition-colors"
            >
              Ver todos
            </button>
          </div>
          <div className="divide-y divide-slate-50 w-full">
            {!isConfigured ? (
              <div className="py-12 px-6 text-center bg-amber-50/30 rounded-b-2xl">
                <AlertCircle className="mx-auto mb-2 text-amber-600" size={24} />
                <h4 className="text-amber-900 font-bold text-sm">Configuração Pendente</h4>
                <p className="text-amber-700 text-[11px] max-w-xs mx-auto mt-1">
                  O banco de dados não está configurado. Verifique o arquivo <code className="bg-amber-100 px-1 rounded">.env.local</code> e realize um novo deploy no Vercel.
                </p>
              </div>
            ) : error ? (
              <div className="py-12 px-6 text-center text-red-500">
                <AlertCircle className="mx-auto mb-2" size={24} />
                <p className="text-xs font-medium">{error}</p>
              </div>
            ) : appointments.length > 0 ? (
              appointments.slice(0, 10).map((app, i) => {
                const tech = TECHNICIANS.find(t => t.id === app.technician_id);
                const service = SERVICES.find(s => s.id === app.service_id);
                const date = new Date(app.scheduled_at);
                const isCompleted = app.status === 'completed';
                
                return (
                  <div key={app.id} className={`p-3 sm:p-4 hover:bg-slate-50/80 transition-all duration-200 group ${isCompleted ? 'opacity-60' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className={`w-full sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl ${isCompleted ? 'bg-slate-50/50 text-slate-400 border-slate-100/50' : 'bg-emerald-50/50 text-emerald-800 border-emerald-100/50'} flex sm:flex-col items-center justify-center shadow-sm group-hover:bg-emerald-100/50 transition-colors gap-2 sm:gap-0`}>
                        <span className="text-sm font-black">
                          {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                          {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-[14px] sm:text-[15px] font-bold ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800 group-hover:text-emerald-700'} transition-colors truncate`}>{app.client_name}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-500 truncate max-w-[200px]">
                            <MapPin size={10} className="text-slate-400" /> {app.address}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-500">
                            <Clock size={10} className="text-slate-400" /> {service?.name || 'Serviço'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-3 mt-1 sm:mt-0">
                        <div className={`px-2.5 py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'confirmed' ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/50' :
                          app.status === 'pending' ? 'bg-amber-100/80 text-amber-700 border border-amber-200/50' :
                          app.status === 'completed' ? 'bg-blue-100/80 text-blue-700 border border-blue-200/50' :
                          'bg-slate-100/80 text-slate-700 border border-slate-200/50'
                        }`}>
                          {STATUS_LABELS[app.status] || app.status}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="sm:hidden text-[10px] font-bold text-slate-500">{tech?.name}</span>
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-[10px] font-bold border-2 border-white shadow-sm ring-1 ring-slate-200/50" title={tech?.name}>
                            {tech?.name[0] || '?'}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2 justify-end mt-3 pt-2 border-t border-slate-50 flex-wrap">
                      {!isCompleted && (
                        <button
                          onClick={() => handleFinalize(app.id)}
                          disabled={actionLoading === app.id}
                          className="action-btn-success flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 disabled:opacity-50"
                          title="Finalizar agendamento"
                        >
                          {actionLoading === app.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                          Finalizar
                        </button>
                      )}
                      <button
                        onClick={() => setEditingAppointment(app)}
                        disabled={actionLoading === app.id}
                        className="action-btn-edit flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 disabled:opacity-50"
                        title="Editar agendamento"
                      >
                        <Pencil size={12} />
                        Editar
                      </button>
                      <button
                        onClick={() => setDeletingId(app.id)}
                        disabled={actionLoading === app.id}
                        className="action-btn-danger flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 disabled:opacity-50"
                        title="Excluir agendamento"
                      >
                        <Trash2 size={12} />
                        Excluir
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 px-6 text-center text-slate-500 text-sm flex flex-col items-center">
                <Calendar size={32} className="text-slate-300 mb-3" />
                <p>Nenhum agendamento encontrado.</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card w-full overflow-hidden">
          <div className="w-full p-5 border-b border-slate-100 bg-white/40 flex items-center gap-2 backdrop-blur-sm">
            <Users size={18} className="text-blue-500" />
            <h3 className="font-bold text-slate-800">Status dos Técnicos</h3>
          </div>
          <div className="p-5 space-y-5">
            {TECHNICIANS.map((tech, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50/50 flex items-center justify-center text-blue-700 font-bold text-base sm:text-lg border border-blue-100/50 shadow-sm group-hover:bg-blue-100/50 transition-colors shrink-0">
                  {tech.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{tech.name}</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium uppercase tracking-wider truncate">{tech.specialty}</p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50/80 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-emerald-100/50 shrink-0">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></div>
                  <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Disponível</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Excluir Agendamento</h3>
                  <p className="text-xs text-slate-500">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Tem certeza que deseja excluir este agendamento? Todos os dados serão removidos permanentemente.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deletingId)}
                  disabled={actionLoading === deletingId}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === deletingId ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Edição */}
      <AnimatePresence>
        {editingAppointment && (
          <AppointmentForm
            editingAppointment={editingAppointment}
            onClose={() => setEditingAppointment(null)}
            onSuccess={() => {
              setEditingAppointment(null);
              loadAppointments();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
