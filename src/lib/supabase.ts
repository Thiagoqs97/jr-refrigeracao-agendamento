import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debugging environment variables in different environments
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL ou Anon Key não encontradas no ambiente do Vite.');
  console.log('Ambiente atual:', import.meta.env.MODE);
  console.log('VITE_SUPABASE_URL presente:', !!supabaseUrl);
} else {
  const isPlaceholder = supabaseUrl.includes('seu-projeto');
  if (isPlaceholder) {
    console.warn('⚠️ A URL do Supabase ainda parece ser um placeholder.');
  } else {
    console.log('✅ Supabase configurado para:', supabaseUrl);
  }
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Verifica se a configuração básica existe e é válida
 */
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && 
         !!supabaseAnonKey && 
         !supabaseUrl.includes('seu-projeto');
};

/**
 * SQL Schema for Supabase:
 * 
 * -- 1. Tabela de Clientes
 * create table clients (
 *   id uuid default uuid_generate_v4() primary key,
 *   name text not null,
 *   whatsapp text not null unique,
 *   last_address text,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- 2. Tabela de Agendamentos
 * create table appointments (
 *   id uuid default uuid_generate_v4() primary key,
 *   client_name text not null,
 *   client_whatsapp text not null,
 *   address text not null,
 *   equipment_type text not null,
 *   problem_description text not null,
 *   service_id text not null,
 *   technician_id text not null,
 *   scheduled_at timestamp with time zone not null,
 *   status text not null default 'pending',
 *   payment_method text,
 *   notes text,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- 3. Trigger para Sincronizar Clientes automaticamente
 * create or replace function sync_client_on_appointment()
 * returns trigger as $$
 * begin
 *   insert into clients (name, whatsapp, last_address)
 *   values (new.client_name, new.client_whatsapp, new.address)
 *   on conflict (whatsapp) do update
 *   set name = excluded.name, last_address = excluded.last_address;
 *   return new;
 * end;
 * $$ language plpgsql;
 * 
 * create trigger tr_sync_client_on_appointment
 * after insert on appointments
 * for each row execute function sync_client_on_appointment();
 */
