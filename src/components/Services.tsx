import React from 'react';
import { SERVICES, COMPANY_INFO } from '../constants';
import { Clock, DollarSign, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Services() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {SERVICES.map((service, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card w-full overflow-hidden group hover:shadow-xl transition-all duration-300 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white/80 to-slate-50/50 z-0 pointer-events-none"></div>
          
          <div className="bg-white/40 backdrop-blur-sm p-4 sm:p-6 border-b border-slate-100 relative z-10 w-full">
            <h3 className="text-lg sm:text-xl font-black text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">{service.name}</h3>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-[pulse_2s_ease-in-out_infinite]"></div>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Disponível</span>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 relative z-10 w-full">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50/80 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50 group-hover:bg-emerald-100 group-hover:-translate-y-1 transition-all">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Tempo Médio</p>
                <p className="text-[15px] font-bold text-slate-800">{service.average_time}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50/80 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50 group-hover:bg-emerald-100 group-hover:-translate-y-1 transition-all">
                <DollarSign size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Preço / Faixa</p>
                <p className="text-[15px] font-bold text-slate-800">{service.price_range}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-50/80 flex items-center justify-center text-slate-600 shadow-sm border border-slate-200/50 group-hover:bg-slate-100 group-hover:-translate-y-1 transition-all">
                <Info size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Requer Orçamento Prévio</p>
                <p className="text-[15px] font-bold text-slate-800">{service.requires_quote ? 'Sim' : 'Não'}</p>
              </div>
            </div>
          </div>
          <div className="p-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center relative z-10 w-full backdrop-blur-sm">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Taxa de visita: <span className="text-slate-800">R$ {COMPANY_INFO.visit_fee},00</span></span>
            <button className="text-[11px] bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-black uppercase tracking-wider hover:bg-emerald-200 transition-colors shadow-sm">Solicitar</button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
