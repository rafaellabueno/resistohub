import React, { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Plus, Minus, RotateCcw } from 'lucide-react';

const geoUrl = '/world-110m.json';

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

interface Alert {
  id: number;
  title: string;
  description?: string;
  severity?: 'critical' | 'watch' | 'info' | null;
  bacterium: string;
  resistance?: string;
  location?: { city: string; state: string; country: string, lng: number, lat: number };
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

interface SurveillanceMapProps {
  alerts: Alert[];
  selectedAlert?: Alert | null | undefined;
  onAlertSelect: (alert: Alert) => void;
  content: any;
}

export default function SurveillanceMap({ alerts, selectedAlert, onAlertSelect, content }: SurveillanceMapProps) {
  const severityConfig = useMemo(() => ({
    critical: {
      color: '#DC2626',
      bgColor: '#FEE2E2',
      label: content?.critical || 'Crítico'
    },
    watch: {
      color: '#EA580C',
      bgColor: '#FFEDD5',
      label: content?.watch || 'Atenção'
    },
    info: {
      color: '#2563EB',
      bgColor: '#DBEAFE',
      label: content?.info || 'Informativo'
    }
  }), [content]);

  const [hoveredPin, setHoveredPin] = useState<string | number | null>(null);
  const [geographies, setGeographies] = useState<any[]>([]);
  const [position, setPosition] = useState({ coordinates: [0, 0] as [number, number], zoom: 1 });

  const validAlerts = useMemo(() => {
    return (alerts ?? []).filter(
      alert => alert?.severity && alert?.location
    );
  }, [alerts]);

  function handleZoomIn() {
    if (position.zoom >= 8) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  }

  function handleReset() {
    setPosition({ coordinates: [0, 0], zoom: 1 });
  }

  function handleMoveEnd(position: { coordinates: [number, number]; zoom: number }) {
    setPosition(position);
  }

  return (
    <div className="relative w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
      <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          title="Aumentar Zoom"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          title="Diminuir Zoom"
        >
          <Minus size={20} />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          title="Resetar Mapa"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="w-full h-96 relative">
        <ComposableMap projection="geoMercator">
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
          >
            <Geographies geography={geoUrl}>
              {({ geographies: geos }: { geographies: any[] }) => {
                if (geos.length > 0 && geographies.length === 0) {
                  setGeographies(geos);
                }
                return geos.map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: '#e2e8f0',
                        stroke: '#94a3b8',
                        strokeWidth: 0.75,
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 200ms ease-in-out',
                      },
                      hover: {
                        fill: '#cbd5e1',
                        stroke: '#64748b',
                        strokeWidth: 0.75,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: '#94a3b8',
                        stroke: '#475569',
                        strokeWidth: 0.75,
                        outline: 'none',
                      },
                    }}
                    className="dark:fill-slate-700 dark:hover:fill-slate-600 dark:stroke-slate-600 dark:hover:stroke-slate-500"
                  />
                ));
              }}
            </Geographies>

            {validAlerts.map((alert) => {
              const severity = alert.severity as Exclude<Alert['severity'], null | undefined>;
              const config = severityConfig[severity];
              const isSelected = selectedAlert?.id === alert.id;
              const isHovered = hoveredPin === alert.id;

              const alertWithLocation = alert as { location: { lng: number, lat: number, city: string, state: string, country: string } };

              const scale = 1 / position.zoom;

              return (
                <Marker
                  key={alert.id}
                  coordinates={[alertWithLocation.location.lng, alertWithLocation.location.lat]}
                >
                  <g
                    onMouseEnter={() => setHoveredPin(alert.id)}
                    onMouseLeave={() => setHoveredPin(null)}
                    onClick={() => onAlertSelect(alert)}
                    style={{ cursor: 'pointer' }}
                  >
                    {alert.severity === 'critical' && (
                      <circle
                        cx={0}
                        cy={0}
                        r={(isHovered ? 18 : 12) * scale}
                        fill={config.color}
                        opacity={0.2}
                        className="transition-all duration-200"
                        style={{
                          animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        }}
                      />
                    )}

                    <circle
                      cx={0}
                      cy={0}
                      r={(isSelected ? 8 : isHovered ? 7 : 6) * scale}
                      fill={config.color}
                      stroke="white"
                      strokeWidth={2 * scale}
                      className="transition-all duration-200 drop-shadow-lg"
                      style={{
                        filter: isSelected
                          ? `drop-shadow(0 0 ${8 * scale}px ${config.color}80)`
                          : `drop-shadow(0 ${2 * scale}px ${4 * scale}px ${config.color}40)`,
                      }}
                    />

                    <text
                      textAnchor="middle"
                      y={2 * scale}
                      fontSize={3 * scale}
                      fill="white"
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      📍
                    </text>

                    {isHovered && (
                      <g>
                        <rect
                          x={-50 * scale}
                          y={-45 * scale}
                          width={100 * scale}
                          height={30 * scale}
                          rx={6 * scale}
                          fill={config.color}
                          opacity={0.95}
                          style={{ filter: `drop-shadow(0 ${4 * scale}px ${6 * scale}px rgba(0,0,0,0.2))` }}
                        />
                        <text
                          textAnchor="middle"
                          y={-25 * scale}
                          fontSize={12 * scale}
                          fill="white"
                          fontWeight="bold"
                          pointerEvents="none"
                          style={{ textShadow: `0 ${1 * scale}px ${2 * scale}px rgba(0,0,0,0.3)` }}
                        >
                          {(alert.location as { state?: string }).state || 'Local'}
                        </text>
                      </g>
                    )}
                  </g>
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-100/20 to-transparent dark:from-slate-900/20" />
      </div>

      <div className="bg-white dark:bg-slate-800 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{content.legend}:</div>
          {Object.entries(severityConfig).map(([severity, config]) => (
            <div key={severity} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedAlert && (
        <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 max-w-xs border border-slate-200 dark:border-slate-700 z-30">
          <div className="flex items-start gap-2">
            {selectedAlert.severity && (
              <div
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: severityConfig[selectedAlert.severity].color }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                {(selectedAlert.location as { state?: string }).state || 'Local'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {selectedAlert.title}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}