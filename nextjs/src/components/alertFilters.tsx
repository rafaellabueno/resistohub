import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { useRouter } from 'next/router';
import { clientContent } from '@/language/client';

export interface FilterState {
  searchTerm: string;
  eventType: string[];
  environment: string[];
  sampleOrigin: string[];
  detectionType: string[];
  certaintyDegree: string[];
  resistance: string;
  bacterium: string;
  severity: string[];
}

interface AlertFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
}

export default function AlertFilters({ filters, onFiltersChange, onReset }: AlertFiltersProps) {
  const { locale } = useRouter();
  const { surveillance: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent["en-us"];
  const eventTypeOptions = [
    { value: 'isolated', label: content.modal.isolatedCase },
    { value: 'cluster', label: content.modal.cluster },
    { value: 'suspected_outbreak', label: content.modal.suspectedOutbreak },
    { value: 'confirmed_outbreak', label: content.modal.confirmedOutbreakOrEmergency },
    { value: 'regional_emergency', label: content.modal.regionalEmergency },
  ];

  const environmentOptions = [
    { value: 'community', label: content.modal.community },
    { value: 'hospital', label: content.modal.hospital },
    { value: 'icu', label: content.modal.icu },
    { value: 'outpatient', label: content.modal.outpatient },
    { value: 'other', label: content.modal.other },
  ];

  const sampleOriginOptions = [
    { value: 'blood_culture', label: 'Hemocultura' },
    { value: 'urine', label: content.modal.urine },
    { value: 'swab', label: content.modal.swab },
    { value: 'respiratory_secretion', label: content.modal.respiratorySecretion },
    { value: 'csf', label: content.modal.csf },
    { value: 'other', label: content.modal.other },
  ];

  const detectionTypeOptions = [
    { value: 'phenotypic', label: content.modal.phenotypicDetection },
    { value: 'pcr', label: content.modal.pcrDetection },
    { value: 'wgs', label: content.modal.wgsDetection },
    { value: 'other', label: content.modal.other },
  ];

  const certaintyDegreeOptions = [
    { value: 'lab_confirmed', label: content.modal.labConfirmed },
    { value: 'preliminary_data', label: content.modal.preliminaryData },
    { value: 'clinical_report', label: content.modal.clinicalReport },
    { value: 'sequencing_in_progress', label: content.modal.sequencingInProgress },
  ];

  const severityOptions = [
    { value: 'critical', label: content.modal.critical },
    { value: 'watch', label: content.watch },
    { value: 'info', label: content.info },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, searchTerm: e.target.value });
  };

  const handleEventTypeChange = (value: string) => {
    const newEventType = filters.eventType.includes(value)
      ? filters.eventType.filter(e => e !== value)
      : [...filters.eventType, value];
    onFiltersChange({ ...filters, eventType: newEventType });
  };

  const handleEnvironmentChange = (value: string) => {
    const newEnvironment = filters.environment.includes(value)
      ? filters.environment.filter(e => e !== value)
      : [...filters.environment, value];
    onFiltersChange({ ...filters, environment: newEnvironment });
  };

  const handleSampleOriginChange = (value: string) => {
    const newSampleOrigin = filters.sampleOrigin.includes(value)
      ? filters.sampleOrigin.filter(s => s !== value)
      : [...filters.sampleOrigin, value];
    onFiltersChange({ ...filters, sampleOrigin: newSampleOrigin });
  };

  const handleDetectionTypeChange = (value: string) => {
    const newDetectionType = filters.detectionType.includes(value)
      ? filters.detectionType.filter(d => d !== value)
      : [...filters.detectionType, value];
    onFiltersChange({ ...filters, detectionType: newDetectionType });
  };

  const handleCertaintyDegreeChange = (value: string) => {
    const newCertaintyDegree = filters.certaintyDegree.includes(value)
      ? filters.certaintyDegree.filter(c => c !== value)
      : [...filters.certaintyDegree, value];
    onFiltersChange({ ...filters, certaintyDegree: newCertaintyDegree });
  };

  const handleSeverityChange = (value: string) => {
    const newSeverity = filters.severity.includes(value)
      ? filters.severity.filter(s => s !== value)
      : [...filters.severity, value];
    onFiltersChange({ ...filters, severity: newSeverity });
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.eventType.length > 0 ||
    filters.environment.length > 0 ||
    filters.sampleOrigin.length > 0 ||
    filters.detectionType.length > 0 ||
    filters.certaintyDegree.length > 0 ||
    filters.resistance ||
    filters.bacterium ||
    filters.severity.length > 0;

  return (
    <div className="space-y-4">

      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          {content.search}
        </label>
        <Input
          placeholder={content.searchPlaceholder}
          value={filters.searchTerm}
          onChange={handleSearchChange}
          className="text-sm"
        />
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
            {content.modal.bacteriaAgent}
          </label>
          <Input
            placeholder={content.modal.taxonomicName}
            value={filters.bacterium}
            onChange={(e) => onFiltersChange({ ...filters, bacterium: e.target.value })}
            className="text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
            {content.modal.antimicrobialResistanceMechanism}
          </label>
          <Input
            placeholder={content.modal.antimicrobialResistanceMechanismExample}
            value={filters.resistance}
            onChange={(e) => onFiltersChange({ ...filters, resistance: e.target.value })}
            className="text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          {content.severity}
        </label>
        <div className="flex flex-wrap gap-2">
          {severityOptions.map((option) => (
            <Badge
              key={option.value}
              variant={filters.severity.includes(option.value) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => handleSeverityChange(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          {content.modal.eventType}
        </label>
        <div className="flex flex-wrap gap-2">
          {eventTypeOptions.map((option) => (
            <Badge
              key={option.value}
              variant={filters.eventType.includes(option.value) ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => handleEventTypeChange(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          {content.modal.environment}
        </label>
        <div className="flex flex-wrap gap-2">
          {environmentOptions.map((option) => (
            <Badge
              key={option.value}
              variant={filters.environment.includes(option.value) ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => handleEnvironmentChange(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          {content.modal.sampleOrigin}
        </label>
        <div className="flex flex-wrap gap-2">
          {sampleOriginOptions.map((option) => (
            <Badge
              key={option.value}
              variant={filters.sampleOrigin.includes(option.value) ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => handleSampleOriginChange(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          {content.modal.detectionType}
        </label>
        <div className="flex flex-wrap gap-2">
          {detectionTypeOptions.map((option) => (
            <Badge
              key={option.value}
              variant={filters.detectionType.includes(option.value) ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => handleDetectionTypeChange(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
          {content.modal.certaintyDegree}
        </label>
        <div className="flex flex-wrap gap-2">
          {certaintyDegreeOptions.map((option) => (
            <Badge
              key={option.value}
              variant={filters.certaintyDegree.includes(option.value) ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => handleCertaintyDegreeChange(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
