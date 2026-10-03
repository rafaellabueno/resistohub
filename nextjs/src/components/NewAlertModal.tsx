import React, { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertOctagon,
  Plus,
  X,
  Hospital,
  User,
  MapPin,
  Biohazard,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { clientContent } from '@/language/client';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertSeverity } from '@/lib/mockData';

type ResultType = 'S' | 'I' | 'R';
type Severity = 'info' | 'watch' | 'critical';
type EventType = 'isolated' | 'cluster' | 'suspected_outbreak' | 'confirmed_outbreak' | 'regional_emergency';
type Environment = 'community' | 'hospital' | 'icu' | 'outpatient' | 'other';
type SampleOrigin = 'blood_culture' | 'urine' | 'swab' | 'respiratory_secretion' | 'csf' | 'other';
type DetectionType = 'phenotypic' | 'pcr' | 'wgs' | 'other';
type CertaintyDegree = 'lab_confirmed' | 'preliminary_data' | 'clinical_report' | 'sequencing_in_progress';

interface AntibiogramEntry {
  name: string;
  result: ResultType;
  mic?: number;
  method?: 'BMD' | 'Disco Difusão' | 'Etest' | 'Outro';
  standard?: 'CLSI' | 'EUCAST' | 'Outro';
  guidelineYear?: number;
}

interface NewAlertFormData {
  title: string;
  description: string;
  bacterium: string;
  resistance: string;
  country: string;
  state: string;
  city: string;
  facility: string;
  reportedBy: string;
  isolatesCount: number;
  status: 'monitoring' | 'resolved' | 'closed';
  antibiogram: AntibiogramEntry[];
  eventType: EventType;
  environment: Environment;
  sampleOrigin: SampleOrigin;
  detectionDate: string;
  eventStartDate: string;
  eventEndDate?: string;
  detectionType: DetectionType;
  certaintyDegree: CertaintyDegree;
  useSuggestedSeverity: boolean;
  manualSeverity: Severity;
  institution: string;
}

interface NewAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (alert: Omit<Alert, 'id'>) => void;
}

const bacteriaSuggestions = [
  'Klebsiella pneumoniae',
  'Pseudomonas aeruginosa',
  'Staphylococcus aureus',
  'Escherichia coli',
  'Acinetobacter baumannii',
  'Enterococcus faecalis',
];

const resistanceSuggestions = [
  'KPC-2',
  'NDM-1',
  'MRSA',
  'VRE',
  'ESBL',
  'mcr-1 (Colistin Resistance)',
  'OXA-48',
  'mecA',
];

const antibioticSuggestions = [
  'Meropenem',
  'Imipenem',
  'Ertapenem',
  'Doripenem',
  'Colistin',
  'Polimixina B',
  'Ceftazidima',
  'Cefepime',
  'Piperacilina/Tazobactam',
  'Amicacina',
  'Gentamicina',
  'Tobramicina',
  'Fluoroquinolonas',
  'Vancomicina',
  'Linezolida',
];

