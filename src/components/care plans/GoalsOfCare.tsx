// Goals of Care Component (Editable list, per‑row inline edit)
import { useState } from 'react';
import { mockGoals, mockResidents } from '../../mockData';
import { Card, Badge, Button } from '../UI';
import { Target, Edit2, Save, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

export const GoalsOfCare = ({ residentId }: { residentId: string }) => {
    if (!residentId) return null;
    const resident = mockResidents.find(r => r.id === residentId);
    if (!resident) return null;
    const [goals, setGoals] = useState(() => {
      return mockGoals.filter(g => g.residentId === residentId);
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
      description: '',
      targetMetric: '',
      timeframe: '',
      responsibleRole: '',
    });
  
    const startEdit = (goal: typeof goals[0]) => {
      setEditingId(goal.id);
      setEditForm({
        description: goal.description,
        targetMetric: goal.targetMetric,
        timeframe: goal.timeframe,
        responsibleRole: goal.responsibleRole,
      });
    };
  
    const cancelEdit = () => {
      setEditingId(null);
    };
  
    const saveEdit = (id: string) => {
      setGoals(prev =>
        prev.map(g =>
          g.id === id
            ? { ...g, ...editForm }
            : g
        )
      );
      toast.success('Goal updated (dummy)');
      setEditingId(null);
    };
  
    const deleteGoal = (id: string) => {
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal deleted (dummy)');
    };
  
    const addNewGoal = () => {
      const newId = `g${Date.now()}`;
      const newGoal = {
        id: newId,
        residentId,
        description: 'New goal',
        targetMetric: 'TBD',
        timeframe: '1 month',
        responsibleRole: 'Nurse',
        status: 'Active',
      };
      setGoals(prev => [...prev, newGoal]);
      toast.success('New goal added (dummy)');
    };
  
    return (
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-500" />
            Goals of Care
          </h2>
          <Button size="sm" icon={Plus} onClick={addNewGoal}>
            Add Goal
          </Button>
        </div>
  
        {goals.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No goals defined yet.</p>
        ) : (
          <div className="space-y-4">
            {goals.map(goal => (
              <div key={goal.id} className="border border-slate-200 rounded-lg p-4">
                {editingId === goal.id ? (
                  // Edit mode: inline form
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500">Description</label>
                      <input
                        type="text"
                        className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500">Target Metric</label>
                        <input
                          type="text"
                          className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                          value={editForm.targetMetric}
                          onChange={(e) => setEditForm({ ...editForm, targetMetric: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500">Timeframe</label>
                        <input
                          type="text"
                          className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                          value={editForm.timeframe}
                          onChange={(e) => setEditForm({ ...editForm, timeframe: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500">Responsible Staff Role</label>
                      <select
                        className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                        value={editForm.responsibleRole}
                        onChange={(e) => setEditForm({ ...editForm, responsibleRole: e.target.value })}
                      >
                        <option>Nurse</option>
                        <option>Physiotherapist</option>
                        <option>Memory Care Specialist</option>
                        <option>Caregiver</option>
                        <option>Doctor</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                      <Button size="sm" onClick={() => saveEdit(goal.id)}>Save</Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{goal.description}</p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                          <div>
                            <span className="text-slate-500">Target:</span>{' '}
                            <span className="font-medium text-slate-700">{goal.targetMetric}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Timeframe:</span>{' '}
                            <span className="font-medium text-slate-700">{goal.timeframe}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Responsible:</span>{' '}
                            <span className="font-medium text-slate-700">{goal.responsibleRole}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(goal)}
                          className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {goal.status && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          {goal.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };