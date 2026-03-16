-- =====================================================
-- Views com Fuso Horário Local (America/Fortaleza UTC-3)
-- Para uso com n8n / Agente de IA
-- =====================================================
-- Essas views retornam datas e horários JÁ CONVERTIDOS
-- para o horário de Teresina, sem necessidade de conversão.
-- =====================================================

-- 1. View de Agendamentos com horário local
CREATE OR REPLACE VIEW public.appointments_local AS
SELECT
  id,
  client_name,
  client_whatsapp,
  address,
  equipment_type,
  problem_description,
  service_id,
  technician_id,
  to_char(scheduled_at AT TIME ZONE 'America/Fortaleza', 'YYYY-MM-DD"T"HH24:MI:SS') as scheduled_at,
  status,
  payment_method,
  notes,
  to_char(created_at AT TIME ZONE 'America/Fortaleza', 'YYYY-MM-DD"T"HH24:MI:SS') as created_at
FROM public.appointments;

-- 2. View de Clientes com horário local
CREATE OR REPLACE VIEW public.clients_local AS
SELECT
  id,
  name,
  whatsapp,
  last_address,
  to_char(created_at AT TIME ZONE 'America/Fortaleza', 'YYYY-MM-DD"T"HH24:MI:SS') as created_at
FROM public.clients;

-- 3. Permissões de acesso (necessário para a API funcionar)
GRANT SELECT ON public.appointments_local TO anon;
GRANT SELECT ON public.appointments_local TO authenticated;
GRANT SELECT ON public.clients_local TO anon;
GRANT SELECT ON public.clients_local TO authenticated;
