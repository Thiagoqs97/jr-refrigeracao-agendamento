import React, { useState, useEffect } from 'react';
import { SERVICES, TECHNICIANS } from '../constants';
import { X, Calendar, User, Phone, MapPin, Wrench, MessageSquare, CreditCard, Loader2, AlertCircle, Plus, Pencil } from 'lucide-react';
import { motion } from 'motion/react';
import { appointmentService } from '../services/appointmentService';
import { supabase } from '../lib/supabase';
import { Appointment } from '../types';

interface AppointmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingAppointment?: Appointment | null;
}

function formatDateTimeLocal(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AppointmentForm({ onClose, onSuccess, editingAppointment }: AppointmentFormProps) {
  const isEditing = !!editingAppointment;
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    client_whatsapp: '',
    address: '',
    equipment_type: '',
    problem_description: '',
    service_id: SERVICES[0].id,
    technician_id: TECHNICIANS[0].id,
    scheduled_at: '',
    payment_method: 'PIX',
    notes: ''
  });

  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        client_name: editingAppointment.client_name,
        client_whatsapp: editingAppointment.client_whatsapp,
        address: editingAppointment.address,
        equipment_type: editingAppointment.equipment_type,
        problem_description: editingAppointment.problem_description,
        service_id: editingAppointment.service_id,
        technician_id: editingAppointment.technician_id,
        scheduled_at: formatDateTimeLocal(editingAppointment.scheduled_at),
        payment_method: editingAppointment.payment_method || 'PIX',
        notes: editingAppointment.notes || ''
      });
    }
  }, [editingAppointment]);

  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (!isSupabaseConfigured) {
      setErrorMsg('O Supabase não está configurado. Por favor, adicione as chaves SUPABASE_URL e SUPABASE_ANON_KEY nos Secrets.');
      return;
    }

    // Basic validation
    if (!formData.client_name || !formData.client_whatsapp || !formData.address || !formData.scheduled_at) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    console.log(isEditing ? 'Atualizando agendamento...' : 'Iniciando criação de agendamento...', formData);
    setIsLoading(true);
    
    let isPending = true;
    const timeoutId = setTimeout(() => {
      if (isPending) {
        setIsLoading(false);
        setErrorMsg('A requisição demorou mais de 30 segundos. Isso geralmente acontece se o projeto no Supabase estiver "Pausado" (Inativo) ou se as chaves nos Secrets estiverem incorretas.');
      }
    }, 30000);

    try {
      const scheduledDate = new Date(formData.scheduled_at);
      if (isNaN(scheduledDate.getTime())) {
        throw new Error('Data e hora inválidas');
      }

      // Validação de bloqueio de turnos (Max. 1 serviço de manhã, 1 de tarde)
      const startOfDay = new Date(scheduledDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(scheduledDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: existingAppts, error: fetchError } = await supabase
        .from('appointments')
        .select('id, scheduled_at')
        .eq('technician_id', formData.technician_id)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .neq('status', 'cancelled');

      if (fetchError) throw fetchError;

      const relevantAppts = existingAppts ? existingAppts.filter(appt => appt.id !== editingAppointment?.id) : [];
      const isMorning = scheduledDate.getHours() < 13;

      const hasMorning = relevantAppts.some(appt => new Date(appt.scheduled_at).getHours() < 13);
      const hasAfternoon = relevantAppts.some(appt => new Date(appt.scheduled_at).getHours() >= 13);

      if (isMorning && hasMorning) {
        throw new Error('Bloqueio de Turno: O técnico já possui um agendamento neste turno da manhã. Escolha o turno da tarde ou outro dia/técnico.');
      }
      if (!isMorning && hasAfternoon) {
        throw new Error('Bloqueio de Turno: O técnico já possui um agendamento neste turno da tarde. Escolha o turno da manhã ou outro dia/técnico.');
      }

      const appointmentData = {
        client_name: formData.client_name,
        client_whatsapp: formData.client_whatsapp,
        address: formData.address,
        equipment_type: formData.equipment_type,
        problem_description: formData.problem_description,
        service_id: formData.service_id,
        technician_id: formData.technician_id,
        scheduled_at: scheduledDate.toISOString(),
        payment_method: formData.payment_method,
        notes: formData.notes
      };

      if (isEditing && editingAppointment) {
        await appointmentService.update(editingAppointment.id, appointmentData);
        console.log('Agendamento atualizado com sucesso');
      } else {
        const { data, error } = await supabase
          .from('appointments')
          .insert([{
            ...appointmentData,
            status: 'confirmed',
          }])
          .select();
        
        if (error) {
          console.error('Erro no Supabase:', error);
          throw error;
        }
        console.log('Agendamento criado com sucesso:', data);
      }

      isPending = false;
      clearTimeout(timeoutId);

      onSuccess();
      onClose();
    } catch (error: any) {
      isPending = false;
      clearTimeout(timeoutId);
      console.error('Erro detalhado:', error);
      
      let message = error.message || 'Erro desconhecido';
      
      if (message.includes('Failed to fetch')) {
        message = 'Não foi possível conectar ao Supabase. Verifique se a URL nos Secrets está correta e se você tem internet.';
      } else if (message.includes('JWT')) {
        message = 'Erro de autenticação (JWT). Verifique se a Anon Key nos Secrets está correta.';
      } else if (message.includes('relation "appointments" does not exist')) {
        message = 'A tabela "appointments" não foi encontrada no seu Supabase. Você precisa criá-la usando o SQL Editor.';
      }
      
      setErrorMsg(`Erro: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel w-[95%] sm:w-full sm:max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 sm:p-6 border-b border-slate-200/50 flex justify-between items-center bg-white/50 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {isEditing ? (
                <><Pencil size={20} className="text-blue-500" /> Editar Agendamento</>
              ) : (
                <><Plus size={20} className="text-emerald-500" /> Novo Agendamento Manual</>
              )}
            </h2>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
              {isEditing ? 'Atualize os dados do serviço' : 'Preencha os dados do serviço'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-500 hover:text-slate-800 shrink-0">
            <X size={20} />
          </button>
        </div>

        <form id="appointment-form" onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 custom-scrollbar flex-1">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-2 text-red-800 text-xs">
              <AlertCircle className="flex-shrink-0" size={16} />
              <p>{errorMsg}</p>
            </div>
          )}
          
          {!isSupabaseConfigured && !errorMsg && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2 text-amber-800 text-xs">
              <AlertCircle className="flex-shrink-0" size={16} />
              <p><b>Atenção:</b> O banco de dados não está configurado. O agendamento não será salvo.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Dados do Cliente
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                  <input
                    required
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">WhatsApp</label>
                  <input
                    required
                    type="text"
                    value={formData.client_whatsapp}
                    onChange={(e) => setFormData({ ...formData, client_whatsapp: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    placeholder="Ex: 86 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Endereço</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 h-20 resize-none"
                    placeholder="Rua, Número, Bairro, Cidade"
                  />
                </div>
              </div>
            </div>

            {/* Serviço */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Detalhes do Serviço
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Equipamento</label>
                  <input
                    required
                    type="text"
                    value={formData.equipment_type}
                    onChange={(e) => setFormData({ ...formData, equipment_type: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    placeholder="Ex: Split Samsung 12k BTUs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Serviço</label>
                  <select
                    value={formData.service_id}
                    onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  >
                    {SERVICES.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Técnico</label>
                  <select
                    value={formData.technician_id}
                    onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
                    className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                  >
                    {TECHNICIANS.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data e Hora</label>
              <input
                required
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Forma de Pagamento</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
              >
                <option value="PIX">PIX</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descrição do Problema</label>
            <textarea
              required
              value={formData.problem_description}
              onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
              className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 h-24 resize-none"
              placeholder="Descreva o que está acontecendo..."
            />
          </div>
        </form>

        <div className="p-4 sm:p-6 border-t border-slate-200/50 bg-white/50 backdrop-blur-md flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            form="appointment-form"
            type="submit"
            disabled={isLoading}
            className={`w-full sm:w-auto ${isEditing ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-blue-600/40' : 'premium-gradient shadow-emerald-600/20 hover:shadow-emerald-600/40'} text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : isEditing ? 'Salvar Alterações' : 'Salvar Agendamento'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
