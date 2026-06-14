import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAppContext } from '../contexts/AppContext';
import TaskCard from '../components/cards/TaskCard';
import TaskCreateModal from '../components/modals/TaskCreateModal';

export default function TasksPage() {
  const { tasks, isLoading, addTask, toggleTask, deleteTask } = useTasks();
  const { subjects } = useAppContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'pending') return !t.completed;
    if (activeFilter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb] px-4 py-4 space-y-6">
      
      {/* Header card with progress */}
      <div className="bg-gradient-to-br from-[#0058be] to-cyan-500 rounded-[28px] p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-display font-black mb-1">Nhiệm vụ</h1>
            <p className="text-xs font-sans opacity-90">Hoàn thành để nhận điểm kinh nghiệm</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-white">add</span>
          </button>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-end mb-2 text-sm font-sans font-medium">
            <span>Tiến độ ngày</span>
            <span>{completedCount}/{tasks.length}</span>
          </div>
          <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm shrink-0">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'pending', label: 'Chưa làm' },
          { id: 'completed', label: 'Hoàn thành' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`flex-1 py-2 text-xs font-bold font-sans rounded-xl transition-all ${
              activeFilter === filter.id 
                ? 'bg-slate-100 text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pb-4 scroll-hide">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0058be]"></div>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTasks.map(task => (
              <div key={task.id} className="h-full">
                <TaskCard 
                  task={task}
                  onToggle={() => toggleTask(task.id, task.completed)}
                  onDelete={() => deleteTask(task.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <span className="material-symbols-outlined text-3xl">task</span>
            </div>
            <p className="text-slate-500 font-sans text-sm">Không có nhiệm vụ nào.</p>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <TaskCreateModal 
          subjects={subjects}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={addTask}
        />
      )}
    </div>
  );
}
