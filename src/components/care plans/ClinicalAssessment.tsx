import { useEffect, useMemo, useState } from 'react';
import { Card, Badge, Button } from '../UI';
import { ClipboardList, Edit2, Save, Trash2 } from 'lucide-react';
import type { ClinicalAssessment as ClinicalAssessmentType } from '../../types';
import { clinicalAssessmentService } from '../../services/clinicalAssessmentService';

type Props = {
  residentId: string;
  canManage: boolean;
  /** If false, component will render nothing (parent shows a button first). */
  isVisible?: boolean;
  /** When creating (no existing record), open in edit mode automatically. */
  startEditing?: boolean;
  onExistsChange?: (exists: boolean) => void;
};

const defaultDraft = {
  conditions: [] as string[],
  allergies: [] as string[],
  adlScores: {
    bathing: 'Independent',
    dressing: 'Independent',
    toileting: 'Independent',
    eating: 'Independent',
    transferring: 'Independent',
    continence: 'Continent',
  } as Record<string, string>,
  mobility: 'Walks independently',
  cognitive: 'Intact',
};

export const ClinicalAssessment = ({
  residentId,
  canManage,
  isVisible = true,
  startEditing = false,
  onExistsChange,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<ClinicalAssessmentType | null>(null);
  const [draft, setDraft] = useState(defaultDraft);

  const exists = !!assessment;

  useEffect(() => {
    if (!isVisible) return;
    if (!canManage) return;
    if (!startEditing) return;
    if (assessment) return;
    setIsEditing(true);
  }, [assessment, canManage, isVisible, startEditing]);

  useEffect(() => {
    onExistsChange?.(exists);
  }, [exists, onExistsChange]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await clinicalAssessmentService.getByResident(residentId);
      const latest = rows[0] ?? null;
      setAssessment(latest);
      if (latest) {
        setDraft({
          conditions: latest.conditions ?? [],
          allergies: latest.allergies ?? [],
          adlScores: (latest.adlScores ?? {}) as Record<string, string>,
          mobility: latest.mobility ?? '',
          cognitive: latest.cognitive ?? '',
        });
      } else {
        setDraft(defaultDraft);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load clinical assessment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isVisible) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentId, isVisible]);
  
    // Helper to update nested fields
    const updateAdlScore = (key: string, value: string) => {
      setDraft(prev => ({
        ...prev,
        adlScores: { ...prev.adlScores, [key]: value },
      }));
    };
  
    const handleSave = async () => {
      if (!canManage) return;
      setMutating(true);
      setError(null);
      try {
        if (!assessment) {
          const created = await clinicalAssessmentService.create({
            residentId,
            conditions: draft.conditions,
            allergies: draft.allergies,
            adlScores: draft.adlScores,
            mobility: draft.mobility,
            cognitive: draft.cognitive,
          });
          setAssessment(created);
          setIsEditing(false);
          return;
        }

        const updated = await clinicalAssessmentService.update(assessment.id, {
          conditions: draft.conditions,
          allergies: draft.allergies,
          adlScores: draft.adlScores,
          mobility: draft.mobility,
          cognitive: draft.cognitive,
        });
        setAssessment(updated);
        setIsEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save clinical assessment');
      } finally {
        setMutating(false);
      }
    };

    const handleDelete = async () => {
      if (!canManage || !assessment) return;
      if (!confirm('Delete this clinical assessment?')) return;

      setMutating(true);
      setError(null);
      try {
        await clinicalAssessmentService.remove(assessment.id);
        setAssessment(null);
        setDraft(defaultDraft);
        setIsEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to delete clinical assessment');
      } finally {
        setMutating(false);
      }
    };
  
    // ADL options for dropdowns
    const adlOptions = [
      'Independent',
      'Supervision',
      'Moderate assist',
      'Total assist',
    ];
    const continenceOptions = ['Continent', 'Occasional accidents', 'Incontinent'];

    const canEdit = canManage && isVisible;
    const showToolbar = isVisible && (canManage || assessment);
    const titleBadge = useMemo(() => {
      if (loading) return 'Loading';
      if (!assessment) return 'Not created';
      return 'Saved';
    }, [assessment, loading]);

    if (!isVisible) return null;
  
    return (
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brand-500" />
            Clinical & Functional Assessment
          </h2>
          {showToolbar && (
            <div className="flex items-center gap-2">
              <Badge variant={assessment ? 'success' : 'warning'} className="text-xs">
                {titleBadge}
              </Badge>
              {canManage && assessment && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  disabled={mutating}
                  title="Delete"
                  aria-label="Delete clinical assessment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              {canManage && (
                <button
                  type="button"
                  onClick={() => setIsEditing((v) => !v)}
                  className="p-1 text-slate-400 hover:text-brand-600 transition-colors disabled:opacity-50"
                  disabled={mutating}
                  title="Edit"
                  aria-label="Edit clinical assessment"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
  
        {/* Medical Conditions & Allergies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">Medical Conditions</p>
            {isEditing && canEdit ? (
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                value={draft.conditions.join(', ')}
                onChange={(e) =>
                  setDraft({ ...draft, conditions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
                }
                placeholder="e.g. Hypertension, Diabetes"
              />
            ) : (
              <div className="flex flex-wrap gap-1 mt-1">
                {draft.conditions.map((c, i) => (
                  <Badge key={i} variant="default" className="bg-slate-50">{c}</Badge>
                ))}
                {draft.conditions.length === 0 && <span className="text-sm text-slate-400">—</span>}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Allergies</p>
            {isEditing && canEdit ? (
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                value={draft.allergies.join(', ')}
                onChange={(e) =>
                  setDraft({ ...draft, allergies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })
                }
                placeholder="e.g. Penicillin, Sulfa"
              />
            ) : (
              <div className="flex flex-wrap gap-1 mt-1">
                {draft.allergies.map((a, i) => (
                  <Badge key={i} variant="danger" className="bg-red-50 text-red-700">{a}</Badge>
                ))}
                {draft.allergies.length === 0 && <span className="text-sm text-slate-400">—</span>}
              </div>
            )}
          </div>
        </div>
  
  
        {/* ADL Scores – Structured dropdowns when editing */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 font-medium mb-2">Activities of Daily Living (ADL)</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(draft.adlScores).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center border-b border-slate-50 py-1">
                <span className="capitalize text-slate-600">{key}</span>
                {isEditing && canEdit ? (
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
            {isEditing && canEdit ? (
              <select
                className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={draft.mobility}
                onChange={(e) => setDraft({ ...draft, mobility: e.target.value })}
              >
                <option>Walks independently</option>
                <option>Walks with cane</option>
                <option>Uses walker</option>
                <option>Wheelchair dependent</option>
                <option>Bedridden</option>
              </select>
            ) : (
              <p className="text-sm text-slate-800 mt-1">{draft.mobility || '—'}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Cognitive Screening</p>
            {isEditing && canEdit ? (
              <select
                className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                value={draft.cognitive}
                onChange={(e) => setDraft({ ...draft, cognitive: e.target.value })}
              >
                <option>Intact</option>
                <option>Mild cognitive impairment</option>
                <option>Moderate to severe impairment</option>
              </select>
            ) : (
              <p className="text-sm text-slate-800 mt-1">{draft.cognitive || '—'}</p>
            )}
          </div>
        </div>
  
        {/* Save Button (only when editing) */}
        {isEditing && canEdit && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} icon={Save} isLoading={mutating}>
              Save Changes
            </Button>
          </div>
        )}
      </Card>
    );
  };