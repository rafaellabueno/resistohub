import DefaultLayout, { openLoginModalAtom } from "@/layout/default";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AlertCard from '@/components/alertCard';
import AlertFilters, { FilterState } from '@/components/alertFilters';
import SurveillanceMap from '@/components/surveillanceMap';
import {
  Activity,
  RefreshCw,
  AlertOctagon,
  Loader2,
  Map as MapIcon,
  BarChart3,
  Globe,
  LayoutList,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldAlert,
  Dna,
  Building2
} from 'lucide-react';
import { api } from '@/utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { useRouter } from "next/router";
import { clientContent } from "@/language/client";
import { useAtom } from "jotai";
import NewAlertModal from '@/components/NewAlertModal';
import { Input } from "@/components/ui/input";
import SurveillanceStats from "@/components/surveillanceStats";
import { getAlertStats } from "@/lib/mockData";

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

export default function SurveillanceDashboard() {
  const { locale } = useRouter();
  const { surveillance: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent["en-us"];

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isNewAlertModalOpen, setIsNewAlertModalOpen] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useAtom(openLoginModalAtom);

  const [page, setPage] = useState(1);
  const limit = 10;
  const utils = api.useUtils();

  const [filters, setFilters] = useState<FilterState & { country?: string; state?: string; city?: string }>({
    searchTerm: '',
    eventType: [],
    environment: [],
    sampleOrigin: [],
    detectionType: [],
    certaintyDegree: [],
    resistance: '',
    bacterium: '',
    severity: [],
    country: '',
    state: '',
    city: '',
  });

  const userQuery = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  });
  const isAuthenticated = !!userQuery.data?.id;
  const deleteAlertMutation = api.surveillance.deleteAlert.useMutation({
    onSuccess: async () => {
      await utils.surveillance.getAlerts.invalidate();
      await utils.surveillance.getSurveillanceAnalytics.invalidate();
      setSelectedAlert(null);
    },
  });

  const analyticsQuery = api.surveillance.getSurveillanceAnalytics.useQuery(filters);

  const alertsQuery = api.surveillance.getAlerts.useQuery({
    ...filters,
    limit,
    offset: (page - 1) * limit,
  });

  const alerts = useMemo(() => {
    const rawData = alertsQuery.data as any;
    const alertsList = rawData?.alerts || rawData?.result?.data?.alerts || (Array.isArray(rawData) ? rawData : []);

    return alertsList.map((alert: any) => ({
      ...alert,
      createdAt: alert.createdAt ? new Date(alert.createdAt) : undefined,
    })) as Alert[];
  }, [alertsQuery.data]);

  const totalCount = (alertsQuery.data as any)?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);

  const insights = useMemo(() => {
    const countries = new Set(alerts.map(a => a.location?.country).filter(Boolean));
    const bacteria = new Set(alerts.map(a => a.bacterium).filter(Boolean));
    const cities = new Set(alerts.map(a => a.location?.city).filter(Boolean));

    let totalR = 0;
    let totalTests = 0;
    alerts.forEach(a => {
      a.antibiogram?.forEach(ab => {
        totalTests++;
        if (ab.result === 'R') totalR++;
      });
    });

    return {
      countriesCount: countries.size,
      bacteriaCount: bacteria.size,
      citiesCount: cities.size,
      resistanceRate: totalTests > 0 ? Math.round((totalR / totalTests) * 100) : 0
    };
  }, [alerts]);

  const stats = getAlertStats(alerts);

  const statusStats = useMemo(() => {
    const monitoring = alerts.filter(a => a.status === 'monitoring').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;
    const total = alerts.length;
    return { monitoring, resolved, total };
  }, [alerts]);

  const resistancePatterns = useMemo(() => {
    const data: { [key: string]: { S: number; I: number; R: number } } = {};
    alerts.forEach(alert => {
      const bacterium = alert.bacterium || content.unknown;
      if (!data[bacterium]) data[bacterium] = { S: 0, I: 0, R: 0 };
      alert.antibiogram?.forEach(ab => {
        if (ab.result && data && data[bacterium] && data[bacterium][ab.result] !== undefined) data[bacterium][ab.result]++;
      });
    });
    return Object.entries(data).map(([bacterium, results]) => ({
      bacterium, ...results,
      resistanceRate: results.S + results.I + results.R > 0 ? Math.round((results.R / (results.S + results.I + results.R)) * 100) : 0,
    })).sort((a, b) => b.resistanceRate - a.resistanceRate).slice(0, 8);
  }, [alerts]);

  const resistanceByEnvironment = useMemo(() => {
    const envs: { [key: string]: { R: number; total: number } } = {};
    alerts.forEach(alert => {
      const env = alert.environment || content.other;
      if (!envs[env]) envs[env] = { R: 0, total: 0 };
      alert.antibiogram?.forEach(ab => {
        const envData = envs[env];
        if (envData) {
          alert.antibiogram?.forEach(ab => {
            envData.total++;
            if (ab.result === 'R') envData.R++;
          });
        }
      });
    });
    return Object.entries(envs).map(([name, data]) => ({
      name, rate: data.total > 0 ? Math.round((data.R / data.total) * 100) : 0
    }));
  }, [alerts]);

  const analyticsData = analyticsQuery.data?.metrics;

  const severityChartData = useMemo(() => {
    return analyticsData?.severityDistribution.map(item => ({
      name: item.severity === 'critical' ? content.critical : item.severity === 'watch' ? content.watch : item.severity === 'info' ? content.info : content.unknown,
      value: item.total,
    })) || [];
  }, [analyticsData]);

  const environmentChartData = useMemo(() => {
    return analyticsData?.environmentDistribution.map(item => ({
      name: item.environment === 'community' ? content.modal.community : item.environment === 'hospital' ? content.modal.hospital : item.environment === 'icu' ? content.modal.icu : item.environment === 'outpatient' ? content.modal.outpatient : item.environment === 'other' ? content.modal.other : content.unknown,
      value: item.total,
    })) || [];
  }, [analyticsData]);

  const monthlyTrendChartData = useMemo(() => {
    return analyticsData?.monthlyTrend.map(item => ({
      name: item.month,
      value: item.total,
    })) || [];
  }, [analyticsData]);

  const topBacteriaData = useMemo(() => {
    return analyticsData?.topBacteria || [];
  }, [analyticsData]);

  const topResistanceData = useMemo(() => {
    return analyticsData?.topResistance || [];
  }, [analyticsData]);

  const COLORS = ['#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6'];

  const handleReportClick = () => {
    if (!isAuthenticated) { setOpenLoginModal(true); return; }
    setIsNewAlertModalOpen(true);
  };

  const handleReset = () => {
    setFilters({
      searchTerm: '', eventType: [], environment: [], sampleOrigin: [], detectionType: [], certaintyDegree: [], resistance: '', bacterium: '', severity: [], country: '', state: '', city: ''
    });
    setPage(1);
  };

  const handleNewAlert = async () => {
    await utils.surveillance.getAlerts.invalidate();
    setIsNewAlertModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">

      <section className="bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 bg-repeat"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 mt-4 mb-4">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-red-500/20 text-red-200 text-sm font-medium mb-6 border border-red-500/30 backdrop-blur-sm">
              <Activity className="w-4 h-4 mr-2" />
              <span>{content.globalSurveillance}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-red-200 to-orange-200 leading-tight">
              {content.globalHealthSurveillance}
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mb-8 leading-relaxed">
              {content.realTime}
            </p>
          </div>

          <div className="flex-shrink-0">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6 rounded-2xl max-w-sm">
              <div className="text-center">
                <AlertOctagon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">{content.reportAlert}</h3>
                <p className="text-gray-300 text-sm mb-4">{content.provideInformation}</p>
                <Button
                  onClick={() => handleReportClick()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/25"
                >
                  <AlertOctagon className="w-4 h-4 mr-2" />
                  {content.reportAlert}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section >

      <section className="py-12 bg-gray-50 dark:bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          <SurveillanceStats stats={stats} />
        </div>
      </section>


      <main className="flex-1 max-w-[1800px] mx-auto w-full p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">

        <aside className="lg:w-[360px] flex-shrink-0">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden sticky top-6">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 py-4 px-6">
              <CardTitle className="text-xs font-black uppercase text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-2"><Filter size={16} /> {content.filterCenter}</span>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-[10px] font-black text-red-500">{content.clearFilters}</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Globe size={12} /> {content.location}
                </h4>
                <div className="space-y-2">
                  <Input
                    placeholder={content.country}
                    className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950"
                    value={filters.country}
                    onChange={(e) => { setFilters({ ...filters, country: e.target.value }); setPage(1); }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={content.modal.state}
                      className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950"
                      value={filters.state}
                      onChange={(e) => { setFilters({ ...filters, state: e.target.value }); setPage(1); }}
                    />
                    <Input
                      placeholder={content.modal.city}
                      className="h-10 rounded-xl bg-slate-50 dark:bg-slate-950"
                      value={filters.city}
                      onChange={(e) => { setFilters({ ...filters, city: e.target.value }); setPage(1); }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <AlertFilters
                  filters={filters}
                  onFiltersChange={(f) => { setFilters({ ...filters, ...f }); setPage(1); }}
                  onReset={handleReset}
                />
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <Tabs defaultValue="surveillance" className="flex-1 flex flex-col">
            <TabsList
              className="
    grid grid-cols-2 w-full h-auto
    lg:flex lg:w-max lg:h-12
    
    bg-slate-100 dark:bg-slate-900
    p-1.5 rounded-xl lg:rounded-full
    mx-auto gap-1.5 lg:gap-2
  "
            >
              <TabsTrigger
                value="surveillance"
                className="
      /* Base e Mobile */
      rounded-lg lg:rounded-full
      px-4 py-2 lg:px-8 lg:py-0
      text-xs lg:text-sm
      font-bold lg:font-semibold
      flex items-center justify-center gap-2.5
      transition-all h-full
      
      /* Estados */
      data-[state=active]:bg-white
      dark:data-[state=active]:bg-slate-800
      data-[state=active]:shadow-md
      data-[state=active]:text-blue-600
      dark:data-[state=active]:text-white
    "
              >
                <LayoutList className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>{content.recentAlerts}</span>
              </TabsTrigger>

              <TabsTrigger
                value="reports"
                className="
      /* Base e Mobile */
      rounded-lg lg:rounded-full
      px-4 py-2 lg:px-8 lg:py-0
      text-xs lg:text-sm
      font-bold lg:font-semibold
      flex items-center justify-center gap-2.5
      transition-all h-full
      
      /* Estados */
      data-[state=active]:bg-white
      dark:data-[state=active]:bg-slate-800
      data-[state=active]:shadow-md
      data-[state=active]:text-blue-600
      dark:data-[state=active]:text-white
    "
              >
                <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>{content.reports}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="surveillance" className="flex-1 mt-0 focus-visible:outline-none overflow-hidden flex flex-col">
              <div className="grid lg:grid-cols-12 gap-6 flex-1 overflow-hidden">

                <div className="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {alertsQuery.isLoading ? (
                      <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
                        <Loader2 className="w-12 h-12 animate-spin text-red-600" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{content.synchronizingDatabase}</p>
                      </div>
                    ) : alerts.length > 0 ? (
                      alerts.map((alert) => (
                        <div key={alert.id} className={`transition-all duration-300 ${selectedAlert?.id === alert.id ? 'scale-[1.01] shadow-2xl' : ''}`}>
                          <AlertCard
                            alert={alert}
                            isSelected={selectedAlert?.id === alert.id}
                            onClick={() => setSelectedAlert(alert)}
                            canDelete={alert.idUser === userQuery.data?.id}
                            onDelete={() => deleteAlertMutation.mutate({ id: alert.id })}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-20 text-center">
                        <Search className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{content.noAlertsFound}</p>
                      </div>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{content.totalAlerts}: {totalCount}</p>
                      <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl h-10 w-10">
                          <ChevronLeft size={18} />
                        </Button>
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{content.page}: {page} / {totalPages}</span>
                        <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl h-10 w-10">
                          <ChevronRight size={18} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5">
                  <Card className="border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden sticky top-5 h-[calc(100vh-350px)]">
                    <SurveillanceMap alerts={alerts} selectedAlert={selectedAlert} onAlertSelect={setSelectedAlert} content={content} />
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reports" className=" mt-0 focus-visible:outline-none overflow-y-auto custom-scrollbar pr-2">
              {analyticsQuery.isLoading && <Loader2 className="h-8 w-8 animate-spin text-gray-500" />}
              {!analyticsQuery.isLoading && analyticsData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de Distribuição por Severidade */}
                  <Card className="shadow-lg rounded-xl p-4">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{content.severityDistribution}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={severityChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />

                          <Legend
                            payload={severityChartData.map((item, index) => ({
                              value: item.name,
                              type: "square",
                              color: COLORS[index % COLORS.length],
                            }))}
                          />

                          <Bar dataKey="value">
                            {severityChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gráfico de Distribuição por Ambiente */}
                  <Card className="shadow-lg rounded-xl p-4">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{content.environmentDistribution}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={environmentChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                          >
                            {environmentChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gráfico de Tendência Temporal */}
                  <Card className="shadow-lg rounded-xl p-4 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{content.monthlyTrend}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyTrendChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line type="monotone" dataKey="value" stroke="#3B82F6" name={content.alerts} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Bactérias */}
                  <Card className="shadow-lg rounded-xl p-4">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{content.topBacteria}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {topBacteriaData.length > 0 ? (
                          topBacteriaData.map((item, index) => (
                            <li key={index} className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 dark:text-gray-300">{item.bacterium}</span>
                              <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full dark:text-blue-200 dark:bg-blue-900">{item.total}</span>
                            </li>
                          ))
                        ) : (
                          <p className="text-gray-500">{content.noData}</p>
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Top Mecanismos de Resistência */}
                  <Card className="shadow-lg rounded-xl p-4">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{content.topResistance}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {topResistanceData.length > 0 ? (
                          topResistanceData.map((item, index) => (
                            <li key={index} className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 dark:text-gray-300">{item.resistance}</span>
                              <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full dark:text-green-200 dark:bg-green-900">{item.total}</span>
                            </li>
                          ))
                        ) : (
                          <p className="text-gray-500">{content.noData}</p>
                        )}
                      </ul>
                    </CardContent>
                  </Card>

                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <NewAlertModal isOpen={isNewAlertModalOpen} onClose={() => setIsNewAlertModalOpen(false)} onSubmit={handleNewAlert} />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }
      `}</style>
    </div >
  );
}

SurveillanceDashboard.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};