export default function NewAlertModal({
  isOpen,
  onClose,
  onSubmit,
}: NewAlertModalProps) {
  const router = useRouter();
  const { locale } = router;
  const { surveillance: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [newAntibiotic, setNewAntibiotic] = useState<Omit<AntibiogramEntry, 'id'>>({
    name: '',
    result: 'S',
  });

  const [formData, setFormData] = useState<NewAlertFormData>({
    title: '',
    description: '',
    bacterium: '',
    resistance: '',
    country: '',
    state: '',
    city: '',
    facility: '',
    reportedBy: '',
    isolatesCount: 1,
    status: 'monitoring',
    antibiogram: [],
    eventType: 'isolated',
    environment: 'hospital',
    sampleOrigin: 'blood_culture',
    detectionDate: new Date().toISOString().split('T')[0] || '',
    eventStartDate: new Date().toISOString().split('T')[0] || '',
    eventEndDate: '',
    detectionType: 'phenotypic',
    certaintyDegree: 'lab_confirmed',
    useSuggestedSeverity: true,
    manualSeverity: 'watch',
    institution: '',
  });


  const severityAnalysis = useMemo(() => {
    let score = 0;
    const reasons: string[] = [];

    const carbapenemResistant = formData.antibiogram.some(
      (a) =>
        ['Meropenem', 'Imipenem', 'Ertapenem', 'Doripenem'].includes(a.name) &&
        a.result === 'R'
    );
    if (carbapenemResistant) {
      score += 3;
      reasons.push(content.modal.testedAntibioticsResitanceDetected);
    }

    // +3 points: Transmissible genetic mechanism
    const transmissibleMechanism = [
      'KPC',
      'NDM',
      'OXA-48',
      'mcr-1',
      'mcr',
    ].some((m) => formData.resistance.toUpperCase().includes(m));
    if (transmissibleMechanism) {
      score += 3;
      reasons.push(content.modal.transmissibleMechanism);
    }

    // +3 points: Confirmed outbreak or regional emergency
    if (
      formData.eventType === 'confirmed_outbreak' ||
      formData.eventType === 'regional_emergency'
    ) {
      score += 3;
      reasons.push(content.modal.confirmedOutbreakOrEmergency);
    }

    // +2 points: ICU or Hospital environment
    if (formData.environment === 'icu' || formData.environment === 'hospital') {
      score += 2;
      reasons.push(`${content.modal.environment}: ${formData.environment === 'icu' ? content.modal.icu : content.modal.hospital}`);
    }

    // +2 points: ≥5 isolates
    if (formData.isolatesCount >= 5) {
      score += 2;
      reasons.push(`${content.modal.isolatesCount}: ${formData.isolatesCount}`);
    }

    // +2 points: Suspected outbreak
    if (formData.eventType === 'suspected_outbreak') {
      score += 2;
      reasons.push(content.modal.suspectedOutbreak);
    }

    // +1 point: ≥3 antibiotic classes resistant
    const resistantCount = formData.antibiogram.filter((a) => a.result === 'R').length;
    if (resistantCount >= 3) {
      score += 1;
      reasons.push(`${content.modal.resistantCount}: ${resistantCount}`);
    }

    // +1 point: Cluster
    if (formData.eventType === 'cluster') {
      score += 1;
      reasons.push(content.modal.cluster);
    }

    // +1 point: Last-resort antibiotic resistance
    const lastResortResistant = formData.antibiogram.some(
      (a) =>
        ['Colistin', 'Polimixina B'].includes(a.name) &&
        a.result === 'R'
    );
    if (lastResortResistant && !transmissibleMechanism) {
      score += 1;
      reasons.push(content.modal.lastResortResistance);
    }

    // +1 point: Lab confirmed
    if (formData.certaintyDegree === 'lab_confirmed') {
      score += 1;
      reasons.push(content.modal.labConfirmed);
    }

    // Determine suggested severity
    let suggested: Severity = 'info';
    if (score >= 6) {
      suggested = 'critical';
    } else if (score >= 3) {
      suggested = 'watch';
    }

    return { suggested, reasons, score };
  }, [formData]);

  const currentSeverity = formData.useSuggestedSeverity
    ? severityAnalysis.suggested
    : formData.manualSeverity;

  const addAntibiotic = useCallback(() => {
    if (!newAntibiotic.name.trim()) {
      toast({
        title: content.modal.requiredField,
        description: content.modal.pleaseEnterAntibioticName,
        variant: 'destructive',
      });
      return;
    }

    const isDuplicate = formData.antibiogram.some(
      (a) => a.name.toLowerCase() === newAntibiotic.name.toLowerCase()
    );

    if (isDuplicate) {
      toast({
        title: content.modal.duplicateAntibiotic,
        description: content.modal.antibioticAlreadyAdded,
        variant: 'destructive',
      });
      return;
    }

    setFormData({
      ...formData,
      antibiogram: [...formData.antibiogram, newAntibiotic as AntibiogramEntry],
    });
    setNewAntibiotic({ name: '', result: 'S' });
  }, [formData, newAntibiotic, toast]);

  const removeAntibiotic = useCallback((index: number) => {
    setFormData({
      ...formData,
      antibiogram: formData.antibiogram.filter((_, i) => i !== index),
    });
  }, [formData]);

  const nextStep = useCallback(() => {
    switch (step) {
      case 0:
        if (!formData.title.trim()) {
          toast({
            title: content.modal.requiredField,
            description: content.modal.pleaseEnterAlertTitle,
            variant: 'destructive',
          });
          return;
        }
        if (!formData.bacterium.trim()) {
          toast({
            title: content.modal.requiredField,
            description: content.modal.pleaseEnterBacterium,
            variant: 'destructive',
          });
          return;
        }
        if (!formData.detectionType) {
          toast({
            title: content.modal.requiredField,
            description: content.modal.pleaseSelectDetectionType,
            variant: 'destructive',
          });
          return;
        }
        if (!formData.certaintyDegree) {
          toast({
            title: content.modal.requiredField,
            description: content.modal.pleaseSelectCertaintyDegree,
            variant: 'destructive',
          });
          return;
        }
        break;

      case 1:
        if (formData.detectionType === 'phenotypic' && formData.antibiogram.length === 0) {
          toast({
            title: content.modal.requiredField,
            description: content.modal.pleaseAddAntibioticToSusceptibilityProfile,
            variant: 'destructive',
          });
          return;
        }
        break;

      case 2:
        if (!formData.eventType) {
          toast({
            title: content.modal.requiredField,
            description: content.modal.pleaseSelectEventType,
            variant: 'destructive',
          });
          return;
        }
        if (!formData.environment) {
          toast({
            title: content.modal.requiredField,
            description: content.modal.pleaseSelectEnvironment,
            variant: 'destructive',
          });
          return;
        }
        if (!formData.sampleOrigin) {
          toast({
            title: content.modal.requiredField,
            description: content.modal.pleaseSelectSampleOrigin,
            variant: 'destructive',
          });
          return;
        }
        if (
          ['cluster', 'suspected_outbreak', 'confirmed_outbreak'].includes(
            formData.eventType
          ) &&
          formData.isolatesCount === 0
        ) {
          toast({
            title: content.modal.requiredField,
            description: content.modal.pleaseEnterNumberOfIsolatesForThisEventType,
            variant: 'destructive',
          });
          return;
        }
        break;

      case 3:
        if (!formData.country.trim()) {
          toast({
            title: content.modal.requiredField,
            description: content.modal.pleaseEnterCountry,
            variant: 'destructive',
          });
          return;
        }
        break;

      case 4:
        if (!formData.detectionDate) {
          toast({
            title: content.modal.requiredField,
            description: content.modal.pleaseEnterDetectionDate,
            variant: 'destructive',
          });
          return;
        }
        if (!formData.eventStartDate) {
          toast({
            title: content.modal.requiredField,
            description: content.modal.pleaseEnterEventStartDate,
            variant: 'destructive',
          });
          return;
        }
        if (new Date(formData.eventStartDate) > new Date(formData.detectionDate)) {
          toast({
            title: content.modal.invalidDate,
            description: content.modal.eventStartDateMustBeBeforeDetectionDate,
            variant: 'destructive',
          });
          return;
        }
        if (
          formData.eventEndDate &&
          new Date(formData.eventEndDate) < new Date(formData.eventStartDate)
        ) {
          toast({
            title: content.modal.invalidDate,
            description: content.modal.eventEndDateMustBeAfterEventStartDate,
            variant: 'destructive',
          });
          return;
        }
        break;
    }

    setStep((s) => Math.min(s + 1, 5));
  }, [step, formData, toast]);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleClose = useCallback(() => {
    setStep(0);
    setFormData({
      title: '',
      description: '',
      bacterium: '',
      resistance: '',
      country: '',
      state: '',
      city: '',
      facility: '',
      reportedBy: '',
      isolatesCount: 1,
      status: 'monitoring',
      antibiogram: [],
      eventType: 'isolated',
      environment: 'hospital',
      sampleOrigin: 'blood_culture',
      detectionDate: new Date().toISOString().split('T')[0] || '',
      eventStartDate: new Date().toISOString().split('T')[0] || '',
      eventEndDate: '',
      detectionType: 'phenotypic',
      certaintyDegree: 'lab_confirmed',
      useSuggestedSeverity: true,
      manualSeverity: 'watch',
      institution: '',
    });
    setNewAntibiotic({ name: '', result: 'S' });
    onClose();
  }, [onClose]);

  const addAlertMutation = api.surveillance.saveAlert.useMutation({
    onSuccess: () => {
      toast({
        title: content.modal.alertPublishedSuccessfully,
        description: content.modal.alertPublishedSuccessfullyDescription,
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: content.modal.errorSubmittingAlert,
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = useCallback(() => {
    addAlertMutation.mutate({
      title: formData.title,
      description: formData.description,
      severity: currentSeverity,
      bacterium: formData.bacterium,
      resistance: formData.resistance,
      country: formData.country,
      state: formData.state,
      city: formData.city,
      facility: formData.facility,
      reportedBy: formData.reportedBy,
      isolatesCount: formData.isolatesCount,
      antibiotics: formData.antibiogram.map((a) => a.name),
      status: formData.status,
      antibiogram: formData.antibiogram.map((entry) => ({
        name: entry.name,
        result: entry.result as "S" | "I" | "R",
        mic: entry.mic || 0,
        method: entry.method || "Outro",
        standard: entry.standard || "Outro",
        guidelineYear: entry.guidelineYear || new Date().getFullYear(),
      })),
      eventType: formData.eventType,
      environment: formData.environment,
      sampleOrigin: formData.sampleOrigin,
      detectionDate: formData.detectionDate,
      eventStartDate: formData.eventStartDate,
      eventEndDate: formData.eventEndDate || '',
      detectionType: formData.detectionType,
      certaintyDegree: formData.certaintyDegree,
      useSuggestedSeverity: formData.useSuggestedSeverity,
      manualSeverity: formData.manualSeverity,
      institution: formData.institution,
    });
  }, [formData, currentSeverity, addAlertMutation]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
              <Biohazard size={18} /> <span>{content.modal.identificationOfPathogen}</span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                {content.modal.alertTitle} *
              </label>
              <Input
                placeholder={content.modal.alertTitleExample}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                {content.modal.description} *
              </label>
              <textarea
                placeholder={content.modal.descriptionPlaceholder}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                  {content.modal.bacteriaAgent} *
                </label>
                <Input
                  list="bacteria-list"
                  placeholder={content.modal.taxonomicName}
                  value={formData.bacterium}
                  onChange={(e) =>
                    setFormData({ ...formData, bacterium: e.target.value })
                  }
                />
                <datalist id="bacteria-list">
                  {bacteriaSuggestions.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                  {content.modal.antimicrobialResistanceMechanism}
                </label>
                <Input
                  list="resistance-list"
                  placeholder={content.modal.antimicrobialResistanceMechanismExample}
                  value={formData.resistance}
                  onChange={(e) =>
                    setFormData({ ...formData, resistance: e.target.value })
                  }
                />
                <datalist id="resistance-list">
                  {resistanceSuggestions.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                  {content.modal.detectionType} *
                </label>
                <select
                  value={formData.detectionType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detectionType: e.target.value as DetectionType,
                    })
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="phenotypic">{content.modal.phenotypicDetection}</option>
                  <option value="pcr">{content.modal.pcrDetection}</option>
                  <option value="wgs">{content.modal.wgsDetection}</option>
                  <option value="other">{content.modal.otherDetection}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                  {content.modal.certaintyDegree} *
                </label>
                <select
                  value={formData.certaintyDegree}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      certaintyDegree: e.target.value as CertaintyDegree,
                    })
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="lab_confirmed">{content.modal.labConfirmed}</option>
                  <option value="preliminary_data">{content.modal.preliminaryData}</option>
                  <option value="clinical_report">{content.modal.clinicalReport}</option>
                  <option value="sequencing_in_progress">{content.modal.sequencingInProgress}</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
              <CheckCircle2 size={18} /> <span>{content.modal.susceptibilityProfile}</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
              <p>
                <strong>{content.modal.hint}:</strong> {content.modal.addCriticalTestedAntibiotics}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                    {content.modal.antibioticName}
                  </label>
                  <Input
                    list="antibiotic-list"
                    placeholder="Ex: Meropenem"
                    value={newAntibiotic.name}
                    onChange={(e) =>
                      setNewAntibiotic({ ...newAntibiotic, name: e.target.value })
                    }
                    onKeyPress={(e) => e.key === 'Enter' && addAntibiotic()}
                  />
                  <datalist id="antibiotic-list">
                    {antibioticSuggestions.map((a) => (
                      <option key={a} value={a} />
                    ))}
                  </datalist>
                </div>

                <div className="w-20">
                  <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                    {content.modal.result}
                  </label>
                  <select
                    value={newAntibiotic.result}
                    onChange={(e) =>
                      setNewAntibiotic({
                        ...newAntibiotic,
                        result: e.target.value as ResultType,
                      })
                    }
                    className="w-full border rounded px-2 py-2 text-sm"
                  >
                    <option value="S">S</option>
                    <option value="I">I</option>
                    <option value="R">R</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={addAntibiotic}
                    variant="outline"
                    size="sm"
                    className="h-10"
                  >
                    <Plus size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {formData.antibiogram.length > 0 && (
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">{content.modal.antibioticName}</th>
                      <th className="text-center px-3 py-2 font-semibold">{content.modal.result}</th>
                      <th className="text-right px-3 py-2 font-semibold">{content.modal.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.antibiogram.map((antibiotic, index) => (
                      <tr key={index} className="border-b hover:bg-slate-50">
                        <td className="px-3 py-2">{antibiotic.name}</td>
                        <td className="text-center px-3 py-2">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-bold ${antibiotic.result === 'S'
                              ? 'bg-green-100 text-green-800'
                              : antibiotic.result === 'I'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {antibiotic.result}
                          </span>
                        </td>
                        <td className="text-right px-3 py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAntibiotic(index)}
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
              <AlertCircle size={18} /> <span>{content.modal.epidemiologicalContext}</span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                {content.modal.eventType} *
              </label>
              <select
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({ ...formData, eventType: e.target.value as EventType })
                }
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="isolated">{content.modal.isolatedCase}</option>
                <option value="cluster">{content.modal.cluster}</option>
                <option value="suspected_outbreak">{content.modal.suspectedOutbreak}</option>
                <option value="confirmed_outbreak">{content.modal.confirmedOutbreakOrEmergency}</option>
                <option value="regional_emergency">{content.modal.regionalEmergency}</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                  {content.modal.environment} *
                </label>
                <select
                  value={formData.environment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      environment: e.target.value as Environment,
                    })
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="community">{content.modal.community}</option>
                  <option value="hospital">{content.modal.hospital}</option>
                  <option value="icu">{content.modal.icu}</option>
                  <option value="outpatient">{content.modal.outpatient}</option>
                  <option value="other">{content.modal.other}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                  {content.modal.sampleOrigin} *
                </label>
                <select
                  value={formData.sampleOrigin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sampleOrigin: e.target.value as SampleOrigin,
                    })
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="blood_culture">{content.modal.bloodCulture}</option>
                  <option value="urine">{content.modal.urine}</option>
                  <option value="swab">{content.modal.swab}</option>
                  <option value="respiratory_secretion">{content.modal.respiratorySecretion}</option>
                  <option value="csf">{content.modal.csf}</option>
                  <option value="other">{content.modal.other}</option>
                </select>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-4">
              <label className="text-xs font-bold uppercase text-amber-900 block mb-2">
                📊 {content.modal.isolatesCount}
              </label>
              <Input
                type="number"
                min="1"
                placeholder={content.modal.isolatesCountPlaceholder}
                value={formData.isolatesCount || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isolatesCount: parseInt(e.target.value) || 1,
                  })
                }
                className="bg-white"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
              <MapPin size={18} /> <span>{content.modal.locationAndReport}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                  {content.modal.country} *
                </label>
                <Input
                  placeholder={content.modal.countryExample}
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                  {content.modal.state} *
                </label>
                <Input
                  placeholder={content.modal.stateExample}
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                  {content.modal.city}
                </label>
                <Input
                  placeholder={content.modal.cityExample}
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1 mb-1">
                  <Hospital size={14} /> {content.modal.healthcareInstitution}
                </label>
                <Input
                  placeholder={content.modal.healthcareInstitutionExample}
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1 mb-1">
                  <User size={14} /> {content.modal.reportedBy}
                </label>
                <Input
                  placeholder={content.modal.nameOrProfessional}
                  value={formData.reportedBy}
                  onChange={(e) =>
                    setFormData({ ...formData, reportedBy: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
              <AlertCircle size={18} /> <span>{content.modal.timeline}</span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                {content.modal.detectionDate} *
              </label>
              <Input
                type="date"
                value={formData.detectionDate}
                onChange={(e) =>
                  setFormData({ ...formData, detectionDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                {content.modal.eventStartDate} *
              </label>
              <Input
                type="date"
                value={formData.eventStartDate}
                onChange={(e) =>
                  setFormData({ ...formData, eventStartDate: e.target.value })
                }
              />
            </div>

            {formData.eventType === 'confirmed_outbreak' && (
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                  {content.modal.eventEndDate}
                </label>
                <Input
                  type="date"
                  value={formData.eventEndDate || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, eventEndDate: e.target.value })
                  }
                />
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4">
              <AlertTriangle size={18} /> <span>{content.modal.classificationAndReview}</span>
            </div>

            <div className="p-4 border rounded bg-blue-50 border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                {content.modal.suggestedSeverity}:
              </p>
              <p className="text-2xl font-bold mb-3">
                {severityAnalysis.suggested === 'critical' && '🔴 ' + content.critical}
                {severityAnalysis.suggested === 'watch' && '🟡 ' + content.watch}
                {severityAnalysis.suggested === 'info' && '🟢 ' + content.info}
              </p>
              {severityAnalysis.reasons.length > 0 && (
                <ul className="text-sm list-disc ml-4 space-y-1">
                  {severityAnalysis.reasons.map((reason, i) => (
                    <li key={i} className="text-blue-800">
                      {reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.useSuggestedSeverity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      useSuggestedSeverity: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">
                  {content.modal.useSuggestedSeverity}
                </span>
              </label>

              {!formData.useSuggestedSeverity && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <select
                    value={formData.manualSeverity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        manualSeverity: e.target.value as Severity,
                      })
                    }
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="info">🟢 {content.info}</option>
                    <option value="watch">🟡 {content.watch}</option>
                    <option value="critical">🔴 {content.critical}</option>
                  </select>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border rounded p-4 text-sm space-y-3 max-h-80 overflow-y-auto">
              <p className="font-semibold text-slate-900 border-b pb-2">{content.modal.completeAlertSummary}</p>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold text-slate-700">{content.modal.title}:</span>
                    <p className="text-slate-600">{formData.title}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">{content.modal.bacteria}:</span>
                    <p className="text-slate-600">{formData.bacterium}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">{content.modal.resistanceMechanism}:</span>
                    <p className="text-slate-600">{formData.resistance || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">📊 {content.modal.isolates}:</span>
                    <p className="text-slate-600 font-bold text-base">{formData.isolatesCount}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">{content.modal.country}:</span>
                    <p className="text-slate-600">{formData.country}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">{content.modal.healthcareInstitution}:</span>
                    <p className="text-slate-600">{formData.institution || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">{content.modal.reportedBy}:</span>
                    <p className="text-slate-600">{formData.reportedBy || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">{content.modal.eventType}:</span>
                    <p className="text-slate-600">{formData.eventType}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">{content.modal.environment}:</span>
                    <p className="text-slate-600">{formData.environment}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">{content.modal.sampleOrigin}:</span>
                    <p className="text-slate-600">{formData.sampleOrigin}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">{content.modal.detectionDate}:</span>
                    <p className="text-slate-600">{formData.detectionDate}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">{content.modal.eventStartDate}:</span>
                    <p className="text-slate-600">{formData.eventStartDate}</p>
                  </div>
                </div>

                {formData.antibiogram.length > 0 && (
                  <div className="border-t pt-2">
                    <span className="font-semibold text-slate-700 block mb-1">{content.modal.antibiotics}:</span>
                    <div className="flex flex-wrap gap-1">
                      {formData.antibiogram.map((a, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded text-xs font-bold ${a.result === 'S'
                            ? 'bg-green-100 text-green-800'
                            : a.result === 'I'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {a.name} ({a.result})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    content.modal.identificationOfPathogen,
    content.modal.detectionType,
    content.modal.epidemiologicalContext,
    content.modal.locationAndReport,
    content.modal.timeline,
    content.modal.classificationAndReview,
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <AlertOctagon className="text-red-600" size={24} />
            {content.modal.createNewAlert}
          </DialogTitle>
          <DialogDescription>
            {content.modal.step} {step + 1} {content.modal.of} {stepTitles.length}: {stepTitles[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 flex gap-1">
            {stepTitles.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded ${index <= step ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
              />
            ))}
          </div>
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 0}
            className="gap-2"
          >
            <ChevronLeft size={16} /> {content.modal.previous}
          </Button>

          <div className="flex gap-2">
            {step < 5 && (
              <Button onClick={nextStep} className="gap-2">
                {content.modal.next} <ChevronRight size={16} />
              </Button>
            )}

            {step === 5 && (
              <Button
                onClick={handleSubmit}
                disabled={addAlertMutation.isLoading}
                className="gap-2"
              >
                {addAlertMutation.isLoading ? content.modal.publishing : content.modal.submitAlert}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}