import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Technicians from './components/Technicians';
import Services from './components/Services';

import CalendarView from './components/CalendarView';
import ClientsView from './components/ClientsView';
import AppointmentForm from './components/AppointmentForm';
import { LayoutDashboard, Users, Briefcase, MessageSquare, Calendar, Phone, MapPin, Instagram, Mail, Plus, UserCheck } from 'lucide-react';
import { COMPANY_INFO } from './constants';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'dashboard' | 'calendar' | 'technicians' | 'services' | 'clients';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'clients', label: 'Clientes', icon: UserCheck },
    { id: 'technicians', label: 'Técnicos', icon: Users },
    { id: 'services', label: 'Serviços', icon: Briefcase },

  ];

  return (
    <div className="min-h-screen bg-slate-50/50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/40 via-slate-50 to-slate-100 flex flex-col selection:bg-emerald-200 transition-colors">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
              JR
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">JR Refrigeração</h1>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Sistema de Agendamento</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="premium-gradient text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 border border-white/10"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Novo Agendamento</span><span className="sm:hidden">Novo</span>
            </button>
            <div className="hidden md:flex items-center gap-6 border-l border-slate-200 pl-6 ml-2">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Phone size={14} className="text-emerald-600" /> {COMPANY_INFO.whatsapp}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 lg:py-6 flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-0">
        {/* Sidebar Navigation */}
        <aside className="lg:w-60 flex-shrink-0">
          <nav className="flex lg:flex-col gap-2 lg:gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex-shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
                  activeTab === tab.id
                    ? 'text-emerald-700 bg-emerald-50 shadow-sm border border-emerald-100/50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm border border-transparent'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute left-0 bottom-0 lg:bottom-auto lg:top-0 h-1 w-full lg:h-full lg:w-1 bg-emerald-500 lg:rounded-r-full"
                  />
                )}
                <tab.icon size={18} className={`shrink-0 ${activeTab === tab.id ? 'text-emerald-600' : 'group-hover:text-slate-700'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="hidden lg:block mt-8 p-6 glass-card space-y-4 w-full">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informações</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <Mail size={14} className="text-emerald-600" /> {COMPANY_INFO.email}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <Instagram size={14} className="text-emerald-600" /> {COMPANY_INFO.instagram}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <Calendar size={14} className="text-emerald-600" /> Seg-Sáb
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-4 lg:pb-0 lg:flex-1 lg:overflow-y-auto lg:pr-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${refreshKey}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
              {activeTab === 'calendar' && <CalendarView />}
              {activeTab === 'clients' && <ClientsView />}
              {activeTab === 'technicians' && <Technicians onNavigate={setActiveTab} />}
              {activeTab === 'services' && <Services />}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <AppointmentForm
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => {
              console.log('Agendamento criado com sucesso');
              handleRefresh();
              setIsFormOpen(false);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
