// Risk & Safety Profile Component (Editable, with mock data)
import { useState } from 'react';
import { mockRiskProfiles, mockResidents } from '../../mockData';
import { Card, Badge, Button } from '../UI';
import { ShieldAlert, Edit2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
export const RiskSafetyProfile = ({ residentId }: { residentId: string }) => {
    if (!residentId) return null;
    const resident = mockResidents.find(r => r.id === residentId);

    
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState(() => {
      const mock = mockRiskProfiles.find(r => r.residentId === residentId);
      return mock || {
        fallRiskScore: 0,
        mobilityTrend: 'Stable',
        nearFallEvents: 0,
        vitalsTrend: 'Stable',
        dataSource: 'System (SeniorLife)',
        narrativeInterpretation: '',
      };
    });
  
    const handleSave = () => {
      toast.success('Risk & Safety Profile saved (dummy)');
      setIsEditing(false);
    };
  
    return (
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-brand-500" />
            Risk & Safety Profile
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
  
        {/* Fall Risk Score (with visual bar) */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 font-medium">Fall Risk Score</p>
          {isEditing ? (
            <div className="flex items-center gap-3 mt-1">
              <input
                type="range"
                min="0"
                max="100"
                value={data.fallRiskScore}
                onChange={(e) => setData({ ...data, fallRiskScore: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-bold text-slate-800 w-12">{data.fallRiskScore}</span>
            </div>
          ) : (
            <div className="mt-1">
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="bg-brand-500 h-2.5 rounded-full"
                  style={{ width: `${data.fallRiskScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-700 mt-1">{data.fallRiskScore} out of 100</p>
            </div>
          )}
        </div>
  
        {/* Mobility Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">Mobility Trend</p>
            {isEditing ? (
              <select
                className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={data.mobilityTrend}
                onChange={(e) => setData({ ...data, mobilityTrend: e.target.value })}
              >
                <option>Improving</option>
                <option>Stable</option>
                <option>Declining</option>
                <option>Consistently low</option>
              </select>
            ) : (
              <p className="text-sm text-slate-800 mt-1">{data.mobilityTrend}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Near‑Fall Events (last 30d)</p>
            {isEditing ? (
              <input
                type="number"
                className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={data.nearFallEvents}
                onChange={(e) => setData({ ...data, nearFallEvents: parseInt(e.target.value) })}
                min="0"
              />
            ) : (
              <p className="text-sm text-slate-800 mt-1">{data.nearFallEvents}</p>
            )}
          </div>
        </div>
  
        {/* Vitals Trend & Data Source */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">Vitals Trend</p>
            {isEditing ? (
              <select
                className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={data.vitalsTrend}
                onChange={(e) => setData({ ...data, vitalsTrend: e.target.value })}
              >
                <option>Stable</option>
                <option>Improving</option>
                <option>Declining</option>
                <option>N/A</option>
              </select>
            ) : (
              <p className="text-sm text-slate-800 mt-1">{data.vitalsTrend}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Data Source</p>
            {isEditing ? (
              <select
                className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={data.dataSource}
                onChange={(e) => setData({ ...data, dataSource: e.target.value })}
              >
                <option>System (SeniorLife)</option>
                <option>System (Welltra)</option>
                <option>Staff assessment</option>
                <option>Mixed (SeniorLife + Welltra)</option>
              </select>
            ) : (
              <div className="mt-1">
                <Badge variant="info" className="bg-blue-50 text-blue-700">
                  {data.dataSource}
                </Badge>
              </div>
            )}
          </div>
        </div>
  
        {/* Narrative Interpretation */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 font-medium">Narrative Interpretation</p>
          {isEditing ? (
            <textarea
              className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              rows={3}
              value={data.narrativeInterpretation}
              onChange={(e) => setData({ ...data, narrativeInterpretation: e.target.value })}
              placeholder="Describe risk summary and recommended actions..."
            />
          ) : (
            <p className="text-sm text-slate-700 mt-1">
              {data.narrativeInterpretation || 'No narrative added yet.'}
            </p>
          )}
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