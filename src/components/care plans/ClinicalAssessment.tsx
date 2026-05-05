// Clinical & Functional Assessment Component (Editable, with mock data)
import { useState } from 'react';
import { mockClinicalAssessments } from '../../mockData';
import { Card, Badge, Button } from '../UI';
import { ClipboardList, Edit2, Save } from 'lucide-react';
import { toast } from 'react-toastify';


export const ClinicalAssessment = ({ residentId }: { residentId: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState(() => {
      const mock = mockClinicalAssessments.find(c => c.residentId === residentId);
      // fallback structure if no mock data
      return mock || {
        conditions: [],
        medications: [],
        allergies: [],
        adlScores: {
          bathing: 'Independent',
          dressing: 'Independent',
          toileting: 'Independent',
          eating: 'Independent',
          transferring: 'Independent',
          continence: 'Continent',
        },
        mobility: 'Walks independently',
        cognitive: 'Intact',
      };
    });
  
    // Helper to update nested fields
    const updateAdlScore = (key: string, value: string) => {
      setData(prev => ({
        ...prev,
        adlScores: { ...prev.adlScores, [key]: value },
      }));
    };
  
    const handleSave = () => {
      // In real implementation, call API here.
      // For now, show dummy success message and keep the updated mock.
      toast.success('Clinical assessment saved (dummy)');
      setIsEditing(false);
    };
  
    // ADL options for dropdowns
    const adlOptions = [
      'Independent',
      'Supervision',
      'Moderate assist',
      'Total assist',
    ];
    const continenceOptions = ['Continent', 'Occasional accidents', 'Incontinent'];
  
    return (
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brand-500" />
            Clinical & Functional Assessment
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
  
        {/* Medical Conditions & Allergies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">Medical Conditions</p>
            {isEditing ? (
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                value={data.conditions.join(', ')}
                onChange={(e) => setData({ ...data, conditions: e.target.value.split(',').map(s => s.trim()) })}
                placeholder="e.g. Hypertension, Diabetes"
              />
            ) : (
              <div className="flex flex-wrap gap-1 mt-1">
                {data.conditions.map((c, i) => (
                  <Badge key={i} variant="outline" className="bg-slate-50">{c}</Badge>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Allergies</p>
            {isEditing ? (
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                value={data.allergies.join(', ')}
                onChange={(e) => setData({ ...data, allergies: e.target.value.split(',').map(s => s.trim()) })}
                placeholder="e.g. Penicillin, Sulfa"
              />
            ) : (
              <div className="flex flex-wrap gap-1 mt-1">
                {data.allergies.map((a, i) => (
                  <Badge key={i} variant="danger" className="bg-red-50 text-red-700">{a}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
  
        {/* Medications */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 font-medium mb-2">Current Medications</p>
          {isEditing ? (
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              rows={3}
              value={data.medications.map(m => `${m.name} – ${m.dose}, ${m.schedule}`).join('\n')}
              onChange={(e) => {
                const lines = e.target.value.split('\n').filter(l => l.trim());
                const newMeds = lines.map(line => {
                  const [name, rest] = line.split('–');
                  const [dose, schedule] = (rest || '').split(',');
                  return { name: name.trim(), dose: dose?.trim() || '', schedule: schedule?.trim() || '' };
                });
                setData({ ...data, medications: newMeds });
              }}
            />
          ) : (
            <div className="space-y-1">
              {data.medications.map((m, idx) => (
                <div key={idx} className="text-sm text-slate-700 border-b border-slate-100 py-1">
                  <span className="font-medium">{m.name}</span> – {m.dose}, {m.schedule}
                </div>
              ))}
            </div>
          )}
        </div>
  
        {/* ADL Scores – Structured dropdowns when editing */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 font-medium mb-2">Activities of Daily Living (ADL)</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(data.adlScores).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center border-b border-slate-50 py-1">
                <span className="capitalize text-slate-600">{key}</span>
                {isEditing ? (
                  key === 'continence' ? (
                    <select
                      className="border border-slate-300 rounded px-2 py-1 text-sm"
                      value={val}
                      onChange={(e) => updateAdlScore(key, e.target.value)}
                    >
                      {continenceOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <select
                      className="border border-slate-300 rounded px-2 py-1 text-sm"
                      value={val}
                      onChange={(e) => updateAdlScore(key, e.target.value)}
                    >
                      {adlOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  )
                ) : (
                  <span className="font-medium text-slate-800">{val}</span>
                )}
              </div>
            ))}
          </div>
        </div>
  
        {/* Mobility & Cognitive */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">Mobility Status</p>
            {isEditing ? (
              <select
                className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={data.mobility}
                onChange={(e) => setData({ ...data, mobility: e.target.value })}
              >
                <option>Walks independently</option>
                <option>Walks with cane</option>
                <option>Uses walker</option>
                <option>Wheelchair dependent</option>
                <option>Bedridden</option>
              </select>
            ) : (
              <p className="text-sm text-slate-800 mt-1">{data.mobility}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Cognitive Screening</p>
            {isEditing ? (
              <select
                className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={data.cognitive}
                onChange={(e) => setData({ ...data, cognitive: e.target.value })}
              >
                <option>Intact</option>
                <option>Mild cognitive impairment</option>
                <option>Moderate to severe impairment</option>
              </select>
            ) : (
              <p className="text-sm text-slate-800 mt-1">{data.cognitive}</p>
            )}
          </div>
        </div>
  
        {/* Save Button (only when editing) */}
        {isEditing && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} icon={Save}>
              Save Changes
            </Button>
          </div>
        )}
      </Card>
    );
  };