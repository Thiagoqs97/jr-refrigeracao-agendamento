/**
 * Utilitários para manipulação de datas e outras funções comuns
 */

/**
 * Compara se duas datas são do mesmo dia, considerando o fuso horário local.
 * Aceita Date ou string (ISO ou formatada).
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Formata uma data para o padrão brasileiro (DD/MM/YYYY)
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

/**
 * Formata um horário para o padrão brasileiro (HH:mm)
 */
export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};
