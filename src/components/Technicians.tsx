import React from 'react';
import { TECHNICIANS } from '../constants';
import { Phone, MapPin, Calendar, Briefcase, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface TechniciansProps {
  onNavigate: (tab: any) => void;
}

export default function Technicians({ onNavigate }: TechniciansProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {TECHNICIANS.map((tech, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card w-full overflow-hidden group hover:shadow-xl transition-all duration-300 relative"
        >
          <div className="bg-gradient-to-br from-slate-50/80 via-white to-white p-4 sm:p-6 flex flex-col items-center text-center border-b border-slate-100 relative z-10 w-full">
            <div className="absolute inset-0 bg-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl premium-gradient flex items-center justify-center text-white text-3xl sm:text-4xl font-black mb-4 sm:mb-5 group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-500 shadow-xl shadow-emerald-600/20">
              {tech.name[0]}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">{tech.name}</h3>
            <div className="flex items-center gap-2 mt-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></div>
              <span className="text-[10px] text-emerald-700 font-black uppercase tracking-widest">Ativo</span>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 relative z-10 w-full">
            <div className="flex items-center gap-4 group-hover:-translate-y-0.5 transition-transform duration-300 delay-75">
              <div className="w-10 h-10 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-600 shadow-sm border border-slate-200/50">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">WhatsApp</p>
                <p className="text-[15px] font-bold text-slate-800">{tech.whatsapp}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group-hover:-translate-y-0.5 transition-transform duration-300 delay-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50/80 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                <Briefcase size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Especialidade</p>
                <p className="text-[15px] font-bold text-slate-800">{tech.specialty}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group-hover:-translate-y-0.5 transition-transform duration-300 delay-150">
              <div className="w-10 h-10 rounded-2xl bg-amber-50/80 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100/50">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Regiões</p>
                <p className="text-[14px] font-bold text-slate-800 leading-tight">{tech.regions.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group-hover:-translate-y-0.5 transition-transform duration-300 delay-200">
              <div className="w-10 h-10 rounded-2xl bg-purple-50/80 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100/50">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1.5">Dias de Trabalho</p>
                <div className="flex flex-wrap gap-1.5">
                  {tech.work_days.map((day, j) => (
                    <span key={j} className="px-2.5 py-1 rounded-lg bg-slate-100/80 border border-slate-200/60 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center relative z-10 w-full backdrop-blur-sm">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest bg-white/60 px-2.5 py-1 rounded-lg border border-slate-200/50">15 agendamentos</span>
            <button 
              onClick={() => onNavigate('calendar')}
              className="text-[11px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1"
            >
              Ver Agenda <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
