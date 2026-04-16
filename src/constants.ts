import { Technician, Service } from './types';

export const TECHNICIANS: Technician[] = [
  {
    id: 'leomar',
    name: 'Leomar',
    whatsapp: '86 99504-2011',
    specialty: 'Todas',
    regions: ['Todas'],
    work_days: ['Seg-Sex 8h-18h', 'Sáb 8h-12h'],
  },
  {
    id: 'haylan',
    name: 'Haylan',
    whatsapp: '86 99956-3792',
    specialty: 'Todas',
    regions: ['Todas'],
    work_days: ['Indisponível (Sem agenda aberta)'],
  },
  {
    id: 'rozenilson',
    name: 'Rozenilson',
    whatsapp: '86 99551-3702',
    specialty: 'Todas',
    regions: ['Todas'],
    work_days: ['Seg-Sex 8h-18h', 'Sáb 8h-12h'],
  },
];

export const SERVICES: Service[] = [
  {
    id: 'instalacao',
    name: 'Instalação de ar condicionado',
    average_time: '4h-6h',
    requires_quote: true,
    price_range: 'Depende do tamanho da máquina',
  },
  {
    id: 'limpeza',
    name: 'Limpeza / Higienização',
    average_time: '2h',
    requires_quote: true,
    price_range: 'Depende do tamanho da máquina',
  },
  {
    id: 'recarga_gas',
    name: 'Recarga de gás',
    average_time: '1:30',
    requires_quote: true,
    price_range: 'Depende do tipo',
  },
  {
    id: 'manutencao_preventiva',
    name: 'Manutenção preventiva',
    average_time: '1:30',
    requires_quote: true,
    price_range: 'Depende do tamanho da máquina',
  },
  {
    id: 'manutencao_corretiva',
    name: 'Manutenção corretiva / Reparo',
    average_time: '2:30-3h',
    requires_quote: true,
    price_range: 'Depende do tamanho da máquina',
  },
  {
    id: 'desinstalacao_reinstalacao',
    name: 'Desinstalação e reinstalação',
    average_time: '2:30',
    requires_quote: true,
    price_range: 'Depende do tamanho da máquina',
  },
];

export const COMPANY_INFO = {
  name: 'JR Refrigeração',
  whatsapp: '86 99575-3376',
  email: 'direcao@jrefrigeracao.com.br',
  address: 'Av. Presidente Kennedy, 1835 - Leste, Teresina-PI',
  instagram: '@jrclimatizacaoeser',
  cities: ['Teresina', 'Timon-MA', 'Altos-PI'],
  working_hours: {
    weekdays: '8h às 18h',
    saturday: '8h às 12h',
    sunday: 'Fechado',
  },
  visit_fee: 70,
};
