// Planned Interventions Component (Editable list, per‑row inline edit)
import { useState } from 'react';
import { mockInterventions, mockResidents } from '../../mockData';

import { Card, Badge, Button } from '../UI';
import { Activity, Edit2, Save, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

export const PlannedInterventions = ({ residentId }: { residentId: string }) => {
    if (!residentId) return null;
    const resident = mockResidents.find(r => r.id === residentId);

    const [interventions, setInterventions] = useState(() => {
      return mockInterventions.filter(i => i.residentId === residentId);
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
      description: '',
      responsibleStaffRole: '',
      frequency: '',
      triggerConditions: '',
      effectivenessMetric: '',
    });
  
    const startEdit = (item: typeof interventions[0]) => {
      setEditingId(item.id);
      setEditForm({
        description: item.description,
        responsibleStaffRole: item.responsibleStaffRole,
        frequency: item.frequency,
        triggerConditions: item.triggerConditions,
        effectivenessMetric: item.effectivenessMetric,
      });
    };
  
    const cancelEdit = () => setEditingId(null);
  
    const saveEdit = (id: string) => {
      setInterventions(prev =>
        prev.map(i =>
          i.id === id
            ? { ...i, ...editForm }
            : i
        )
      );
      toast.success('Intervention updated (dummy)');
      setEditingId(null);
    };
  
    const deleteIntervention = (id: string) => {
      setInterventions(prev => prev.filter(i => i.id !== id));
      toast.success('Intervention deleted (dummy)');
    };
  
    const addNewIntervention = () => {
      const newId = `i${Date.now()}`;
      const newItem = {
        id: newId,
        residentId,
        description: 'New intervention',
        responsibleStaffRole: 'Nurse',
        frequency: 'Daily',
        triggerConditions: 'N/A',
        effectivenessMetric: 'TBD',
      };
      setInterventions(prev => [...prev, newItem]);
      toast.success('New intervention added (dummy)');
    };
  
    return (
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-500" />
            Planned Interventions
          </h2>
          <Button size="sm" icon={Plus} onClick={addNewIntervention}>
            Add Intervention
          </Button>
        </div>
  
        {interventions.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No interventions planned yet.</p>
        ) : (
          <div className="space-y-4">
            {interventions.map(item => (
              <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                {editingId === item.id ? (
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
                        <label className="block text-xs font-medium text-slate-500">Responsible Staff</label>
                        <select
                          className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                          value={editForm.responsibleStaffRole}
                          onChange={(e) => setEditForm({ ...editForm, responsibleStaffRole: e.target.value })}
                        >
                          <option>Nurse</option>
                          <option>Physiotherapist</option>
                          <option>Memory Care Specialist</option>
                          <option>Caregiver</option>
                          <option>Doctor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500">Frequency</label>
                        <input
                          type="text"
                          className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                          value={editForm.frequency}
                          onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500">Trigger Conditions</label>
                      <input
                        type="text"
                        className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                        value={editForm.triggerConditions}
                        onChange={(e) => setEditForm({ ...editForm, triggerConditions: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500">Effectiveness Metric</label>
                      <input
                        type="text"
                        className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
                        value={editForm.effectivenessMetric}
                        onChange={(e) => setEditForm({ ...editForm, effectivenessMetric: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                      <Button size="sm" onClick={() => saveEdit(item.id)}>Save</Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{item.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                          <div>
                            <span className="text-slate-500">Responsible:</span>{' '}
                            <span className="font-medium text-slate-700">{item.responsibleStaffRole}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Frequency:</span>{' '}
                            <span className="font-medium text-slate-700">{item.frequency}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-500">Trigger:</span>{' '}
                            <span className="font-medium text-slate-700">{item.triggerConditions}</span>
                          </div>
                          <div className="col-span-4">
                            <span className="text-slate-500">Effectiveness metric:</span>{' '}
                            <span className="font-medium text-slate-700">{item.effectivenessMetric}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteIntervention(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };