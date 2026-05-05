import { useState } from 'react';
import { mockPreferences } from '../../mockData';
import { mockResidents } from '../../mockData';
import { Card, Badge, Button } from '../UI';
import { Heart, Edit2, Save } from 'lucide-react';  
import { toast } from 'react-toastify';

export const PersonCenteredPreferences = ({ residentId }: { residentId: string }) => {
    if (!residentId) return null;
    const resident = mockResidents.find(r => r.id === residentId);
    if (!resident) return null;
  const [isEditing, setIsEditing] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    const mock = mockPreferences.find(p => p.residentId === residentId);
    return mock || {
      sleepPattern: '',
      mealPref: '',
      communication: '',
      socialPref: '',
      familyEngagement: '',
      isNA: false,
    };
  });

  // Track N/A flags per field (if you want per‑field N/A – client spec suggests structured N/A option, but per field is more flexible)
  // We'll implement per‑field N/A toggles to match "each field can be N/A".
  const [naFlags, setNaFlags] = useState({
    sleepPattern: false,
    mealPref: false,
    communication: false,
    socialPref: false,
    familyEngagement: false,
  });

  const handleSave = () => {
    toast.success('Preferences saved (dummy)');
    setIsEditing(false);
  };

  const updateField = (field: string, value: any) => {
    setPrefs(prev => ({ ...prev, [field]: value }));
  };

  const toggleNaFlag = (field: string) => {
    setNaFlags(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Heart className="h-5 w-5 text-brand-500" />
          Person‑Centered Preferences
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      </div>

      {/* Sleep Pattern */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">Sleep Pattern</p>
          {isEditing && (
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={naFlags.sleepPattern}
                onChange={() => toggleNaFlag('sleepPattern')}
              />
              N/A
            </label>
          )}
        </div>
        {isEditing ? (
          <input
            type="text"
            className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
            value={naFlags.sleepPattern ? '' : prefs.sleepPattern}
            onChange={(e) => updateField('sleepPattern', e.target.value)}
            disabled={naFlags.sleepPattern}
            placeholder={naFlags.sleepPattern ? 'N/A – not applicable' : 'e.g., 10 PM – 6 AM'}
          />
        ) : (
          <p className="text-sm text-slate-800 mt-1">
            {naFlags.sleepPattern ? 'N/A' : prefs.sleepPattern || 'Not specified'}
          </p>
        )}
      </div>

      {/* Meal Preferences */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">Meal Preferences</p>
          {isEditing && (
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={naFlags.mealPref} onChange={() => toggleNaFlag('mealPref')} /> N/A
            </label>
          )}
        </div>
        {isEditing ? (
          <select
            className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
            value={naFlags.mealPref ? '' : prefs.mealPref}
            onChange={(e) => updateField('mealPref', e.target.value)}
            disabled={naFlags.mealPref}
          >
            <option value="">Select preference</option>
            <option>Vegetarian</option>
            <option>Low salt</option>
            <option>Soft diet</option>
            <option>Diabetic</option>
            <option>No restrictions</option>
          </select>
        ) : (
          <p className="text-sm text-slate-800 mt-1">
            {naFlags.mealPref ? 'N/A' : prefs.mealPref || 'Not specified'}
          </p>
        )}
      </div>

      {/* Communication Needs */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">Communication Needs</p>
          {isEditing && (
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={naFlags.communication} onChange={() => toggleNaFlag('communication')} /> N/A
            </label>
          )}
        </div>
        {isEditing ? (
          <input
            type="text"
            className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
            value={naFlags.communication ? '' : prefs.communication}
            onChange={(e) => updateField('communication', e.target.value)}
            disabled={naFlags.communication}
            placeholder="e.g., hard of hearing, prefers written notes"
          />
        ) : (
          <p className="text-sm text-slate-800 mt-1">
            {naFlags.communication ? 'N/A' : prefs.communication || 'Not specified'}
          </p>
        )}
      </div>

      {/* Social Preferences */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">Social Preferences</p>
          {isEditing && (
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={naFlags.socialPref} onChange={() => toggleNaFlag('socialPref')} /> N/A
            </label>
          )}
        </div>
        {isEditing ? (
          <input
            type="text"
            className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
            value={naFlags.socialPref ? '' : prefs.socialPref}
            onChange={(e) => updateField('socialPref', e.target.value)}
            disabled={naFlags.socialPref}
            placeholder="e.g., likes group bingo, dislikes loud events"
          />
        ) : (
          <p className="text-sm text-slate-800 mt-1">
            {naFlags.socialPref ? 'N/A' : prefs.socialPref || 'Not specified'}
          </p>
        )}
      </div>

      {/* Family Engagement */}
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-500 font-medium">Family Engagement Preferences</p>
          {isEditing && (
            <label className="flex items-center gap-1 text-xs text-slate-500">
              <input type="checkbox" checked={naFlags.familyEngagement} onChange={() => toggleNaFlag('familyEngagement')} /> N/A
            </label>
          )}
        </div>
        {isEditing ? (
          <input
            type="text"
            className="w-full mt-1 border border-slate-300 rounded px-3 py-2 text-sm"
            value={naFlags.familyEngagement ? '' : prefs.familyEngagement}
            onChange={(e) => updateField('familyEngagement', e.target.value)}
            disabled={naFlags.familyEngagement}
            placeholder="e.g., daughter visits weekly, prefers phone calls"
          />
        ) : (
          <p className="text-sm text-slate-800 mt-1">
            {naFlags.familyEngagement ? 'N/A' : prefs.familyEngagement || 'Not specified'}
          </p>
        )}
      </div>

      {/* Save Button (only when editing) */}
      {isEditing && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} icon={Save}>
            Save Preferences
          </Button>
        </div>
      )}
    </Card>
  );
};