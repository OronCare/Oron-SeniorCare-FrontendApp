import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  FileText,
  User,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from
  'lucide-react';
import { Card, Button, Input } from '../../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateFacilityRequest, facilityService, UpdateFacilityRequest } from '../../services/facilityService';
import { usersService } from '../../services/usersService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage, getApiSuccessMessage } from '../../utils/apiMessage';
import { PdfThumbnail } from '../common/PdfThumbnail';

const generateTemporaryPassword = () => {
  return `Oron@${Math.random().toString(36).slice(-8)}A1`;
};

export const FacilityOnboarding = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id: facilityId } = useParams();
  const isEditMode = Boolean(facilityId);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateFacilityRequest>({
    name: '',
    phone: '',
    email: '',
    type: 'Senior Living',
    status: 'Active',
    contractStart: '',
    contractEnd: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: generateTemporaryPassword(),
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [fileName, setFileName] = useState('');
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const pageTitle = useMemo(
    () => (isEditMode ? 'Edit Facility' : 'Onboard New Facility'),
    [isEditMode],
  );
  const pageDescription = useMemo(
    () =>
      isEditMode
        ? 'Update facility details and save changes.'
        : 'Set up a new facility and generate admin credentials.',
    [isEditMode],
  );

  useEffect(() => {
    const load = async () => {
      if (!isEditMode || !facilityId) return;
      setError(null);
      try {
        const facility = await facilityService.getFacilityById(facilityId);
        const adminUser = facility.facilityAdminId
          ? await usersService.getUserById(facility.facilityAdminId)
          : null;

        setFormData({
          name: facility.name ?? '',
          phone: facility.phone ?? '',
          email: facility.email ?? '',
          type: facility.type ?? 'Senior Living',
          status: facility.status ?? 'Active',
          contractStart: facility.contractStart ? facility.contractStart.split('T')[0] : '',
          contractEnd: facility.contractEnd ? facility.contractEnd.split('T')[0] : '',
          adminFirstName: adminUser?.firstName ?? (facility.facilityAdminName?.split(' ')[0] ?? ''),
          adminLastName: adminUser?.lastName ?? (facility.facilityAdminName?.split(' ').slice(1).join(' ') ?? ''),
          adminEmail: adminUser?.email ?? '',
          // Do not generate/change password on edit unless user explicitly enters one
          adminPassword: '',
        });
      } catch (err) {
        const message = getApiErrorMessage(err, 'Failed to load facility');
        setError(message);
        toast.error(message);
      }
    };

    void load();
  }, [facilityId, isEditMode]);

  const handleInputChange = (field: keyof CreateFacilityRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const steps = [
    {
      id: 1,
      title: 'Facility Details',
      icon: Building2
    },
    {
      id: 2,
      title: 'Contract Details',
      icon: FileText
    },
    {
      id: 3,
      title: 'Admin Account',
      icon: User
    },
    {
      id: 4,
      title: 'Review',
      icon: CheckCircle
    }];

  const handleNext = () => {
    setStep((s) => Math.min(s + 1, 4));
  };

  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (isEditMode && facilityId) {
        if (!formData.adminEmail) {
          throw new Error('Facility admin email is required.');
        }

        const updatePayload: UpdateFacilityRequest = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          type: formData.type,
          status: formData.status,
          contractStart: formData.contractStart,
          contractEnd: formData.contractEnd,
          adminFirstName: formData.adminFirstName,
          adminLastName: formData.adminLastName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword?.trim() || undefined,
        };
        await facilityService.updateFacility(facilityId, updatePayload);
        toast.success('Facility updated successfully.');
      } else {
        const createdFacilityResponse = await facilityService.createFacility(
          formData,
          selectedFile ?? undefined,
        );
        toast.success(getApiSuccessMessage(createdFacilityResponse, 'Facility created successfully.'));
      }

      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/owner/facilities');
      }, 1500);
    } catch (err) {
      const message = getApiErrorMessage(err, isEditMode ? 'Failed to update facility' : 'Failed to create facility');
      setError(message);
      toast.error(message);
      setIsSubmitting(false);
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {pageTitle}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {pageDescription}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-500 -z-10 transition-all duration-300"
          style={{
            width: `${(step - 1) / 3 * 100}%`
          }}>
        </div>

        {steps.map((s) =>
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= s.id ? 'bg-brand-600 border-brand-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>

              <s.icon className="h-5 w-5" />
            </div>
            <span
              className={`text-xs font-medium ${step >= s.id ? 'text-brand-700' : 'text-slate-500'}`}>

              {s.title}
            </span>
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 min-h-[400px] relative">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <AnimatePresence mode="wait">
            {step === 1 &&
              <motion.div
                key="step1"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                className="space-y-4">

                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Facility Information
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Facility Name"
                    placeholder="e.g. Sunrise Senior Living"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Facility Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}>
                        <option>Senior Living</option>
                        <option>Assisted Living</option>
                        <option>Memory Care</option>
                        <option>Multi-Specialty</option>
                      </select>
                    </div>
                    <Input
                      label="Phone Number"
                      placeholder="(555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)} />
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="contact@facility.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)} />

                </div>
              </motion.div>
            }

            {step === 2 &&
              <motion.div
                key="step2"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                className="space-y-4">

                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Contract Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contract Start Date"
                    type="date"
                    value={formData.contractStart}
                    onChange={(e) => handleInputChange('contractStart', e.target.value)} />
                  <Input
                    label="Contract End Date"
                    type="date"
                    value={formData.contractEnd}
                    onChange={(e) => handleInputChange('contractEnd', e.target.value)} />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contract Document
                  </label>
                  <div
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => {
                      const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
                      if (fileInput) {
                        fileInput.click();
                      }
                    }}
                  >
                    <input
                      type='file'
                      id="fileInput"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          setFileName(file.name);
                          setFilePreviewUrl((prev) => {
                            if (prev) URL.revokeObjectURL(prev);
                            return URL.createObjectURL(file);
                          });
                          console.log('Selected file:', file);
                        }
                      }}
                    />

                    {fileName ? (
                      <div className="flex items-center justify-center gap-3">
                        {filePreviewUrl && (
                          <a
                            href={filePreviewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0"
                            title="Open preview in new tab"
                          >
                            {(selectedFile?.type?.startsWith('image/') ?? false) ? (
                              <img
                                src={filePreviewUrl}
                                alt={fileName}
                                className="h-24 w-24 rounded-lg border border-slate-200 object-cover bg-white"
                              />
                            ) : (
                              <PdfThumbnail fileUrl={filePreviewUrl} />
                            )}
                          </a>
                        )}

                        <div className="text-sm font-medium text-slate-900 text-left">
                          <span className="text-green-600">✓ File selected: </span>
                          {fileName}
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-900">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PDF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            }

            {step === 3 &&
              <motion.div
                key="step3"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                className="space-y-4">

                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Facility Admin Account
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  This user will receive an email with instructions to log in
                  and complete the facility setup, including adding branches.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      placeholder="Jane"
                      value={formData.adminFirstName}
                      onChange={(e) => handleInputChange('adminFirstName', e.target.value)} />
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      value={formData.adminLastName}
                      onChange={(e) => handleInputChange('adminLastName', e.target.value)} />
                  </div>
                  <Input
                    label="Admin Email"
                    type="email"
                    placeholder="jane@facility.com"
                    value={formData.adminEmail}
                    onChange={(e) => handleInputChange('adminEmail', e.target.value)} />


                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mt-6">
                    <p className="text-sm font-medium text-amber-800">
                      Auto-generated Password
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      A secure password will be generated and sent to the
                      admin's email address. They will be required to change it
                      upon first login.
                    </p>
                    {formData.adminPassword && (
                      <p className="text-xs text-amber-700 mt-3 font-mono bg-white p-2 rounded border border-amber-200">
                        Generated: {formData.adminPassword}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            }

            {step === 4 &&
              <motion.div
                key="step4"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                className="space-y-6">

                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Review & Confirm
                </h2>

                <div className="bg-slate-50 rounded-xl p-5 space-y-4 border border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Facility Name</p>
                      <p className="text-sm font-medium text-slate-900">{formData.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Type</p>
                      <p className="text-sm font-medium text-slate-900">{formData.type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Contract Period</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formData.contractStart || '-'} - {formData.contractEnd || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Facility Admin Account
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {`${formData.adminFirstName || '-'} ${formData.adminLastName || ''}`.trim()} ({formData.adminEmail || '-'})
                    </p>
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1 || isSubmitting}
            icon={ArrowLeft}>

            Back
          </Button>

          {step < 4 ?
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button> :

            <Button
              onClick={handleSubmit}
              isLoading={isSubmitting}
              icon={CheckCircle}>

              Confirm & Onboard
            </Button>
          }
        </div>
      </Card>
    </div>);

};