import React from 'react';
import { AlertStats } from '@/lib/mockData';
import { AlertTriangle, AlertCircle, Info, Globe } from 'lucide-react';
import { useRouter } from 'next/router';
import { clientContent } from '@/language/client';

interface SurveillanceStatsProps {
  stats: AlertStats;
}

export default function SurveillanceStats({ stats }: SurveillanceStatsProps) {
  const router = useRouter();
  const { locale } = router;
  const { surveillance: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];

  const statCards = [
    {
      label: content.stats.criticalAlerts,
      value: stats.criticalCount,
      color: '#DC2626',
      bgColor: '#FEE2E2',
      icon: AlertTriangle,
      percentage: Math.round((stats.criticalCount / stats.totalAlerts) * 100) || 0
    },
    {
      label: content.stats.underSurveillance,
      value: stats.watchCount,
      color: '#EA580C',
      bgColor: '#FFEDD5',
      icon: AlertCircle,
      percentage: Math.round((stats.watchCount / stats.totalAlerts) * 100) || 0
    },
    {
      label: content.stats.informational,
      value: stats.infoCount,
      color: '#2563EB',
      bgColor: '#DBEAFE',
      icon: Info,
      percentage: Math.round((stats.infoCount / stats.totalAlerts) * 100) || 0
    },
    {
      label: content.stats.countriesAffected,
      value: stats.countriesAffected,
      color: '#10B981',
      bgColor: '#D1FAE5',
      icon: Globe,
      percentage: 100
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
            style={{ backgroundColor: card.bgColor + '20' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: card.bgColor }}
              >
                <Icon size={20} style={{ color: card.color }} />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {card.percentage}%
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
              {card.label}
            </p>

            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl font-bold"
                style={{ color: card.color }}
              >
                {card.value}
              </span>
              {card.percentage > 0 && card.percentage < 100 && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {stats.totalAlerts}
                </span>
              )}
            </div>

            <div className="mt-3 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${card.percentage}%`,
                  backgroundColor: card.color
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
