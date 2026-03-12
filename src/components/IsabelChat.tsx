import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Message } from '../types';
import { COMPANY_INFO, SERVICES, TECHNICIANS } from '../constants';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { appointmentService } from '../services/appointmentService';

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export default function IsabelChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! 👋 Aqui é a Isabel, da JR Climatização! Como posso te ajudar hoje?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const model = 'gemini-3-flash-preview';
      
      const createAppointmentTool = {
        functionDeclarations: [
          {
            name: 'create_appointment',
            description: 'Registra um novo agendamento no sistema da JR Refrigeração.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                client_name: { type: Type.STRING, description: 'Nome completo do cliente' },
                client_whatsapp: { type: Type.STRING, description: 'Número de WhatsApp do cliente' },
                address: { type: Type.STRING, description: 'Endereço completo para a visita' },
                equipment_type: { type: Type.STRING, description: 'Tipo de equipamento (ex: Split 12k BTUs)' },
                problem_description: { type: Type.STRING, description: 'Descrição do problema ou serviço' },
                service_id: { type: Type.STRING, description: 'ID do serviço (instalacao, limpeza, recarga_gas, manutencao_preventiva, manutencao_corretiva, desinstalacao_reinstalacao)' },
                technician_id: { type: Type.STRING, description: 'ID do técnico sugerido (leomar, haylan, rozenilson)' },
                scheduled_at: { type: Type.STRING, description: 'Data e hora no formato ISO (ex: 2026-03-10T09:00:00Z)' },
                payment_method: { type: Type.STRING, description: 'Forma de pagamento (PIX, crédito, débito, dinheiro)' },
              },
              required: ['client_name', 'client_whatsapp', 'address', 'equipment_type', 'problem_description', 'service_id', 'technician_id', 'scheduled_at'],
            },
          },
        ],
      };

      const prompt = `
        Você é a Isabel, a assistente virtual da JR Refrigeração. 
        Seu tom de voz deve ser simpático, ágil, prestativo, direto e profissional.
        Use emojis com moderação.
        
        Informações da Empresa:
        - Nome: ${COMPANY_INFO.name}
        - Serviços: ${SERVICES.map((s) => `${s.name} (ID: ${s.id})`).join(', ')}
        - Técnicos: ${TECHNICIANS.map((t) => `${t.name} (ID: ${t.id})`).join(', ')}
        - Cidades: ${COMPANY_INFO.cities.join(', ')}
        - Horário: Seg-Sex ${COMPANY_INFO.working_hours.weekdays}, Sáb ${COMPANY_INFO.working_hours.saturday}
        - Taxa de Visita: R$ ${COMPANY_INFO.visit_fee},00 (descontada do serviço se aprovado)
        
        Fluxo de Agendamento:
        1. Identificar o problema.
        2. Identificar o equipamento e coletar endereço, forma de pagamento e nome do solicitante.
        3. Verificar disponibilidade (simule que você está verificando).
        4. Confirmar o agendamento chamando a função 'create_appointment'.
        
        Limites:
        - Nunca invente preços.
        - Nunca prometa data/hora sem confirmar.
        - Se perguntada se é IA, contorne naturalmente.
        - Não faça orçamentos complexos (encaminhe ao técnico).
        
        Histórico da conversa:
        ${messages.map((m) => `${m.role === 'user' ? 'Cliente' : 'Isabel'}: ${m.content}`).join('\n')}
        Cliente: ${input}
        Isabel:
      `;

      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
        config: {
          tools: [createAppointmentTool],
        },
      });

      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'create_appointment') {
            try {
              const args = call.args as any;
              
              if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
                setMessages((prev) => [
                  ...prev,
                  { role: 'assistant', content: `⚠️ Notei que o Supabase não está configurado. Simulei o agendamento para ${args.client_name} em ${new Date(args.scheduled_at).toLocaleString('pt-BR')}, mas ele não foi salvo no banco de dados.` },
                ]);
                return;
              }

              await appointmentService.create({
                ...args,
                status: 'confirmed',
              });
              
              setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: `✅ Perfeito! Agendamento confirmado para ${args.client_name} em ${new Date(args.scheduled_at).toLocaleString('pt-BR')}. Nossa equipe entrará em contato em breve!` },
              ]);
            } catch (err) {
              console.error('Error creating appointment:', err);
              setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Ops! Tive um problema ao registrar seu agendamento no sistema. Pode me passar os dados novamente?' },
              ]);
            }
          }
        }
      } else {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.text || 'Desculpe, tive um problema ao processar sua mensagem.',
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ops! Tive um probleminha técnico. Pode repetir?' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card w-full h-full flex flex-col overflow-hidden border border-slate-200/50 shadow-sm relative">
      <div className="premium-gradient p-4 sm:p-5 text-white flex items-center gap-3 sm:gap-4 relative z-10">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30 shrink-0">
          <Bot size={24} className="sm:w-7 sm:h-7" />
        </div>
        <div>
          <h3 className="font-black text-base sm:text-lg tracking-wide">Isabel</h3>
          <p className="text-[10px] sm:text-[11px] text-emerald-100 font-bold uppercase tracking-widest">Assistente Virtual</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 custom-scrollbar relative z-0">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-3xl text-[15px] leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'premium-gradient text-white rounded-tr-sm'
                    : 'bg-white text-slate-700 border border-slate-200/60 rounded-tl-sm'
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-3xl rounded-tl-sm shadow-sm border border-slate-200/60 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-5 bg-white/60 backdrop-blur-md border-t border-slate-100 flex gap-2 sm:gap-3 relative z-10 w-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Mensagem..."
          className="flex-1 bg-white/80 border border-slate-200/80 shadow-sm rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="premium-gradient text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center"
        >
          <Send size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
