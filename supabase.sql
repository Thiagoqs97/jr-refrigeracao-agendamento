-- 1. Extensão para gerar UUIDs automaticamente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Clientes
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  whatsapp text NOT NULL UNIQUE,
  last_address text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_name text NOT NULL,
  client_whatsapp text NOT NULL,
  address text NOT NULL,
  equipment_type text NOT NULL,
  problem_description text NOT NULL,
  service_id text NOT NULL,
  technician_id text NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Função para Sincronizar Clientes automaticamente
CREATE OR REPLACE FUNCTION sync_client_on_appointment()
RETURNS trigger AS $$
BEGIN
  INSERT INTO clients (name, whatsapp, last_address)
  VALUES (new.client_name, new.client_whatsapp, new.address)
  ON CONFLICT (whatsapp) DO UPDATE
  SET name = excluded.name, last_address = excluded.last_address;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para Sincronizar Clientes automaticamente
DROP TRIGGER IF EXISTS tr_sync_client_on_appointment ON appointments;
CREATE TRIGGER tr_sync_client_on_appointment
AFTER INSERT ON appointments
FOR EACH ROW EXECUTE FUNCTION sync_client_on_appointment();
