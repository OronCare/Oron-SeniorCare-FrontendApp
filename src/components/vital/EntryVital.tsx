import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartPulse, Save, Activity, ArrowRight, User } from "lucide-react";
import { Card, Button } from "../UI";
import { getFullName, Resident, Vital } from "../../types";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { residentService } from "../../services/residentService";
import { vitalService } from "../../services/vitalService";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../utils/apiMessage";

type VitalFormState = {
  systolicBP: string;
  diastolicBP: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation: string;
  bloodSugar: string;
  weight: string;
  respiratoryRate: string;
  notes: string;
};

const initialFormState: VitalFormState = {
  systolicBP: "",
  diastolicBP: "",
  heartRate: "",
  temperature: "",
  oxygenSaturation: "",
  bloodSugar: "",
  weight: "",
  respiratoryRate: "",
  notes: "",
};

const toNumberOrUndefined = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const VitalsEntry = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const branchId = user?.branchId || "";
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [recentVitals, setRecentVitals] = useState<Vital[]>([]);
  const [form, setForm] = useState<VitalFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myResidents = useMemo(
    () => residents.filter((r) => !branchId || r.branchId === branchId),
    [residents, branchId],
  );
  const selectedResident = myResidents.find((r) => r.id === selectedResidentId);

  useEffect(() => {
    const loadResidents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await residentService.getAllResidents();
        setResidents(data);
      } catch (err) {
        const message = getApiErrorMessage(err, "Failed to load residents");
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadResidents();
  }, []);

  useEffect(() => {
    if (!selectedResidentId) {
      setRecentVitals([]);
      return;
    }

    const loadRecentVitals = async () => {
      setError(null);
      try {
        const vitals = await vitalService.getVitalsByResident(selectedResidentId);
        setRecentVitals(vitals.slice(0, 3));
      } catch (err) {
        const message = getApiErrorMessage(err, "Failed to load resident vitals");
        setError(message);
        toast.error(message);
      }
    };

    loadRecentVitals();
  }, [selectedResidentId]);

  const handleInputChange = (field: keyof VitalFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedResidentId) {
      const message = "Please select a resident first.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const saved = await vitalService.createVital({
        residentId: selectedResidentId,
        date: new Date().toISOString(),
        systolicBP: toNumberOrUndefined(form.systolicBP),
        diastolicBP: toNumberOrUndefined(form.diastolicBP),
        heartRate: toNumberOrUndefined(form.heartRate),
        temperature: toNumberOrUndefined(form.temperature),
        oxygenSaturation: toNumberOrUndefined(form.oxygenSaturation),
        bloodSugar: toNumberOrUndefined(form.bloodSugar),
        weight: toNumberOrUndefined(form.weight),
        respiratoryRate: toNumberOrUndefined(form.respiratoryRate),
        notes: form.notes.trim() || undefined,
      });
      setForm(initialFormState);
      const vitals = await vitalService.getVitalsByResident(selectedResidentId);
      setRecentVitals(vitals.slice(0, 3));
      setIsSubmitting(false);
      const statusMsg = saved.clinicalHealthState
        ? `Vitals saved. Clinical status: ${saved.clinicalHealthState}.`
        : "Vitals saved successfully.";
      toast.success(statusMsg);
      navigate("/admin/residents");
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to save vitals");
      setError(message);
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Log Vitals</h1>
        <p className="text-sm text-slate-500 mt-1">
          Record new health measurements for a resident.
        </p>
      </div>
      {error && (
        <Card className="border-red-200 bg-red-50 text-red-700 text-sm">{error}</Card>
      )}
      {isLoading && (
        <Card className="text-sm text-slate-500">Loading residents...</Card>
      )}

      <Card>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Select Resident
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              value={selectedResidentId}
              onChange={(e) => setSelectedResidentId(e.target.value)}>
              <option value="">-- Choose a resident --</option>
              {myResidents.map((r) =>
              <option key={r.id} value={r.id}>
                  {getFullName(r)} (Room {r.room})
                </option>
              )}
            </select>
          </div>
        </div>
      </Card>

      {selectedResidentId &&
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-brand-500" /> New
                Measurements
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Blood Pressure
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                    type="number"
                    placeholder="120"
                    value={form.systolicBP}
                    onChange={(e) => handleInputChange("systolicBP", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500" />
                  
                    <span className="text-slate-400 text-lg">/</span>
                    <input
                    type="number"
                    placeholder="80"
                    value={form.diastolicBP}
                    onChange={(e) => handleInputChange("diastolicBP", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500" />
                  
                    <span className="text-xs text-slate-500 ml-1">mmHg</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Heart Rate
                  </label>
                  <div className="relative">
                    <input
                    type="number"
                    placeholder="72"
                    value={form.heartRate}
                    onChange={(e) => handleInputChange("heartRate", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 pr-12" />
                  
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      bpm
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Temperature
                  </label>
                  <div className="relative">
                    <input
                    type="number"
                    step="0.1"
                    placeholder="98.6"
                    value={form.temperature}
                    onChange={(e) => handleInputChange("temperature", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 pr-10" />
                  
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      °F
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Oxygen Saturation (SpO2)
                  </label>
                  <div className="relative">
                    <input
                    type="number"
                    placeholder="98"
                    value={form.oxygenSaturation}
                    onChange={(e) => handleInputChange("oxygenSaturation", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 pr-8" />
                  
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      %
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Blood Sugar (Optional)
                  </label>
                  <div className="relative">
                    <input
                    type="number"
                    placeholder="100"
                    value={form.bloodSugar}
                    onChange={(e) => handleInputChange("bloodSugar", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 pr-14" />
                  
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      mg/dL
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Weight
                  </label>
                  <div className="relative">
                    <input
                    type="number"
                    step="0.1"
                    placeholder="150"
                    value={form.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 pr-10" />
                  
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      lbs
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Respiratory Rate
                  </label>
                  <div className="relative">
                    <input
                    type="number"
                    placeholder="16"
                    value={form.respiratoryRate}
                    onChange={(e) => handleInputChange("respiratoryRate", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 pr-20" />
                  
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      breaths/min
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1 mt-6">
                <label className="block text-sm font-medium text-slate-700">
                  Notes (Optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500"
                  placeholder="Any observations..."
                />
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <Button
                variant="outline"
                onClick={() => {
                  setSelectedResidentId("");
                  setForm(initialFormState);
                }}>
                  Cancel
                </Button>
                <Button
                icon={Save}
                isLoading={isSubmitting}
                disabled={!selectedResidentId}
                onClick={handleSave}>
                  Save Vitals
                </Button>
              </div>
            </Card>
          </div>

          {/* Context Sidebar */}
          <div className="space-y-6">
            <Card className="bg-slate-50 border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                  {selectedResident?.firstName[0]}
                  {selectedResident?.lastName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {selectedResident ? getFullName(selectedResident) : ''}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Room {selectedResident?.room}
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Medical Context
                </p>
                <p className="text-sm text-slate-700 line-clamp-3">
                  {selectedResident?.medicalHistory}
                </p>
              </div>
            </Card>

            <Card noPadding>
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-400" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Recent Entries
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {recentVitals.map((v) =>
              <div key={v.id} className="p-4 text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(v.date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(v.date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-slate-400 block">BP</span>
                        <span className="font-medium text-slate-900">
                          {v.systolicBP ?? "-"} / {v.diastolicBP ?? "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">HR</span>
                        <span className="font-medium text-slate-900">
                          {v.heartRate ?? "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">
                          SpO2
                        </span>
                        <span className="font-medium text-slate-900">
                          {v.oxygenSaturation ?? "-"}%
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">
                          Temp
                        </span>
                        <span className="font-medium text-slate-900">
                          {v.temperature ?? "-"}°
                        </span>
                      </div>
                    </div>
                  </div>
              )}
                {recentVitals.length === 0 &&
              <div className="p-6 text-center text-sm text-slate-500">
                    No recent vitals found.
                  </div>
              }
              </div>
              {recentVitals.length > 0 &&
            <div className="p-3 border-t border-slate-100 bg-slate-50 rounded-b-xl text-center">
                  <button
                onClick={() =>
                navigate(`/admin/residents/${selectedResidentId}`)
                }
                className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center justify-center w-full">
                
                    View Full History <ArrowRight className="ml-1 h-3 w-3" />
                  </button>
                </div>
            }
            </Card>
          </div>
        </motion.div>
      }
    </div>);

};