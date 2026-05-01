import { useEffect, useState } from 'react';
import { Plus, Calendar, User, Filter, Eye, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { Button, Badge, Modal, Input } from '../../components/UI';
import { Task, getFullName, Resident, User as AppUser } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/taskService';
import { residentService } from '../../services/residentService';
import { usersService } from '../../services/usersService';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';

type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export const TaskManagements = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isBranchAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  const [taskList, setTaskList] = useState<Task[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [staffMembers, setStaffMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    title: '',
    category: 'General' as Task['category'],
    description: '',
    residentId: '',
    assignedToId: '',
    dueDate: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [tasks, allResidents, users] = await Promise.all([
          taskService.getAllTasks(),
          residentService.getAllResidents(),
          usersService.getAllUsers(),
        ]);

        setTaskList(tasks);
        setResidents(allResidents);
        setStaffMembers(
          users.filter((u) => {
            const normalizedRole = String(u.role || '').toLowerCase();
            const isStaffRole = normalizedRole === 'staff';
            const sameBranch = !user?.branchId || u.branchId === user.branchId;
            return isStaffRole && sameBranch;
          }),
        );
      } catch (err) {
        const message = getApiErrorMessage(err, 'Failed to load task data');
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.branchId]);

  const columns: TaskStatus[] = ['Todo', 'In Progress', 'Done'];

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      moveTask(draggedTaskId, newStatus);
      setDraggedTaskId(null);
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    const current = taskList.find((t) => t.id === taskId);
    if (!current) return;
    setTaskList((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      const updated = await taskService.updateTask(taskId, { status: newStatus });
      setTaskList((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      setTaskList((prev) => prev.map((t) => (t.id === taskId ? current : t)));
      const message = getApiErrorMessage(err, 'Failed to update task status');
      setError(message);
      toast.error(message);
    }
  };

  const handleCreateTask = async () => {
    if (!user?.branchId || !user?.facilityId) return;
    if (!createForm.title || !createForm.residentId || !createForm.assignedToId || !createForm.dueDate) {
      const message = 'Please fill all required fields.';
      setError(message);
      toast.error(message);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await taskService.createTask({
        residentId: createForm.residentId,
        branchId: user.branchId,
        facilityId: user.facilityId,
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        category: createForm.category,
        status: 'Todo',
        dueDate: new Date(createForm.dueDate).toISOString(),
        assignedToId: createForm.assignedToId,
      });
      setTaskList((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setCreateForm({
        title: '',
        category: 'General',
        description: '',
        residentId: '',
        assignedToId: '',
        dueDate: '',
      });
      toast.success('Task created successfully.');
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to create task');
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isStaff ? 'My Tasks' : 'Task Board'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isStaff
              ? 'Manage your assigned tasks for today.'
              : 'Manage and track care tasks across the facility.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <Filter className="h-4 w-4" />
            <select
              className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {isBranchAdmin && (
            <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
              Create Task
            </Button>
          )}
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TASK BOARD */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex flex-col md:flex-row gap-6 md:h-full md:min-w-[1000px]">
          {columns.map((column) => {
            const columnTasks = taskList.filter(
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
                      const assignedStaff = staffMembers.find((s) => s.id === task.assignedTo);
                      const resident = residents.find(
                        (r) => r.id === task.residentId
                      );

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow group ${!isStaff ? 'cursor-grab active:cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
                            } ${draggedTaskId === task.id ? 'border-brand-500 ring-1 ring-brand-500 opacity-50' : 'border-slate-200'}`}
                          draggable={true}   
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={() => setDraggedTaskId(null)}>

                          {/* Task Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getTaskCategoryColor(task.category)}`}>
                                  {task.category}
                                </span>
                              </div>
                              <h3 className="font-medium text-slate-900 text-sm">
                                {task.title}
                              </h3>
                            </div>

                            {isStaff && (
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsViewModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-brand-600 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                            {task.description}
                          </p>

                          {/* Task Details */}
                          <div className="space-y-2 mb-4">
                            {resident && (
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <User className="h-3.5 w-3.5 text-slate-400" />
                                <span>
                                  {getFullName(resident)} (Rm {resident.room})
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span
                                className={
                                  new Date(task.dueDate) < new Date() &&
                                    task.status !== 'Done' ?
                                    'text-red-600 font-medium' :
                                    ''
                                }>
                                {new Date(task.dueDate).toLocaleDateString()} {' '}
                                {new Date(task.dueDate).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Footer with assignee and actions */}
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            {assignedStaff ? (
                              <div
                                className="flex items-center gap-1.5"
                                title={`Assigned to ${getFullName(assignedStaff)}`}>
                                <div className="h-6 w-6 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-medium text-brand-700">
                                  {assignedStaff.firstName?.[0]}
                                  {assignedStaff.lastName?.[0]}
                                </div>
                                <span className="text-xs text-slate-600 truncate max-w-[80px]">
                                  {assignedStaff.firstName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                Unassigned
                              </span>
                            )}

                            {/* Move buttons - only for admins */}
                            {isBranchAdmin && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {column !== 'Todo' && (
                                  <button
                                    onClick={() => moveTask(task.id, 'Todo')}
                                    className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                                    title="Move to Todo">
                                    <Clock className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {column !== 'In Progress' && (
                                  <button
                                    onClick={() => moveTask(task.id, 'In Progress')}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Move to In Progress">
                                    <Activity className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {column !== 'Done' && (
                                  <button
                                    onClick={() => moveTask(task.id, 'Done')}
                                    className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                    title="Mark Done">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {columnTasks.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
                      <span className="text-sm text-slate-400">No tasks</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isBranchAdmin && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Task">
          <div className="space-y-4">
            <Input
              label="Task Title"
              placeholder="e.g. Administer Medication"
              value={createForm.title}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                value={createForm.category}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value as Task['category'] }))}
              >
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
                placeholder="Task details..."
                value={createForm.description}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Assign To
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                  value={createForm.assignedToId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, assignedToId: e.target.value }))}
                >
                  <option value="">Select staff</option>
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {getFullName(s)} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Resident
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                  value={createForm.residentId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, residentId: e.target.value }))}
                >
                  <option value="">Select resident</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {getFullName(r)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Due Date & Time"
              type="datetime-local"
              value={createForm.dueDate}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            />

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                {submitting ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW TASK MODAL - Only for staff */}
      {isStaff && selectedTask && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Task Details">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <p className="text-slate-900">{selectedTask.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <span className={`inline-flex text-xs px-2 py-1 rounded border ${getTaskCategoryColor(selectedTask.category)}`}>
                {selectedTask.category}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <p className="text-slate-600 text-sm">{selectedTask.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Resident
                </label>
                <p className="text-slate-600 text-sm">
                  {residents.find(r => r.id === selectedTask.residentId)
                    ? getFullName(residents.find(r => r.id === selectedTask.residentId) as Resident)
                    : 'None'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <p className="text-slate-600 text-sm">
                  {new Date(selectedTask.dueDate).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <Button onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {loading && <p className="text-sm text-slate-500">Loading tasks...</p>}
    </div>
  );
};