import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Network, Save, User } from 'lucide-react';
import { Card, Button, Input } from '../../components/UI';
import { branchService, CreateBranchRequest } from '../../services/branchService';
import { facilityService } from '../../services/facilityService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage, getApiSuccessMessage } from '../../utils/apiMessage';

const generateTemporaryPassword = () => {
  return `Oron@${Math.random().toString(36).slice(-8)}A1`;
};

const emptyBranchForm = (facilityId: string): CreateBranchRequest => ({
  facilityId,
  name: '',
  address: '',
  phone: '',
  type: 'Senior Living',
  status: 'Active',
  residentLimit: 100,
  branchAdminFirstName: '',
  branchAdminLastName: '',
  branchAdminEmail: '',
  branchAdminPassword: '',
});

export const AddBranch = () => {
  const { id: facilityId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [facilityName, setFacilityName] = useState<string | null>(null);
  const [loadingFacility, setLoadingFacility] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [branchForm, setBranchForm] = useState<CreateBranchRequest | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!facilityId) {
      setLoadError('Missing facility.');
      setLoadingFacility(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoadingFacility(true);
      setLoadError(null);
      try {
        const facility = await facilityService.getFacilityById(facilityId);
        if (cancelled) return;
        setFacilityName(facility.name);
        setBranchForm({
          ...emptyBranchForm(facilityId),
          branchAdminPassword: generateTemporaryPassword(),
        });
      } catch (err) {
        if (cancelled) return;
        const message = getApiErrorMessage(err, 'Failed to load facility');
        setLoadError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setLoadingFacility(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [facilityId]);

  const backToFacility = facilityId ? `/owner/facilities/${facilityId}` : '/owner/facilities';

  const setField = (field: keyof CreateBranchRequest, value: string | number) => {
    setBranchForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSubmit = async () => {
    if (!facilityId || !branchForm) return;

    setSubmitError(null);
    setIsSubmitting(true);
    const tempPassword = branchForm.branchAdminPassword;

    try {
      const created = await branchService.createBranch({
        ...branchForm,
        facilityId,
        residentLimit: Number(branchForm.residentLimit),
      });
      toast.success(getApiSuccessMessage(created, 'Branch created successfully.'));
      if (tempPassword) {
        toast.success(`Branch admin temporary password: ${tempPassword}`);
      }
      navigate(backToFacility);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to create branch');
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!facilityId) {
    return (
      <div className="max-w-4xl mx-auto p-4 rounded-lg bg-red-50 text-red-700 text-sm">
        Invalid link.{' '}
        <Link to="/owner/facilities" className="font-medium text-brand-600 hover:text-brand-700 underline">
          Back to facilities
        </Link>
      </div>
    );
  }

  if (loadingFacility) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-slate-500 text-sm">
        Loading facility…
      </div>
    );
  }

  if (loadError || !branchForm) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {loadError || 'Unable to open this page.'}
        </div>
        <Link to={backToFacility} className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ← Back to facility
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <Link
            to={backToFacility}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">Add New Branch</h1>
            <p className="text-sm text-slate-500 mt-1">
              Create a branch and branch admin for{' '}
              <span className="font-medium text-slate-700">{facilityName ?? 'this facility'}</span>.
            </p>
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="outline" onClick={() => navigate(backToFacility)}>
            Cancel
          </Button>
          <Button icon={Save} isLoading={isSubmitting} onClick={handleSubmit}>
            Create Branch
          </Button>
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{submitError}</div>
      )}

      <div className="space-y-6">
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Network className="h-4 w-4 text-slate-400" />
            Branch information
          </h3>
          <div className="space-y-4">
              <Input
                label="Branch Name *"
                placeholder="e.g. Sunrise Downtown"
                value={branchForm.name}
                onChange={(e) => setField('name', e.target.value)}
              />
              <Input
                label="Address *"
                placeholder="123 Main St"
                value={branchForm.address}
                onChange={(e) => setField('address', e.target.value)}
              />
              <Input
                label="Phone Number *"
                placeholder="(555) 000-0000"
                value={branchForm.phone}
                onChange={(e) => setField('phone', e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">Type *</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                    value={branchForm.type}
                    onChange={(e) => setField('type', e.target.value)}
                  >
                    <option>Senior Living</option>
                    <option>Assisted Living</option>
                    <option>Memory Care</option>
                    <option>Residential</option>
                  </select>
                </div>
                <Input
                  label="Resident Limit *"
                  type="number"
                  placeholder="100"
                  value={branchForm.residentLimit}
                  onChange={(e) => setField('residentLimit', Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Status *</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                  value={branchForm.status}
                  onChange={(e) => setField('status', e.target.value)}
                >
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </select>
              </div>
          </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-400" />
              Branch admin account
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  placeholder="John"
                  value={branchForm.branchAdminFirstName}
                  onChange={(e) => setField('branchAdminFirstName', e.target.value)}
                />
                <Input
                  label="Last Name *"
                  placeholder="Doe"
                  value={branchForm.branchAdminLastName}
                  onChange={(e) => setField('branchAdminLastName', e.target.value)}
                />
              </div>
              <Input
                label="Email *"
                type="email"
                placeholder="admin@branch.com"
                value={branchForm.branchAdminEmail}
                onChange={(e) => setField('branchAdminEmail', e.target.value)}
              />
              <div>
                <p className="text-xs text-slate-500 mb-1">Temporary password</p>
                <p className="text-xs text-slate-700 font-mono bg-slate-50 border border-slate-200 rounded-lg p-3 break-all">
                  {branchForm.branchAdminPassword}
                </p>
              </div>
            </div>
          </Card>
        </div>
    </div>
  );
};
