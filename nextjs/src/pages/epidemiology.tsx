import DefaultLayout from "@/layout/default";
import Head from "next/head";
import { Activity, Map as MapIcon, AlertOctagon, Calendar, Filter, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SurveillanceDashboard() {
  return (
    <>
      <Head>
        <title>Surveillance Dashboard | ResistoHub</title>
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Activity className="mr-3 text-red-500" /> Global Surveillance
            </h1>
            <p className="text-gray-500">Real-time alerts on outbreaks and resistance trends.</p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200">
            <AlertOctagon className="mr-2 h-4 w-4" /> Report Outbreak
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal: MAPA */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-2 border-gray-100">
              <div className="bg-slate-100 h-[450px] relative flex items-center justify-center group">
                {/* Placeholder para o Mapa (Substitua por Leaflet depois) */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center" />

                {/* Pins de Alerta Simulados */}
                <div className="absolute top-[40%] left-[30%] flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="relative flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                  </span>
                  <span className="text-xs font-bold bg-white px-1 rounded shadow mt-1">Brazil (SP)</span>
                </div>

                <div className="text-center z-10 p-6 bg-white/90 backdrop-blur rounded-xl shadow-sm">
                  <MapIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="font-semibold text-gray-700">Interactive Map Module</p>
                  <p className="text-xs text-gray-500">Visualizing geolocated AMR alerts</p>
                </div>
              </div>
              <div className="p-4 bg-white border-t flex gap-4">
                <div className="flex items-center text-sm text-gray-600"><span className="w-3 h-3 bg-red-500 rounded-full mr-2" /> Critical</div>
                <div className="flex items-center text-sm text-gray-600"><span className="w-3 h-3 bg-orange-500 rounded-full mr-2" /> Watch</div>
                <div className="flex items-center text-sm text-gray-600"><span className="w-3 h-3 bg-blue-500 rounded-full mr-2" /> Info</div>
              </div>
            </Card>
          </div>

          {/* Coluna Lateral: LISTA DE ALERTAS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Recent Alerts</h3>
              <Button variant="ghost" size="sm"><Filter className="w-4 h-4" /></Button>
            </div>

            <div className="h-[500px] overflow-y-auto pr-2 space-y-3">
              {/* Alerta 1 */}
              <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="destructive" className="text-[10px]">CRITICAL</Badge>
                    <span className="text-xs text-gray-400">2h ago</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-800">Polymyxin B Resistance</h4>
                  <p className="text-xs text-gray-600 mt-1">Hospital das Clínicas, SP. KPC-2 producing isolate confirmed.</p>
                </CardContent>
              </Card>

              {/* Alerta 2 */}
              <Card className="border-l-4 border-l-orange-400 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 text-[10px]">WATCH</Badge>
                    <span className="text-xs text-gray-400">1d ago</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-800">New NDM-1 Variant</h4>
                  <p className="text-xs text-gray-600 mt-1">Wastewater surveillance, North Region.</p>
                </CardContent>
              </Card>

              {/* Alerta 3 */}
              <Card className="border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-[10px]">INFO</Badge>
                    <span className="text-xs text-gray-400">3d ago</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-800">Protocol Update</h4>
                  <p className="text-xs text-gray-600 mt-1">CLSI released new breakpoints for Piperacillin-Tazobactam.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

SurveillanceDashboard.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};