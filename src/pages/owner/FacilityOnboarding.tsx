import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  FileText,
  User,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload } from
'lucide-react';
import { Card, Button, Input } from '../../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
export const FacilityOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));
  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/owner/facilities');
    }, 1500);
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Onboard New Facility
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Set up a new facility and generate admin credentials.
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
                  placeholder="e.g. Sunrise Senior Living" />
                
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Facility Type
                      </label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                        <option>Senior Living</option>
                        <option>Assisted Living</option>
                        <option>Memory Care</option>
                        <option>Multi-Specialty</option>
                      </select>
                    </div>
                    <Input label="Phone Number" placeholder="(555) 000-0000" />
                  </div>
                  <Input
                  label="Email Address"
                  type="email"
                  placeholder="contact@facility.com" />
                
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
                  <Input label="Contract Start Date" type="date" />
                  <Input label="Contract End Date" type="date" />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contract Document
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-slate-400 mb-3" />
                    <p className="text-sm font-medium text-slate-900">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF up to 10MB
                    </p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="First Name" placeholder="Jane" />
                    <Input label="Middle Name (Optional)" placeholder="A." />
                    <Input label="Last Name" placeholder="Doe" />
                  </div>
                  <Input
                  label="Admin Email"
                  type="email"
                  placeholder="jane@facility.com" />
                

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mt-6">
                    <p className="text-sm font-medium text-amber-800">
                      Auto-generated Password
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      A secure password will be generated and sent to the
                      admin's email address. They will be required to change it
                      upon first login.
                    </p>
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
                      <p className="text-sm font-medium text-slate-900">
                        Sunrise Senior Living
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Type</p>
                      <p className="text-sm font-medium text-slate-900">
                        Assisted Living
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Contract Period</p>
                      <p className="text-sm font-medium text-slate-900">
                        Jan 1, 2025 - Dec 31, 2028
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Facility Admin Account
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      Jane Doe (jane@facility.com)
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