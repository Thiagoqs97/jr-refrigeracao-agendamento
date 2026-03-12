import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';
import { Appointment, Technician } from '../types';
import { TECHNICIANS } from '../constants';
import { ChevronLeft, ChevronRight, Clock, User, MapPin, Filter, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CalendarView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterTech, setFilterTech] = useState<string>('all');

  const getEnv = (key: string) => {
    if (key === 'SUPABASE_URL') return process.env.SUPABASE_URL;
    if (key === 'SUPABASE_ANON_KEY') return process.env.SUPABASE_ANON_KEY;
    if (key === 'GEMINI_API_KEY') return process.env.GEMINI_API_KEY;
    return null;
  };

  const isSupabaseConfigured = !!getEnv('SUPABASE_URL') && !!getEnv('SUPABASE_ANON_KEY');

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await appointmentService.getAll();
        setAppointments(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Erro ao carregar agendamentos');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isSupabaseConfigured]);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const dateStr = selectedDate.toISOString().split('T')[0];
  const filteredAppointments = appointments.filter(app => {
    const isSameDay = app.scheduled_at.startsWith(dateStr);
    const matchesTech = filterTech === 'all' || app.technician_id === filterTech;
    return isSameDay && matchesTech;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  if (error && error !== 'Erro ao carregar agenda' && error !== 'Failed to fetch') {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center">
        <AlertCircle className="mx-auto mb-2 text-red-600" size={32} />
        <h3 className="text-red-900 font-bold">Erro de Conexão</h3>
        <p className="text-red-700 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card w-full flex flex-col md:flex-row justify-between items-center gap-4 p-4 sm:p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full md:w-auto gap-2 sm:gap-4">
          <button onClick={() => changeDate(-1)} className="p-2 sm:p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-600 hover:text-emerald-700 shrink-0">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center flex-1 md:min-w-[200px]">
            <h3 className="font-bold text-slate-800 text-sm sm:text-lg capitalize leading-tight">
              {selectedDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
              <span className="hidden sm:inline"> {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' }).split(',')[0]}</span>
            </h3>
          </div>
          <button onClick={() => changeDate(1)} className="p-2 sm:p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-600 hover:text-emerald-700 shrink-0">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 bg-slate-50/80 px-3 sm:px-4 py-2 rounded-xl border border-slate-200/50 w-full md:w-auto">
          <Filter size={16} className="text-emerald-600 shrink-0" />
          <select 
            value={filterTech}
            onChange={(e) => setFilterTech(e.target.value)}
            className="bg-transparent border-none text-xs sm:text-sm font-bold text-slate-700 rounded-lg outline-none focus:ring-0 cursor-pointer flex-1"
          >
            <option value="all">Filtro: Todos</option>
            {TECHNICIANS.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((app, i) => {
              const tech = TECHNICIANS.find(t => t.id === app.technician_id);
              const date = new Date(app.scheduled_at);
              
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card w-full p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4 sm:gap-5 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 md:w-32 flex-shrink-0">
                    <div className="w-full md:w-14 h-12 md:h-14 rounded-xl sm:rounded-2xl bg-emerald-50/80 flex md:flex-col items-center justify-center text-emerald-700 border border-emerald-100/50 shadow-sm group-hover:bg-emerald-100/80 transition-colors gap-2 md:gap-0.5">
                      <Clock size={16} className="md:w-[18px] md:h-[18px]" />
                      <span className="text-sm font-black">
                        {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5">
                      <h4 className="font-bold text-base sm:text-lg text-slate-800 group-hover:text-emerald-700 transition-colors cursor-pointer truncate">{app.client_name}</h4>
                      <span className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-600 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-bold uppercase tracking-wider border border-slate-200/50 whitespace-nowrap">
                        {app.equipment_type}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 font-medium truncate">
                      <MapPin size={12} className="text-slate-400 shrink-0" /> {app.address}
                    </p>
                    <p className="text-[12px] sm:text-[13px] text-slate-500 mt-2 italic bg-slate-50/50 p-2 sm:p-2.5 rounded-xl border border-slate-100">
                      "{app.problem_description}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-start gap-4 md:w-64 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xs sm:text-sm font-black border-2 border-white shadow-sm ring-1 ring-slate-200/50 shrink-0">
                        {tech?.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">Técnico</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{tech?.name}</p>
                      </div>
                    </div>
                    <div className="text-right ml-auto">
                      <div className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
                        app.status === 'confirmed' ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/50' :
                        app.status === 'pending' ? 'bg-amber-100/80 text-amber-700 border border-amber-200/50' :
                        'bg-slate-100/80 text-slate-700 border border-slate-200/50'
                      }`}>
                        {app.status === 'confirmed' ? 'Confirmado' : app.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card w-full p-16 text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 bg-slate-50/50 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-300 border border-slate-100/50 shadow-inner">
                <Calendar size={40} />
              </div>
              <h4 className="text-slate-800 font-black text-xl mb-2">Nenhum agendamento</h4>
              <p className="text-sm text-slate-500 font-medium">Não há serviços marcados para este dia ou filtro.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
