import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button, Card, Input } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/taskService';
import { residentService } from '../../services/residentService';
import { usersService } from '../../services/usersService';
import type { Resident, Task, User as AppUser } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';

export const CreateTask = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const isBranchAdmin = user?.role === 'admin';
  const basePath = '/admin';

  const [residents, setResidents] = useState<Resident[]>([]);
  const [staffMembers, setStaffMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'General' as Task['category'],
    description: '',
    residentId: '',
    assignedToId: '',
    dueDate: '',
  });

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const [allResidents, users] = await Promise.all([
          residentService.getAllResidents(),
          usersService.getAllUsers(),
        ]);

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
        const message = getApiErrorMessage(err, 'Failed to load task form data');
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [toast, user?.branchId]);

  const pageTitle = 'Create Task';
  const pageDescription = 'Assign a task to a staff member and set a due date.';

  const canSubmit = useMemo(() => {
    return Boolean(
      user?.branchId &&
        user?.facilityId &&
        form.title.trim() &&
        form.residentId &&
        form.assignedToId &&
        form.dueDate,
    );
  }, [form.assignedToId, form.dueDate, form.residentId, form.title, user?.branchId, user?.facilityId]);

  const handleSubmit = async () => {
    if (!isBranchAdmin) {
      toast.error('Only branch admins can create tasks.');
      return;
    }
    if (!canSubmit || !user?.branchId || !user?.facilityId) {
      const message = 'Please fill all required fields.';
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await taskService.createTask({
        residentId: form.residentId,
        branchId: user.branchId,
        facilityId: user.facilityId,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        status: 'Todo',
        dueDate: new Date(form.dueDate).toISOString(),
        assignedToId: form.assignedToId,
      });
      toast.success('Task created successfully.');
      navigate(`${basePath}/tasks`);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to create task');
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isBranchAdmin) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <p className="text-sm text-slate-700">Only branch admins can create tasks.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`${basePath}/tasks`}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">{pageDescription}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`${basePath}/tasks`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button icon={Save} isLoading={isSubmitting} onClick={handleSubmit} disabled={!canSubmit}>
            Create Task
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Assignment</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Assign To *</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                  value={form.assignedToId}
                  onChange={(e) => setForm((p) => ({ ...p, assignedToId: e.target.value }))}
                  disabled={loading}
                >
                  <option value="">{loading ? 'Loading staff…' : 'Select staff'}</option>
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Resident *</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                  value={form.residentId}
                  onChange={(e) => setForm((p) => ({ ...p, residentId: e.target.value }))}
                  disabled={loading}
                >
                  <option value="">{loading ? 'Loading residents…' : 'Select resident'}</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.firstName} {r.lastName} (Rm {r.room})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Task Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Title *"
                  placeholder="e.g. Administer Medication"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value as Task['category'] }))
                  }
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

              <Input
                label="Due Date *"
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              />

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[110px] resize-y bg-white"
                  placeholder="Task details..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

