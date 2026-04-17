import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Activity,
  CheckCircle2,
  Filter,
  Edit2 } from
'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../../components/UI';
import { mockTasks, mockStaffMembers, mockResidents } from '../../mockData';
import { Task, getFullName } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
export const TaskManagement = () => {
  const { user } = useAuth();
  const branchId = user?.branchId || 'b1';
  const myTasks = mockTasks.filter((t) => t.branchId === branchId);
  const myStaff = mockStaffMembers.filter((s) => s.branchId === branchId);
  const myResidents = mockResidents.filter((r) => r.branchId === branchId);
  const [tasks, setTasks] = useState<Task[]>(myTasks);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const columns = ['Todo', 'In Progress', 'Done', 'Deferred'] as const;
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
  const getTaskCategoryColor = (category: string) => {
    switch (category) {
      case 'Medication':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Bathing':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Vitals':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Therapy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Observation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Meal':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };
  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Board</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track care tasks across the facility.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <Filter className="h-4 w-4" />
            <select
              className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}>
              
              <option value="All">All Categories</option>
              <option value="Medication">Medication</option>
              <option value="Bathing">Bathing</option>
              <option value="Vitals">Vitals</option>
              <option value="Therapy">Therapy</option>
              <option value="Observation">Observation</option>
              <option value="Meal">Meal</option>
              <option value="General">General</option>
            </select>
          </div>
          <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            Create Task
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 ">
      <div className="flex flex-col md:flex-row gap-6 md:h-full md:min-w-[1000px]">
          {columns.map((column) => {
            const columnTasks = tasks.filter(
              (t) =>
              t.status === column && (
              categoryFilter === 'All' || t.category === categoryFilter)
            );
            return (
              <div
                key={column}
                className="flex-1 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200 overflow-hidden transition-colors"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}>
                
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 pointer-events-none">
                  <h2 className="font-semibold text-slate-700">{column}</h2>
                  <Badge variant="default">{columnTasks.length}</Badge>
                </div>

                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  <AnimatePresence>
                    {columnTasks.map((task) => {
                      const assignedStaff = myStaff.find(
                        (s) => s.id === task.assignedTo
                      );
                      const resident = myResidents.find(
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
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-slate-900 text-sm">
                                {task.title}
                              </h3>
                            </div>
                            {column === 'Todo' &&
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-brand-600 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            }
                          </div>

                          <div className="mb-3">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getTaskCategoryColor(task.category)}`}>
                              
                              {task.category}
                            </span>
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
                                
                                {new Date(task.dueDate).toLocaleDateString()}{' '}
                                {new Date(task.dueDate).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            {assignedStaff ?
                            <div
                              className="flex items-center gap-1.5"
                              title={`Assigned to ${getFullName(assignedStaff)}`}>
                              
                                <div className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-medium text-brand-700">
                                  {assignedStaff.firstName[0]}
                                  {assignedStaff.lastName[0]}
                                </div>
                                <span className="text-xs text-slate-600 truncate max-w-[80px]">
                                  {assignedStaff.firstName}
                                </span>
                              </div> :

                            <span className="text-xs text-slate-400 italic">
                                Unassigned
                              </span>
                            }

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {column !== 'Todo' &&
                              <button
                                onClick={() => moveTask(task.id, 'Todo')}
                                className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                                title="Move to Todo">
                                
                                  <Clock className="h-3.5 w-3.5" />
                                </button>
                              }
                              {column !== 'In Progress' &&
                              <button
                                onClick={() =>
                                moveTask(task.id, 'In Progress')
                                }
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="Move to In Progress">
                                
                                  <Activity className="h-3.5 w-3.5" />
                                </button>
                              }
                              {column !== 'Done' &&
                              <button
                                onClick={() => moveTask(task.id, 'Done')}
                                className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                title="Mark Done">
                                
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </button>
                              }
                            </div>
                          </div>
                        </motion.div>);

                    })}
                  </AnimatePresence>
                  {columnTasks.length === 0 &&
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
                      <span className="text-sm text-slate-400">No tasks</span>
                    </div>
                  }
                </div>
              </div>);

          })}
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Task">
        
        <div className="space-y-4">
          <Input label="Task Title" placeholder="e.g. Administer Medication" />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
              <option value="Medication">Medication</option>
              <option value="Bathing">Bathing</option>
              <option value="Vitals">Vitals</option>
              <option value="Therapy">Therapy</option>
              <option value="Observation">Observation</option>
              <option value="Meal">Meal</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[80px] resize-y"
              placeholder="Task details...">
            </textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Assign To
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                <option value="">Unassigned</option>
                {myStaff.map((s) =>
                <option key={s.id} value={s.id}>
                    {getFullName(s)}
                  </option>
                )}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Resident
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                <option value="">None</option>
                {myResidents.map((r) =>
                <option key={r.id} value={r.id}>
                    {getFullName(r)}
                  </option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Priority
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            <Input label="Due Date & Time" type="datetime-local" />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddModalOpen(false)}>
              Create Task
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task">
        
        {selectedTask &&
        <div className="space-y-4">
            <Input label="Task Title" defaultValue={selectedTask.title} />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              rows={3}
              defaultValue={selectedTask.description}>
            </textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                defaultValue={selectedTask.category}>
                
                  <option value="Medication">Medication</option>
                  <option value="Bathing">Bathing</option>
                  <option value="Vitals">Vitals</option>
                  <option value="Therapy">Therapy</option>
                  <option value="Observation">Observation</option>
                  <option value="Meal">Meal</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Assign To
                </label>
                <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                defaultValue={selectedTask.assignedTo || ''}>
                
                  <option value="">Unassigned</option>
                  {myStaff.map((s) =>
                <option key={s.id} value={s.id}>
                      {getFullName(s)}
                    </option>
                )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
              label="Due Date & Time"
              type="datetime-local"
              defaultValue={selectedTask.dueDate.slice(0, 16)} />
            
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}>
              
                Cancel
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        }
      </Modal>
    </div>);

};