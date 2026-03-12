import React, { useEffect, useState } from 'react';
import { appointmentService } from '../services/appointmentService';
import { Appointment, Client } from '../types';
import { User, Phone, MapPin, History, ChevronRight, Search, Loader2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICES, TECHNICIANS } from '../constants';

export default function ClientsView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const getEnv = (key: string) => {
    if (key === 'SUPABASE_URL') return process.env.SUPABASE_URL;
    if (key === 'SUPABASE_ANON_KEY') return process.env.SUPABASE_ANON_KEY;
    if (key === 'GEMINI_API_KEY') return process.env.GEMINI_API_KEY;
    return null;
  };

  const isSupabaseConfigured = !!getEnv('SUPABASE_URL') && !!getEnv('SUPABASE_ANON_KEY') && !getEnv('SUPABASE_URL')?.includes('seu-projeto');

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
        setError(err.message || 'Erro ao carregar clientes');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isSupabaseConfigured]);

  // Group appointments by client (using whatsapp as unique ID)
  interface ClientGroup {
    name: string;
    whatsapp: string;
    last_address: string;
    history: Appointment[];
  }

  const clientsMap = appointments.reduce((acc, app) => {
    const key = app.client_whatsapp;
    if (!acc[key]) {
      acc[key] = {
        name: app.client_name,
        whatsapp: app.client_whatsapp,
        last_address: app.address,
        history: []
      };
    }
    acc[key].history.push(app);
    return acc;
  }, {} as Record<string, ClientGroup>);

  const clientsList = (Object.values(clientsMap) as ClientGroup[]).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.whatsapp.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center">
        <AlertCircle className="mx-auto mb-2 text-red-600" size={32} />
        <h3 className="text-red-900 font-bold">Erro ao carregar Clientes</h3>
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

  if (!isSupabaseConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl text-center">
        <AlertCircle className="mx-auto mb-2 text-amber-600" size={32} />
        <h3 className="text-amber-900 font-bold">Configuração Pendente</h3>
        <p className="text-amber-700 text-sm">O banco de dados não está configurado. Adicione as chaves no arquivo .env.local.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Lista de Clientes */}
      <div className="lg:col-span-1 flex flex-col gap-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none shadow-sm transition-all placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[40vh] lg:max-h-full">
          {clientsList.map((client) => (
            <button
              key={client.whatsapp}
              onClick={() => setSelectedClient(client.whatsapp)}
              className={`w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 border relative overflow-hidden group ${
                selectedClient === client.whatsapp
                  ? 'premium-gradient text-white border-transparent shadow-lg shadow-emerald-600/30'
                  : 'glass-card border-white/60 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-base sm:text-lg shadow-sm transition-colors ${
                  selectedClient === client.whatsapp ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80'
                }`}>
                  {client.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm sm:text-[15px] truncate">{client.name}</p>
                  <p className={`text-[10px] sm:text-[11px] font-medium tracking-wide ${selectedClient === client.whatsapp ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {client.whatsapp}
                  </p>
                </div>
                <ChevronRight size={16} className={`transition-transform duration-300 ${selectedClient === client.whatsapp ? 'text-white' : 'text-slate-300 group-hover:translate-x-1'}`} />
              </div>
            </button>
          ))}
          {clientsList.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm italic">
              Nenhum cliente encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Histórico do Cliente */}
      <div className="lg:col-span-2 glass-card w-full overflow-hidden flex flex-col h-full border border-slate-200/50 shadow-sm">
        <AnimatePresence mode="wait">
          {selectedClient ? (
            <motion.div
              key={selectedClient}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <div className="p-4 sm:p-6 border-b border-slate-100 bg-white/40 backdrop-blur-sm">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl premium-gradient flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-lg shadow-emerald-600/20 shrink-0">
                    {clientsMap[selectedClient].name[0]}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 break-words line-clamp-2">{clientsMap[selectedClient].name}</h2>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 font-bold bg-white/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-200/50">
                        <Phone size={12} className="text-emerald-600" /> {clientsMap[selectedClient].whatsapp}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 font-bold bg-white/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-200/50">
                        <MapPin size={12} className="text-emerald-600" /> {clientsMap[selectedClient].last_address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <History size={16} /> Histórico de Serviços
                </h3>
                
                <div className="space-y-4">
                  {clientsMap[selectedClient].history
                    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
                    .map((app) => {
                      const service = SERVICES.find(s => s.id === app.service_id);
                      const tech = TECHNICIANS.find(t => t.id === app.technician_id);
                      const date = new Date(app.scheduled_at);
                      
                      return (
                        <div key={app.id} className="p-5 rounded-3xl border border-white/80 bg-white/60 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300 group">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-100/80 border border-emerald-200/50 px-3 py-1 rounded-lg">
                                {service?.name || 'Serviço'}
                              </span>
                              <h4 className="text-[15px] font-bold text-slate-800 mt-2.5">{app.equipment_type}</h4>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                                <Calendar size={14} className="text-slate-400" /> {date.toLocaleDateString('pt-BR')}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 justify-end mt-1">
                                <Clock size={12} /> {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-[13px] text-slate-500 mb-5 italic bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">"{app.problem_description}"</p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600 border-2 border-white shadow-sm ring-1 ring-slate-200/50">
                                {tech?.name[0]}
                              </div>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Técnico: <span className="text-slate-700">{tech?.name}</span>
                              </span>
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                              app.status === 'confirmed' ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/50' :
                              app.status === 'completed' ? 'bg-blue-100/80 text-blue-700 border border-blue-200/50' :
                              'bg-slate-100/80 text-slate-700 border border-slate-200/50'
                            }`}>
                              {app.status}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center bg-slate-50/30">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-5 shadow-sm border border-slate-100">
                <User size={48} className="text-slate-200" />
              </div>
              <h3 className="font-black text-xl text-slate-800">Selecione um cliente</h3>
              <p className="text-sm text-slate-500 max-w-sm mt-3 font-medium">Escolha um cliente na lista ao lado para ver seu histórico completo de serviços e detalhes de contato.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
