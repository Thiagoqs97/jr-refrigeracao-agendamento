-- Script de Criação de Tabelas para JR Refrigeração

-- 1. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    whatsapp TEXT UNIQUE NOT NULL,
    last_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_whatsapp TEXT NOT NULL,
    address TEXT NOT NULL,
    equipment_type TEXT NOT NULL,
    problem_description TEXT NOT NULL,
    service_id TEXT NOT NULL,
    technician_id TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 4. Criar Políticas de Acesso (Público para este MVP, ajuste conforme necessidade)
CREATE POLICY "Permitir acesso total a clientes" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total a agendamentos" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
