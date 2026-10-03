
export type AlertSeverity = 'critical' | 'watch' | 'info' | null;

export interface GeoLocation {
  lat: number;
  lng: number;
  country: string;
  state: string;
  city: string;
}

interface AntibiogramEntry {
  name: string;
  result: 'S' | 'I' | 'R';
  mic?: number;
  method?: string;
  standard?: string;
  guidelineYear?: number;
}

export interface Alert {
  id: number;
  title: string;
  description?: string;
  severity?: 'critical' | 'watch' | 'info' | null;
  bacterium: string;
  resistance?: string;
  location?: {
    lat: number;
    lng: number;
    city: string;
    state: string;
    country: string
  };
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

export interface AlertStats {
  totalAlerts: number;
  criticalCount: number;
  watchCount: number;
  infoCount: number;
  countriesAffected: number;
}

export function getAlertStats(alerts: Alert[]): AlertStats {
  return {
    totalAlerts: alerts.length || 0,
    criticalCount: alerts.filter(a => a.severity === 'critical').length || 0,
    watchCount: alerts.filter(a => a.severity === 'watch').length || 0,
    infoCount: alerts.filter(a => a.severity === 'info').length || 0,
    countriesAffected: new Set(alerts.map(a => (a.location as { country: string }).country)).size
  };
}

export function groupAlertsByLocation(alerts: Alert[]): Record<string, Alert[]> {
  return alerts.reduce((acc, alert) => {
    const location = alert.location as { state: string; country: string };
    const key = `${location.state}, ${location.country}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(alert);
    return acc;
  }, {} as Record<string, Alert[]>);
}

export function getAlertsBySeverity(alerts: Alert[]): Record<string, Alert[]> {
  return {
    critical: alerts.filter(a => a.severity === 'critical'),
    watch: alerts.filter(a => a.severity === 'watch'),
    info: alerts.filter(a => a.severity === 'info')
  };
}
