import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Beaker, Building2, Microscope, AlertTriangle, Droplet, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { clientContent } from '@/language/client';

interface AntibiogramEntry {
  name: string;
  result: 'S' | 'I' | 'R';
  mic?: number;
  method?: string;
  standard?: string;
  guidelineYear?: number;
}

interface AlertData {
  id: number;
  title: string;
  description?: string;
  severity?: 'critical' | 'watch' | 'info' | null;
  bacterium: string;
  resistance?: string;
  location?: { city: string; state: string; country: string };
  facility?: string;
  reportedBy?: string;
  isolatesCount?: number;
  antibiogram?: AntibiogramEntry[];
  status?: 'monitoring' | 'resolved' | 'closed';
  createdAt?: Date | string;
  createdBy?: string;
  idUser?: number;
  eventType?: string;
  environment?: string;
  sampleOrigin?: string;
  detectionDate?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  detectionType?: string;
  certaintyDegree?: string;
  institution?: string;
}

interface AlertCardProps {
  alert: AlertData;
  isSelected?: boolean;
  onClick?: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
}

const getResistanceColor = (result: 'S' | 'I' | 'R') => {
  switch (result) {
    case 'R': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
    case 'I': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
    case 'S': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
  }
};

export default function AlertCard({ alert, isSelected = false, onClick, canDelete = false, onDelete }: AlertCardProps) {
  const { locale } = useRouter();
  const { surveillance: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent["en-us"];
  const severityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    critical: { label: content.critical, color: '#DC2626', bgColor: '#FEE2E2' },
    watch: { label: content.watch, color: '#EA580C', bgColor: '#FFEDD5' },
    info: { label: content.info, color: '#2563EB', bgColor: '#DBEAFE' }
  };

  const eventTypeLabels: Record<string, string> = {
    isolated: content.modal.isolatedCase,
    cluster: content.modal.cluster,
    suspected_outbreak: content.modal.suspectedOutbreak,
    confirmed_outbreak: content.modal.confirmedOutbreakOrEmergency,
    regional_emergency: content.modal.regionalEmergency,

  };

  const environmentLabels: Record<string, string> = {
    community: content.modal.community,
    hospital: content.modal.hospital,
    icu: content.modal.icu,
    outpatient: content.modal.outpatient,
    other: content.modal.other,
  };

  const sampleOriginLabels: Record<string, string> = {
    blood_culture: content.modal.bloodCulture,
    urine: content.modal.urine,
    swab: content.modal.swab,
    respiratory_secretion: content.modal.respiratorySecretion,
    csf: content.modal.csf,
    other: content.modal.other,
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return content.now;
    if (diffMins < 60) return `${diffMins}m ` + content.ago;
    if (diffHours < 24) return `${diffHours}h ` + content.ago;
    if (diffDays < 7) return `${diffDays}d ` + content.ago;

    return dateObj.toLocaleDateString(locale as keyof typeof clientContent, { month: 'short', day: 'numeric' });
  };

  const formatDateDisplay = (date: string | undefined) => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(locale as keyof typeof clientContent, { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const config = alert.severity ? severityConfig[alert.severity] : severityConfig['info'];
  const resistantCount = alert.antibiogram?.filter(a => a.result === 'R').length || 0;

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-lg border transition-all duration-200 cursor-pointer
        ${isSelected
          ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg'
          : 'hover:shadow-md'
        }
      `}
      style={{
        borderLeftColor: config?.color,
        borderLeftWidth: '4px'
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge
            variant="secondary"
            className="text-xs font-bold"
            style={{ backgroundColor: config?.bgColor, color: config?.color }}
          >
            {config?.label}
          </Badge>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 whitespace-nowrap">
              <Clock size={12} />
              {formatDate(alert.createdAt)}
            </span>
            {canDelete && onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 size={12} />
              </Button>
            )}
          </div>
        </div>

        <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1 line-clamp-2">
          {alert.title}
        </h4>

        {alert.createdBy && (
          <div className="flex items-center mt-2 mb-3">
            <Avatar className="h-6 w-6 mr-2 ring-2 ring-white dark:ring-slate-700">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${alert.createdBy}`} />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-600 text-white text-xs">
                {alert.createdBy?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {alert.createdBy}
            </span>
          </div>
        )}

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
          {alert.description}
        </p>

        <div className="space-y-2 mb-3 pb-3 border-t border-slate-200 dark:border-slate-700 pt-3">
          <div className="flex items-start gap-2">
            <Beaker size={14} className="text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {alert.bacterium}
              </p>
              {alert.resistance && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {alert.resistance}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {alert.location && (
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {alert.location.city}, {alert.location.state}
                </p>
              )}
              {alert.facility && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {alert.facility}
                </p>
              )}
            </div>
          </div>
        </div>

        {alert.antibiogram && alert.antibiogram.length > 0 && (
          <div className="mb-3 pb-3 border-t border-slate-200 dark:border-slate-700 pt-3">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {content.antibiogram} ({resistantCount}R / {alert.antibiogram.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {alert.antibiogram.slice(0, 4).map((ab, idx) => (
                <span
                  key={idx}
                  className={`inline-block px-2 py-1 text-xs rounded font-medium ${getResistanceColor(ab.result)}`}
                >
                  {ab.name} {ab.result}
                </span>
              ))}
              {alert.antibiogram.length > 4 && (
                <span className="inline-block px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  +{alert.antibiogram.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {alert.isolatesCount && alert.isolatesCount > 0 && (
          <div className="mb-3 pb-3 border-t border-slate-200 dark:border-slate-700 pt-3">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">{alert.isolatesCount}</span> {alert.isolatesCount > 1 ? content.isolates : content.isolate}
            </p>
          </div>
        )}

        {(alert.eventType || alert.environment || alert.sampleOrigin) && (
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pb-3 border-t border-slate-200 dark:border-slate-700 pt-3">
            {alert.eventType && (
              <div className="flex items-center gap-2">
                <AlertTriangle size={12} className="flex-shrink-0" />
                <span>{eventTypeLabels[alert.eventType] || alert.eventType}</span>
              </div>
            )}
            {alert.environment && (
              <div className="flex items-center gap-2">
                <Building2 size={12} className="flex-shrink-0" />
                <span>{environmentLabels[alert.environment] || alert.environment}</span>
              </div>
            )}
            {alert.sampleOrigin && (
              <div className="flex items-center gap-2">
                <Droplet size={12} className="flex-shrink-0" />
                <span>{sampleOriginLabels[alert.sampleOrigin] || alert.sampleOrigin}</span>
              </div>
            )}
          </div>
        )}

        {(alert.detectionType || alert.certaintyDegree) && (
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pb-3 border-t border-slate-200 dark:border-slate-700 pt-3">
            {alert.detectionType && (
              <p>{content.modal.detectionType}: <span className="font-medium">{alert.detectionType}</span></p>
            )}
            {alert.certaintyDegree && (
              <p>{content.modal.certaintyDegree}: <span className="font-medium">{alert.certaintyDegree}</span></p>
            )}
          </div>
        )}

        {(alert.detectionDate || alert.eventStartDate) && (
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            {alert.detectionDate && (
              <p>{content.modal.detectionDate}: <span className="font-medium">{formatDateDisplay(alert.detectionDate)}</span></p>
            )}
            {alert.eventStartDate && (
              <p>{content.modal.eventStartDate}: <span className="font-medium">{formatDateDisplay(alert.eventStartDate)}</span></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
