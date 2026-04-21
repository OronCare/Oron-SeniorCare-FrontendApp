import React, { useState } from 'react';
import { ClipboardList, Calendar, User, Clock, Filter } from 'lucide-react';
import { Card, Badge } from '../../components/UI';
import { mockTasks, mockResidents } from '../../mockData';
import { Task } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullName } from '../../types';

export const StaffTasks = () => {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const [tasks, setTasks] = useState<Task[]>(
    mockTasks.filter(
      (t) => t.assignedTo === user?.id && t.branchId === branchId
    )
  );
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const columns = ['Todo', 'In Progress', 'Done'] as const;

  const moveTask = (taskId: string, newStatus: Task['status']) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ?
        {
          ...t,
          status: newStatus
        } :
        t
      )
    );
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    if (draggedTaskId) {
      moveTask(draggedTaskId, newStatus);
      setDraggedTaskId(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Medication':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Bathing':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Vitals':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Therapy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Observation':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Meal':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const categories = [
    'All',
    'Medication',
    'Bathing',
    'Vitals',
    'Therapy',
    'Observation',
    'Meal',
    'General'
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your assigned tasks for today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
          <Filter className="h-4 w-4" />
          <select
            className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map((c) =>
              <option key={c} value={c}>
                {c}
              </option>
            )}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex flex-col md:flex-row  gap-4 md:h-full md:min-w-[1000px]">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (t) =>
                t.status === column && (
                  categoryFilter === 'All' || t.category === categoryFilter)
            );
            return (
              <div
                key={column}
                className="flex-1 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}>
                
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                  <h2 className="font-semibold text-slate-700">{column}</h2>
                  <Badge variant="default">{columnTasks.length}</Badge>
                </div>

                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  <AnimatePresence>
                    {columnTasks.map((task) => {
                      const resident = mockResidents.find(
                        (r) => r.id === task.residentId
                      );
                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{
                            opacity: 0,
                            y: 20
                          }}
                          animate={{
                            opacity: 1,
                            y: 0
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.9
                          }}
                          className={`bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing ${draggedTaskId === task.id ? 'border-brand-500 ring-1 ring-brand-500 opacity-50' : 'border-slate-200'}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={() => setDraggedTaskId(null)}>
                          
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-col gap-1.5">
                              <span
                                className={`w-fit text-[10px] font-medium px-2 py-0.5 rounded border ${getCategoryColor(task.category)}`}>
                                {task.category}
                              </span>
                              <h3 className="font-medium text-slate-900 text-sm">
                                {task.title}
                              </h3>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                            {task.description}
                          </p>

                          <div className="space-y-2 mb-4">
                            {resident &&
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <User className="h-3.5 w-3.5 text-slate-400" />
                                <span>
                                  {getFullName(resident)} (Rm {resident.room})
                                </span>
                              </div>
                            }
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span
                                className={
                                  new Date(task.dueDate) < new Date() &&
                                  task.status !== 'Done' ?
                                  'text-red-600 font-medium' :
                                  ''
                                }>
                                {new Date(task.dueDate).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {columnTasks.length === 0 &&
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
                      <span className="text-sm text-slate-400">No tasks</span>
                    </div>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};