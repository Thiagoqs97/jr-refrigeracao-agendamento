export type Technician = {
  id: string;
  name: string;
  whatsapp: string;
  specialty: string;
  regions: string[];
  work_days: string[];
};

export type Service = {
  id: string;
  name: string;
  average_time: string;
  requires_quote: boolean;
  price_range: string;
};

export type Appointment = {
  id: string;
  client_name: string;
  client_whatsapp: string;
  address: string;
  equipment_type: string;
  problem_description: string;
  service_id: string;
  technician_id: string;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_method?: string;
  notes?: string;
  created_at?: string;
};

export type Client = {
  id: string;
  name: string;
  whatsapp: string;
  last_address?: string;
  created_at?: string;
};

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};
