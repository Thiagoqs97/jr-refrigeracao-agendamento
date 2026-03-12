import { supabase } from '../lib/supabase';
import { Appointment } from '../types';

export const appointmentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('scheduled_at', { ascending: true });
    
    if (error) throw error;
    return data as Appointment[];
  },

  async create(appointment: Omit<Appointment, 'id'>) {
    console.log('Enviando para o Supabase:', appointment);
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();
    
    if (error) {
      console.error('Erro no Supabase:', error);
      throw error;
    }
    console.log('Resposta do Supabase:', data);
    return data as Appointment;
  },

  async updateStatus(id: string, status: Appointment['status']) {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Appointment;
  }
};
