import React, { useRef, useState } from 'react';
import { LuPencil, LuTrash2, LuCheck } from 'react-icons/lu';
import ModuleTag from '../ui/ModuleTag';
import { getPriority, getEffectivePriority, PRIORITY_CONFIG, PRIORITY_ORDER } from '../../utils/priority';
import type { Priority } from '../../utils/priority';
import type { Reminder } from '../../types';
import { formatAmount } from '../../utils/currency';

interface Props {
  reminders: Reminder[];
  country: string;
  onEdit: (r: Reminder) => void;
  onDelete: (id: string) => void;
  onToggle: (r: Reminder) => void;
  onMovePriority: (reminder: Reminder, newPriority: Priority) => Promise<void>;
}

const COLUMN_GRADIENTS: Record<Priority, string> = {
  CRITICAL: 'from-red-500 to-rose-600',
  HIGH:     'from-orange-400 to-amber-500',
  MEDIUM:   'from-yellow-400 to-yellow-500',
  LOW:      'from-green-400 to-emerald-500',
};

const KanbanBoard: React.FC<Props> = ({ reminders, country, onEdit, onDelete, onToggle, onMovePriority }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<Priority | null>(null);
  const dragPriority = useRef<Priority | null>(null);

  const grouped = PRIORITY_ORDER.reduce<Record<Priority, Reminder[]>>((acc, p) => {
    acc[p] = reminders.filter((r) => getEffectivePriority(r) === p);
    return acc;
  }, { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] });

  const handleDragStart = (e: React.DragEvent, r: Reminder) => {
    setDraggingId(r.id);
    dragPriority.current = getEffectivePriority(r);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', r.id);
  };

  const handleDragOver = (e: React.DragEvent, col: Priority) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverColumn(col);
  };

  const handleDrop = async (e: React.DragEvent, col: Priority) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    // Clear drag state immediately so the card stops being greyed out
    setDraggingId(null);
    setOverColumn(null);
    dragPriority.current = null;

    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;
    // Compute priority from actual data — ref can be stale/null on drop
    if (getPriority(reminder.dueDate, reminder.completed) === col) return;

    await onMovePriority(reminder, col);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverColumn(null);
    dragPriority.current = null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {PRIORITY_ORDER.map((col) => {
        const cfg = PRIORITY_CONFIG[col];
        const cards = grouped[col];
        const isOver = overColumn === col;

        return (
          <div
            key={col}
            onDragOver={(e) => handleDragOver(e, col)}
            onDrop={(e) => handleDrop(e, col)}
            onDragLeave={() => setOverColumn(null)}
            className={`flex flex-col rounded-2xl border-2 transition-all duration-200 ${
              isOver
                ? `${cfg.border} shadow-xl scale-[1.01]`
                : 'border-transparent'
            }`}
          >
            {/* Column header */}
            <div className={`bg-linear-to-r ${COLUMN_GRADIENTS[col]} rounded-t-xl px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{cfg.emoji}</span>
                <span className="font-bold text-white text-sm tracking-wide">{cfg.label}</span>
              </div>
              <span className="bg-white/25 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {cards.length}
              </span>
            </div>

            {/* Drop zone */}
            <div
              className={`flex-1 min-h-40 rounded-b-xl p-2 space-y-2 transition-colors duration-200 ${
                isOver
                  ? `${cfg.bg} border-2 border-dashed ${cfg.border}`
                  : 'bg-slate-50/80 dark:bg-slate-800/50'
              }`}
            >
              {cards.length === 0 && (
                <div className="flex items-center justify-center h-24 text-slate-300 dark:text-slate-600 text-xs">
                  Drop here
                </div>
              )}

              {cards.map((r) => {
                const isDragging = draggingId === r.id;
                const today = new Date().toISOString().split('T')[0];
                const isOverdue = !r.completed && r.dueDate < today;

                return (
                  <div
                    key={r.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, r)}
                    onDragEnd={handleDragEnd}
                    className={`group relative bg-white dark:bg-slate-900 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                      isDragging ? 'opacity-40 scale-95' : 'opacity-100 hover:-translate-y-0.5'
                    } ${cfg.border}`}
                    style={{ borderLeftColor: cfg.color }}
                  >
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className={`text-sm font-semibold text-slate-800 dark:text-white leading-tight ${r.completed ? 'line-through opacity-60' : ''}`}>
                          {r.title}
                        </p>
                        <button
                          onClick={() => onToggle(r)}
                          className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            r.completed
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                          }`}
                        >
                          {r.completed && <LuCheck className="w-3 h-3 text-white" />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <ModuleTag module={r.module} />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {formatAmount(r.amount, country)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                          {isOverdue ? '⚠️ ' : '📅 '}{r.dueDate}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(r)}
                            className="p-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors"
                          >
                            <LuPencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(r.id)}
                            className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 transition-colors"
                          >
                            <LuTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
