import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Check, 
  Trash2, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  Camera, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ScheduleItem } from '../types';

export const ScheduleView: React.FC = () => {
  const { schedule, addScheduleItem, toggleScheduleItem, deleteScheduleItem, showToast } = useStore();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [type, setType] = useState<ScheduleItem['type']>('entrega');
  const [description, setDescription] = useState('');
  const [selectedFilterType, setSelectedFilterType] = useState<string>('TODOS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Month navigation for visual calendar
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const taskTypes: Array<{ id: ScheduleItem['type']; label: string; icon: React.ElementType; color: string }> = [
    { id: 'compras', label: 'Compras / Fornecedor', icon: ShoppingBag, color: 'bg-purple-100 text-purple-800' },
    { id: 'postagem', label: 'Postar Novidades / Redes', icon: Camera, color: 'bg-pink-100 text-pink-800' },
    { id: 'entrega', label: 'Entrega para Cliente', icon: Truck, color: 'bg-blue-100 text-blue-800' },
    { id: 'pagamento', label: 'Pagamento / Fornecedor', icon: CreditCard, color: 'bg-amber-100 text-amber-800' },
    { id: 'lembrete', label: 'Lembrete Geral', icon: Bell, color: 'bg-emerald-100 text-emerald-800' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Digite o título do compromisso', 'warning');
      return;
    }

    setIsSubmitting(true);
    await addScheduleItem({
      title: title.trim(),
      date,
      time: time || undefined,
      type,
      description: description.trim() || undefined,
      completed: false,
    });
    setIsSubmitting(false);

    setTitle('');
    setDescription('');
  };

  const filteredSchedule = schedule.filter((item) => {
    if (selectedFilterType === 'TODOS') return true;
    return item.type === selectedFilterType;
  });

  const pendingItems = filteredSchedule.filter((i) => !i.completed);
  const completedItems = filteredSchedule.filter((i) => i.completed);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D9C5B2] pb-5">
        <div>
          <span className="text-[10px] uppercase font-semibold tracking-[0.3em] opacity-60 block mb-1">
            Planejamento & Rotina
          </span>
          <h1 className="font-serif text-2xl md:text-4xl font-light text-[#3D2B1F]">
            Agenda da Loja
          </h1>
          <p className="text-xs text-[#8C7A6B] mt-1 font-light">
            Organize compras, entregas, pagamentos de fornecedores e postagens nas redes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-[#FAF8F5] text-[#3D2B1F] text-[10px] uppercase tracking-widest font-medium rounded-sm border border-[#D9C5B2]">
            {pendingItems.length} pendentes
          </span>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 text-[10px] uppercase tracking-widest font-medium rounded-sm border border-emerald-200">
            {completedItems.length} concluídas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ADD TASK FORM (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-sm p-6 border border-[#D9C5B2] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9C5B2]">
            <Plus className="w-4 h-4 text-[#3D2B1F]" />
            <h3 className="font-serif text-lg font-normal text-[#3D2B1F]">
              Novo Compromisso
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                Título do Compromisso *
              </label>
              <input
                id="schedule-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Entrega Vestido Midi - Luiza"
                className="w-full px-3.5 py-2.5 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
              />
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1.5">
                Tipo de Tarefa
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {taskTypes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`p-2 rounded-sm text-[10px] uppercase tracking-wider font-medium flex items-center gap-2 transition-all text-left ${
                        isSelected
                          ? 'bg-[#3D2B1F] text-white shadow-2xs'
                          : 'bg-[#F9F7F5] text-[#3D2B1F] border border-[#D9C5B2] hover:bg-[#F0EBE6]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#D9C5B2]' : 'text-[#8C7A6B]'}`} />
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  Data
                </label>
                <input
                  id="schedule-date-input"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                  Horário (Opcional)
                </label>
                <input
                  id="schedule-time-input"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#3D2B1F] mb-1">
                Observações Adicionais
              </label>
              <textarea
                id="schedule-desc-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Endereço de entrega, valor do frete, ou detalhes..."
                className="w-full px-3 py-2 bg-[#F9F7F5] border border-[#D9C5B2] rounded-sm text-xs text-[#3D2B1F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3D2B1F]"
              />
            </div>

            {/* Submit */}
            <button
              id="submit-schedule-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-sm bg-[#3D2B1F] hover:bg-[#2C1F16] text-white text-[10px] uppercase tracking-widest font-medium shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-[#D9C5B2]" />
              <span>{isSubmitting ? 'Salvando...' : 'Adicionar à Agenda'}</span>
            </button>
          </form>
        </div>

        {/* SCHEDULE LIST (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Types Bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedFilterType('TODOS')}
              className={`px-3 py-1 rounded-sm text-[10px] uppercase tracking-widest font-medium shrink-0 transition-all ${
                selectedFilterType === 'TODOS'
                  ? 'bg-[#3D2B1F] text-white'
                  : 'bg-white text-[#3D2B1F] border border-[#D9C5B2]'
              }`}
            >
              Todas as Tarefas
            </button>
            {taskTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedFilterType(t.id)}
                className={`px-3 py-1 rounded-sm text-[10px] uppercase tracking-widest font-medium shrink-0 transition-all ${
                  selectedFilterType === t.id
                    ? 'bg-[#3D2B1F] text-white'
                    : 'bg-white text-[#3D2B1F] border border-[#D9C5B2]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Pending Tasks Section */}
          <div className="bg-white rounded-sm p-5 border border-[#D9C5B2] shadow-2xs space-y-3">
            <h3 className="font-serif text-base font-normal text-[#3D2B1F] flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#8C7A6B]" />
              Compromissos Pendentes ({pendingItems.length})
            </h3>

            {pendingItems.length > 0 ? (
              <div className="space-y-2.5">
                {pendingItems.map((item) => {
                  const typeObj = taskTypes.find((t) => t.id === item.type);

                  return (
                    <div
                      key={item.id}
                      id={`schedule-item-${item.id}`}
                      className="p-3.5 rounded-sm bg-[#FAF8F5] border border-[#D9C5B2] hover:border-[#3D2B1F] transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Toggle Checkbox */}
                        <button
                          id={`toggle-task-${item.id}`}
                          onClick={() => toggleScheduleItem(item.id)}
                          className="w-4 h-4 rounded-sm border border-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white transition-colors flex items-center justify-center shrink-0 mt-0.5"
                          title="Marcar como concluído"
                        >
                          {item.completed && <Check className="w-3 h-3" />}
                        </button>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded-sm text-[9px] uppercase tracking-wider font-semibold bg-[#F0EBE6] text-[#3D2B1F]">
                              {typeObj?.label}
                            </span>
                            <span className="text-[10px] font-mono text-[#8C7A6B]">
                              📅 {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR')} {item.time && `às ${item.time}`}
                            </span>
                          </div>

                          <h4 className="font-serif text-sm font-normal text-[#3D2B1F]">
                            {item.title}
                          </h4>

                          {item.description && (
                            <p className="text-xs text-[#8C7A6B] leading-relaxed font-light">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteScheduleItem(item.id)}
                        className="p-1 text-[#8C7A6B] hover:text-red-700 rounded-sm transition-colors opacity-80 group-hover:opacity-100 shrink-0"
                        title="Excluir compromisso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[#8C7A6B] font-serif italic">
                Nenhum compromisso pendente. Agenda em dia.
              </div>
            )}
          </div>

          {/* Completed Tasks Section */}
          {completedItems.length > 0 && (
            <div className="bg-[#FAF8F5] rounded-sm p-5 border border-[#D9C5B2] space-y-3">
              <h3 className="font-serif text-sm font-normal text-[#8C7A6B] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                Concluídos Recentemente ({completedItems.length})
              </h3>

              <div className="space-y-2">
                {completedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-sm bg-white border border-[#D9C5B2] flex items-center justify-between gap-2 opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => toggleScheduleItem(item.id)}
                        className="w-3.5 h-3.5 rounded-sm bg-emerald-800 text-white flex items-center justify-center shrink-0"
                      >
                        <Check className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs line-through text-[#8C7A6B] truncate font-light">
                        {item.title}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteScheduleItem(item.id)}
                      className="p-1 text-[#8C7A6B] hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
