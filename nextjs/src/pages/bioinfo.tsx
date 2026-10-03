import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Code,
  Sparkles,
  FileText,
  BarChart,
  X,
  Star,
  MessageSquare,
  Info,
  ChartLine,
  Combine,
  FileOutput,
  MessageCircleQuestion,
  Plus,
  Search,
  Code2,
  BookOpen,
  GitBranch,
  Mail,
  Zap,
  Settings,
  ExternalLink,
  Workflow,
  TrendingUp,
  Clock,
  Cpu,
  FileJson,
  Lightbulb,
  Users,
  CheckCircle,
  ArrowRight,
  Copy,
  Download,
  Eye,
  MapPin,
  Building2,
  Globe,
  Loader,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { clientContent } from '@/language/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DefaultLayout, { openLoginModalAtom } from '@/layout/default';
import { api } from "@/utils/api";
import { useAtom } from "jotai";
import { toast } from "@/components/ui/use-toast";
import { ZodUndefined } from "zod";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import TagInput from "@/components/ui/taginput";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

const InteractiveMap: React.FC<{
  locations: Array<{ id: string; name: string; institution: string; city: string; country: string; lat: number; lng: number; type: string }>;
}> = ({ locations }) => {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  const getColorByType = (type: string) => {
    const colors: Record<string, string> = {
      student: "#3b82f6",
      researcher: "#10b981",
      lab: "#f59e0b",
    };
    return colors[type] || "#6366f1";
  };

  return (
    <div className="w-full h-96 relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
      <ComposableMap projection="geoMercator">
        <ZoomableGroup
          zoom={position.zoom}
          center={[position.coordinates[0] || 0, position.coordinates[1] || 0]}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={geoUrl}>
            {({ geographies: geos }: { geographies: any[] }) => {
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

          {locations.map((location) => {
            const isHovered = hoveredPin === location.id;
            const color = getColorByType(location.type);
            const scale = 1 / position.zoom;

            return (
              <Marker key={location.id} coordinates={[location.lng, location.lat]}>
                <g
                  onMouseEnter={() => setHoveredPin(location.id)}
                  onMouseLeave={() => setHoveredPin(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={0}
                    cy={0}
                    r={(isHovered ? 7 : 6) * scale}
                    fill={color}
                    stroke="white"
                    strokeWidth={2 * scale}
                    className="transition-all duration-200 drop-shadow-lg"
                    style={{
                      filter: isHovered
                        ? `drop-shadow(0 0 ${8 * scale}px ${color}80)`
                        : `drop-shadow(0 ${2 * scale}px ${4 * scale}px ${color}40)`,
                    }}
                  />

                  {isHovered && (
                    <g>
                      <rect
                        x={-60 * scale}
                        y={-50 * scale}
                        width={120 * scale}
                        height={40 * scale}
                        rx={6 * scale}
                        fill={color}
                        opacity={0.95}
                        style={{ filter: `drop-shadow(0 ${4 * scale}px ${6 * scale}px rgba(0,0,0,0.2))` }}
                      />
                      <text
                        textAnchor="middle"
                        y={-28 * scale}
                        fontSize={11 * scale}
                        fill="white"
                        fontWeight="bold"
                        pointerEvents="none"
                        style={{ textShadow: `0 ${1 * scale}px ${2 * scale}px rgba(0,0,0,0.3)` }}
                      >
                        {location.name}
                      </text>
                      <text
                        textAnchor="middle"
                        y={-15 * scale}
                        fontSize={9 * scale}
                        fill="white"
                        pointerEvents="none"
                        opacity={0.9}
                      >
                        {location.city}
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
  );
};

function isTool(item: Tool | Workflow | UseCase): item is Tool {
  return "tool" in item;
}

function isWorkflow(item: Tool | Workflow | UseCase): item is Workflow {
  return "toolSequence" in item;
}

function isUseCase(item: Tool | Workflow | UseCase): item is UseCase {
  return "steps" in item;
}

interface Tool {
  id: number;
  tool: string;
  description: string;
  type: "tool" | "database";
  website?: string;
  github?: string;
  contact?: string;
  article?: string;
  install?: string;
  siteDoc?: string;
  update?: string;
  version?: string;
  authors?: string;
  citations?: number;
  githubStars?: number;
  pathogens?: string[];
  tags?: string[];
  articleLink?: string;
  inputFormats?: Array<{ format: string; example?: string; downloadLink?: string }>;
  datasetExamples?: Array<{ name: string; description: string; downloadLink?: string }>;
  executionTime?: "fast" | "medium" | "slow";
  computeRequirements?: "light" | "medium" | "heavy";
  programmingLanguage?: string;
  usedBy?: Array<{ id: string; name: string; institution: string; city: string; country: string; lat: number; lng: number }>;
  rating?: number;
  usageCount?: number;
  createdBy?: string;
}

interface Workflow {
  id: number;
  name: string | null;
  description: string | null;
  toolSequence?: Array<{ toolId: number; order: number }> | null;
  createdBy: string | null;
  authorName?: string | null;
  authorLastName?: string | null;
  rating?: number | null;
  usageCount?: number | null;
  tags?: string[] | null;
  difficulty?: "beginner" | "intermediate" | "advanced" | null;
  usedBy?: Array<{ id: string; name: string; institution: string; city: string; country: string; lat: number; lng: number; type: string }> | null;
  pipelineCode?: string | null;
  pipelineGitLink?: string | null;
  idUser?: number;
}

interface UseCase {
  id: number;
  title: string | null;
  description: string | null;
  recommendedTools?: number[] | null;
  steps: string | null;
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  isUserCreated?: boolean | null;
  createdBy?: string | null;
  authorName?: string | null;
  authorLastName?: string | null;
  usedBy?: Array<{ id: string; name: string; institution: string; city: string; country: string; lat: number; lng: number; type: string }> | null;
  tags?: string[] | null;
  rating?: number | null;
  usageCount?: number | null;
  idUser?: number;
}

interface UsageLocation {
  id: string;
  name: string;
  institution: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  type: "student" | "researcher" | "lab";
}

interface FeedbackLinkModalProps {
  url: string;
  icon?: React.ReactNode;
  onConfirm?: () => void;
  onClose?: () => void;
  buttonColor?: "emerald" | "blue" | "teal" | "purple" | "red";
  highlightColor?: "blue" | "green" | "amber" | "purple" | "red";
}

interface ToolCardProps {
  tool: Tool;
  onCompare?: (tool: Tool) => void;
  onViewUsage?: (tool: Tool) => void;
  onMarkAsUsing?: (toolName: string) => void;
  onRate?: (toolName: string, type: "workflow" | "usecase" | "tool" | "database", id: number) => void;
  handleOpenForumModal?: (tool: Tool) => void;
}

interface SuggestToolCardProps {
  onClick: () => void;
  type: "tool" | "database";
}

const SuggestToolCard: React.FC<SuggestToolCardProps> = ({ onClick, type }) => {
  const router = useRouter();
  const { locale } = router;
  const { bioinfo: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card
        onClick={onClick}
        className="overflow-hidden border-2 border-dashed border-teal-300 dark:border-teal-700 shadow-md hover:shadow-xl hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-300 bg-teal-50/30 dark:bg-teal-950/10 cursor-pointer group"
      >
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-teal-800 dark:text-teal-200">
              {content.suggestTool}
            </h3>
            <p className="text-teal-600/80 dark:text-teal-400/80 mt-1">
              {type === "tool" ? content.doYouKnow : content.doYouKnow}
            </p>
          </div>
          <Button variant="outline" className="border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Sparkles className="w-4 h-4 mr-2" />
            {content.submitSuggestion}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ToolCard: React.FC<ToolCardProps> = ({ tool, onCompare, onViewUsage, onMarkAsUsing, onRate, handleOpenForumModal }) => {
  const executionTimeColors = {
    fast: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    slow: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const computeColors = {
    light: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    medium: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    heavy: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  };

  const router = useRouter();
  const { locale } = router;
  const { bioinfo: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];
  const [showMap, setShowMap] = useState(false);

  const locations = api.bioinfo.getToolLocations.useQuery(
    { id: tool?.id ?? 0 },
    { enabled: !!tool?.id }
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-300 bg-white dark:bg-gray-900">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-b-2 border-teal-100 dark:border-teal-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {tool.type === "database" ? <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" /> : <Code className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">{tool.tool}</CardTitle>
              </div>
              <CardDescription className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{tool.description}</CardDescription>
              {tool.pathogens && tool.pathogens.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tool.pathogens.map((pathogen: string) => (
                    <Badge key={pathogen} className="bg-teal-100 text-teal-800 dark:bg-teal-800/30 dark:text-teal-200 border-teal-200 dark:border-teal-600">
                      {pathogen}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 cursor-pointer hover:scale-105 transition-transform" onClick={() => onRate?.(tool.tool, tool.type, tool.id)}>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{tool.rating?.toFixed(1) ?? "0.0"}</span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-0 pt-3 sm:pt-0">
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/community?toolId=${tool.id}`)}
                    className="h-9 px-2 sm:px-3 bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  >
                    <MessageSquare className="h-4 w-4 sm:mr-2" />
                    <span className="text-xs font-semibold hidden xs:inline-block">{content.whatPeopleSaying}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenForumModal?.(tool)}
                    className="h-9 px-2 sm:px-3 bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  >
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="text-xs font-semibold hidden xs:inline-block">{content.startTopic}</span>
                  </Button>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardHeader>


        <CardContent className="p-0">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="flex w-full overflow-x-auto overflow-y-hidden justify-start md:grid md:grid-cols-7 h-auto p-0 bg-gray-50/80 dark:bg-gray-800/80 rounded-none border-b border-gray-200/50 dark:border-gray-700/50 no-scrollbar">
              <TabsTrigger
                value="info"
                className="flex-shrink-0 min-w-[100px] md:min-w-0 rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-xs py-3"
              >
                <Info className="mr-1 h-3 w-3" /> {content?.tabs?.info}
              </TabsTrigger>

              <TabsTrigger
                value="specs"
                className="flex-shrink-0 min-w-[100px] md:min-w-0 rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-xs py-3"
              >
                <Settings className="mr-1 h-3 w-3" /> {content?.tabs?.specs}
              </TabsTrigger>

              <TabsTrigger
                value="install"
                className="flex-shrink-0 min-w-[100px] md:min-w-0 rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-xs py-3"
              >
                <Code2 className="mr-1 h-3 w-3" /> {content?.tabs?.install}
              </TabsTrigger>

              <TabsTrigger
                value="formats"
                className="flex-shrink-0 min-w-[100px] md:min-w-0 rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-xs py-3"
              >
                <FileJson className="mr-1 h-3 w-3" /> {content?.tabs?.formats}
              </TabsTrigger>

              <TabsTrigger
                value="dataset"
                className="flex-shrink-0 min-w-[100px] md:min-w-0 rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-xs py-3"
              >
                <Database className="mr-1 h-3 w-3" /> {content?.tabs?.dataset}
              </TabsTrigger>

              <TabsTrigger
                value="stats"
                className="flex-shrink-0 min-w-[100px] md:min-w-0 rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-xs py-3"
              >
                <ChartLine className="mr-1 h-3 w-3" /> {content?.tabs?.stats}
              </TabsTrigger>

              <TabsTrigger
                value="usage"
                className="flex-shrink-0 min-w-[100px] md:min-w-0 rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-xs py-3"
              >
                <MapPin className="mr-1 h-3 w-3" /> {content?.tabs?.usage}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tool.website && (
                  <a href={tool.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline">
                    <ExternalLink size={16} />
                    {content?.officialWebsite}
                  </a>
                )}
                {tool.github && (
                  <a href={tool.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline">
                    <GitBranch size={16} />
                    {content?.githubRepository}
                  </a>
                )}
                {tool.siteDoc && (
                  <a href={tool.siteDoc} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline">
                    <BookOpen size={16} />
                    {content?.documentation}
                  </a>
                )}
              </div>
            </TabsContent>

            <TabsContent value="specs" className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tool.executionTime && (
                  <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{content?.executationTime}</p>
                    <Badge className={executionTimeColors[tool.executionTime]}>
                      {tool.executionTime === "fast" ? "⚡ Fast" : tool.executionTime === "medium" ? "⏱️ Medium" : "🐢 Slow"}
                    </Badge>
                  </div>
                )}
                {tool.computeRequirements && (
                  <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{content?.computeRequirements}</p>
                    <Badge className={computeColors[tool.computeRequirements]}>
                      {tool.computeRequirements === "light" ? "💻 Light" : tool.computeRequirements === "medium" ? "🖥️ Medium" : "⚙️ Heavy"}
                    </Badge>
                  </div>
                )}
                {tool.programmingLanguage && (
                  <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{content?.language}</p>
                    <p className="text-sm font-semibold">{tool.programmingLanguage}</p>
                  </div>
                )}
                {tool.version && (
                  <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{content?.version}</p>
                    <p className="text-sm font-semibold">{tool.version}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="install" className="p-6">
              {tool.install ? (
                <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-lg">
                  <p className="text-gray-400 text-xs mb-2">{content?.installationCommand}</p>
                  <code className="text-green-400 font-mono text-sm break-all">{tool.install}</code>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">{content?.installationNotAvailable}</p>
              )}
            </TabsContent>

            <TabsContent value="formats" className="p-6 space-y-4">
              {tool.inputFormats && tool.inputFormats.length > 0 ? (
                tool.inputFormats.map((fmt, idx) => (
                  <div key={idx} className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200">{fmt.format}</Badge>
                      {fmt.downloadLink && (
                        <a href={fmt.downloadLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm">
                          <Download size={14} />
                          {content?.example}
                        </a>
                      )}
                    </div>
                    {fmt.example && <p className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded">{fmt.example}</p>}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">{content?.noInputFormats}</p>
              )}
            </TabsContent>

            <TabsContent value="dataset" className="p-6 space-y-4">
              {tool.datasetExamples && tool.datasetExamples.length > 0 ? (
                tool.datasetExamples.map((dataset, idx) => (
                  <div key={idx} className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-200">{dataset.name}</Badge>
                      {dataset.downloadLink && (
                        <a href={dataset.downloadLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline text-sm">
                          <Download size={14} />
                          Download
                        </a>
                      )}
                    </div>
                    {dataset.description && <p className="text-sm text-gray-700 dark:text-gray-300">{dataset.description}</p>}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">{content?.noDatasetExamples}</p>
              )}
            </TabsContent>

            <TabsContent value="stats" className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{tool.rating?.toFixed(1) ?? 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{content?.rating}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <BarChart className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{tool.citations ?? 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{content?.citations}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{tool.githubStars ?? 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{content?.gitHubStars}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Users className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{tool.usedBy?.length ?? 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{content?.users}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="p-6">
              {locations.data && locations.data.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300"> {content?.usedBy} {locations.data.length} {content?.usersInstitutions}:</p>
                    <Button
                      onClick={() => setShowMap(!showMap)}
                      size="sm"
                      variant="outline"
                      className="bg-emerald-600 text-white hover:bg-emerald-700 border-none w-full sm:w-auto"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      {showMap ? content?.hideMap || "Ocultar Mapa" : content?.viewOnMap || "Ver no Mapa"}
                    </Button>
                  </div>

                  {showMap && locations.data ? (
                    <div className="mb-4">
                      <InteractiveMap
                        locations={locations.data?.map(location => ({
                          id: location.id.toString(),
                          name: location.name ?? '',
                          type: location.type ?? '',
                          country: location.country,
                          institution: location.institution ?? '',
                          city: location.city,
                          lat: location.lat,
                          lng: location.lng,
                        }))}
                      />
                    </div>
                  ) : (
                    null)}

                  <div className="space-y-3"></div>
                  {locations.data.map((user, idx) => (
                    <div key={user.id || idx} className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700 flex items-start gap-3">
                      <MapPin size={16} className="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{user.institution} • {user.city}, {user.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">{content?.noUsageReported}</p>
              )}
            </TabsContent>
          </Tabs>
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={() => onMarkAsUsing?.(tool.tool)} variant="ghost" size="sm" className="w-full text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
              <CheckCircle size={14} className="mr-2" />
              {content?.iUseThis}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div >
  );
};

const RatingModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemId: number;
  itemType: "tool" | "workflow" | "usecase" | "database";
}> = ({ open, onOpenChange, itemName, itemId, itemType }) => {
  const router = useRouter();
  const { locale } = router;
  const { bioinfo: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const handleSubmit = () => {
    submitRating.mutate({
      id: itemId,
      type: itemType as any,
      rating,
    });
  };

  const userRating = api.bioinfo.getUserRatings.useQuery(
    { type: itemType as any, id: itemId },
    { enabled: !!itemId }
  );

  const submitRating = api.bioinfo.submitRating.useMutation({
    onSuccess: () => {
      toast({ title: content?.ratingSubmitted || "Avaliação enviada com sucesso!" });
      onOpenChange(false);
      setRating(0);
    },
  });

  useEffect(() => {
    const r = userRating.data?.rating;

    if (typeof r === "number") {
      setRating(r);
    } else {
      setRating(0);
    }
  }, [userRating.data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{content?.rateItem || "Avaliar"} {itemName}</DialogTitle>
          <DialogDescription>
            {content?.rateDescription || "Conte-nos o que você achou deste recurso."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center gap-3">
            <Label className="text-lg font-semibold">{content?.yourRating || "Sua nota"}</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${star <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                      }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {content?.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitRating.isLoading}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {submitRating.isLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Star className="w-4 h-4 mr-2" />}
            {content?.submitRating || "Enviar Avaliação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const WorkflowSuggestionModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tools: Tool[];
  handleRate: (name: string, type: "workflow" | "usecase" | "tool" | "database", id: number) => void;
}> = ({ open, onOpenChange, tools, handleRate }) => {
  const router = useRouter();
  const { locale } = router;
  const { bioinfo: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pipelineCode, setPipelineCode] = useState("");
  const [pipelineGitLink, setPipelineGitLink] = useState("");
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState("beginner");
  const [tags, setTags] = useState("");
  const [toolSearchQuery, setToolSearchQuery] = useState("");

  const filteredTools = tools.filter((tool) =>
    tool.tool.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
    tool.type?.toLowerCase().includes(toolSearchQuery.toLowerCase())
  );

  const handleAddTool = (toolId: number) => {
    if (!selectedTools.includes(toolId)) {
      setSelectedTools([...selectedTools, toolId]);
    }
  };

  const handleRemoveTool = (toolId: number) => {
    setSelectedTools(selectedTools.filter((id) => id !== toolId));
  };

  const send = api.bioinfo.saveWorkflow.useMutation({
    onSuccess: () => {
      toast({
        title: content.workflowSubmitted,
      });
      setName("");
      setDescription("");
      setPipelineCode("");
      setPipelineGitLink("");
      setSelectedTools([]);
      setDifficulty("beginner");
      setTags("");
      setToolSearchQuery("");
      onOpenChange(false);
    },
  });

  const handleSubmit = () => {
    if (name && description && selectedTools.length > 0) {
      send.mutate({
        name,
        description,
        pipelineCode: pipelineCode || undefined,
        pipelineGitLink: pipelineGitLink || undefined,
        toolSequence: selectedTools.map((toolId, idx) => ({ toolId, order: idx + 1 })),
        difficulty: difficulty as "beginner" | "intermediate" | "advanced",
        tags: tags.split(",").map((t) => t.trim()),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{content?.suggestWorkflow}</DialogTitle>
          <DialogDescription>{content?.suggestWorkflowDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="workflow-name">{content?.workflowName}</Label>
            <Input id="workflow-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={content?.workflowNamePlaceholder} />
          </div>

          <div>
            <Label htmlFor="workflow-desc">{content?.workflowDescription}</Label>
            <Textarea id="workflow-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={content?.workflowDescriptionPlaceholder} rows={3} />
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <GitBranch size={16} />
              {content?.pipelineInfo || "Informações do Pipeline"}
            </h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="pipeline-code">{content?.pipelineCode || "Código do Pipeline"}</Label>
                <Textarea
                  id="pipeline-code"
                  value={pipelineCode}
                  onChange={(e) => setPipelineCode(e.target.value)}
                  placeholder={content?.pipelineCodePlaceholder || "Cole o código do pipeline aqui (YAML, JSON, etc)"}
                  rows={6}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">{content?.pipelineCodeHint || "Suporta YAML, JSON, ou qualquer formato de configuração"}</p>
              </div>

              <div>
                <Label htmlFor="pipeline-git">{content?.pipelineGitLink || "Link do Repositório Git"}</Label>
                <Input
                  id="pipeline-git"
                  value={pipelineGitLink}
                  onChange={(e) => setPipelineGitLink(e.target.value)}
                  placeholder={content?.pipelineGitLinkPlaceholder || "ex: https://github.com/user/pipeline-repo"}
                  type="url"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="difficulty">{content?.difficultyLevel}</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{content?.beginner}</SelectItem>
                <SelectItem value="intermediate">{content?.intermediate}</SelectItem>
                <SelectItem value="advanced">{content?.advanced}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tags">{content?.tags}</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder={content?.tagsPlaceholder} />
          </div>

          <div>
            <Label>{content?.toolsInSequence}</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{content?.toolsInSequencePlaceholder}</p>

            {selectedTools.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg mb-4 border border-blue-200 dark:border-blue-700">
                <p className="text-sm font-semibold mb-2">{content?.selecedTools}</p>
                <div className="space-y-2">
                  {selectedTools.map((toolId, idx) => {
                    const tool = tools.find((t) => t.id === toolId);
                    return (
                      <div key={toolId} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded">
                        <span className="text-sm">
                          {idx + 1}. {tool?.tool}
                        </span>
                        <button onClick={() => handleRemoveTool(toolId)} className="text-red-600 hover:text-red-800">
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-4">
              <Input
                id="tool-search"
                placeholder={content?.searchTools || "Pesquisar ferramentas..."}
                value={toolSearchQuery}
                onChange={(e) => setToolSearchQuery(e.target.value)}
                className="w-full"
              />
              {toolSearchQuery && (
                <p className="text-xs text-gray-500 mt-2">
                  {filteredTools.length} de {tools.length} ferramentas encontradas
                </p>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleAddTool(tool.id)}
                    disabled={selectedTools.includes(tool.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedTools.includes(tool.id)
                      ? "bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-600"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className={selectedTools.includes(tool.id) ? "text-teal-600" : "text-gray-400"} />
                      <span className="font-semibold text-sm">{tool.tool}</span>
                      <span className="text-xs text-gray-500 ml-auto">{tool.type}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">{content?.noToolsFound || "Nenhuma ferramenta encontrada"}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {content?.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !description || selectedTools.length === 0} className="bg-teal-600 hover:bg-teal-700">
            {content?.createWorkflow}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UseCaseSuggestionModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tools: Tool[];
  handleRate: (name: string, type: "workflow" | "usecase" | "tool" | "database", id: number) => void;
}> = ({ open, onOpenChange, tools, handleRate }) => {
  const router = useRouter();
  const { locale } = router;
  const { bioinfo: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState("beginner");
  const [steps, setSteps] = useState<string[]>([""]);
  const [toolSearchQuery, setToolSearchQuery] = useState("");

  const filteredTools = tools.filter((tool) =>
    tool.tool.toLowerCase().includes(toolSearchQuery.toLowerCase()) ||
    tool.type?.toLowerCase().includes(toolSearchQuery.toLowerCase())
  );

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleRemoveStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const handleStepChange = (idx: number, value: string) => {
    const newSteps = [...steps];
    newSteps[idx] = value;
    setSteps(newSteps);
  };

  const handleAddTool = (toolId: number) => {
    if (!selectedTools.includes(toolId)) {
      setSelectedTools([...selectedTools, toolId]);
    }
  };

  const handleRemoveTool = (toolId: number) => {
    setSelectedTools(selectedTools.filter((id) => id !== toolId));
  };

  const send = api.bioinfo.saveUseCase.useMutation({
    onSuccess: () => {
      toast({
        title: content.useCaseSubmitted,
      });
      setTitle("");
      setDescription("");
      setSelectedTools([]);
      setDifficulty("beginner");
      setSteps([""]);
      onOpenChange(false);
    },
  });

  const handleSubmit = () => {
    if (title && description && selectedTools.length > 0 && steps.filter((s) => s.trim()).length > 0) {
      send.mutate({
        name: title,
        description,
        selectedTools: selectedTools,
        difficulty: difficulty as "beginner" | "intermediate" | "advanced",
        steps: steps.filter((s) => s.trim()),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{content?.suggestUseCase}</DialogTitle>
          <DialogDescription>{content?.suggestUseCaseDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="usecase-title">{content?.useCaseTitle}</Label>
            <Input id="usecase-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={content?.useCaseTitlePlaceholder} />
          </div>

          <div>
            <Label htmlFor="usecase-desc">{content?.useCaseDescription}</Label>
            <Textarea id="usecase-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={content?.useCaseDescriptionPlaceholder} rows={3} />
          </div>

          <div>
            <Label htmlFor="usecase-difficulty">{content?.difficultyLevel}</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="usecase-difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">{content?.beginner}</SelectItem>
                <SelectItem value="intermediate">{content?.intermediate}</SelectItem>
                <SelectItem value="advanced">{content?.advanced}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{content?.recomendedTools}</Label>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={content?.searchPlaceholder || "Pesquisar ferramentas..."}
                className="pl-8"
                value={toolSearchQuery}
                onChange={(e) => setToolSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-3 p-1">
              {filteredTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => (selectedTools.includes(tool.id) ? handleRemoveTool(tool.id) : handleAddTool(tool.id))}
                  className={`w-full text-left p-2 rounded-lg border text-sm transition-all ${selectedTools.includes(tool.id)
                    ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className={selectedTools.includes(tool.id) ? "text-blue-600" : "text-gray-400"} />
                    <div className="flex-1">
                      <p className="font-medium">{tool.tool}</p>
                      <p className="text-xs text-gray-500 capitalize">{tool.type}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {selectedTools.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTools.map((id) => {
                  const tool = tools.find((t) => t.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {tool?.tool}
                      <X size={12} className="cursor-pointer" onClick={() => handleRemoveTool(id)} />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>{content?.stepByStepGuide}</Label>
              <Button onClick={handleAddStep} size="sm" variant="outline">
                <Plus size={14} className="mr-1" />
                {content?.addStep}
              </Button>
            </div>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-sm font-semibold text-gray-500 pt-2 min-w-fit">{idx + 1}.</span>
                  <div className="flex-1">
                    <Textarea
                      value={step}
                      onChange={(e) => handleStepChange(idx, e.target.value)}
                      placeholder={`${content?.step} ${idx + 1}...`}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  {steps.length > 1 && (
                    <button onClick={() => handleRemoveStep(idx)} className="text-red-600 hover:text-red-800 pt-2">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {content?.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!title || !description || selectedTools.length === 0} className="bg-blue-600 hover:bg-blue-700">
            {content?.createUseCase}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const WorkflowDetailsModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: Workflow | null;
  tools: Tool[];
  content: any;
  handleMarkAsUsing: (name: string, itemType: "tool" | "workflow" | "usecase", itemId: number) => void;
  currentUserId?: number;
  onDeleted?: () => void;
}> = ({ open, onOpenChange, workflow, tools, content, handleMarkAsUsing, currentUserId, onDeleted }) => {
  const [showMap, setShowMap] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    if (!open) {
      setOpenMenu(false);
      setShowMap(false);
    }
  }, [open]);

  const workflowId = workflow?.id;
  const locations = api.bioinfo.getWorkflowLocations.useQuery(
    { id: workflowId ?? 0 },
    { enabled: !!workflowId }
  );

  const handleGitLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowModal(true);
  };

  const deleteWorkflow = api.bioinfo.deleteWorkflow.useMutation({
    onSuccess: () => {
      toast({ title: content.workflowDeleted });
      onDeleted?.();
    },
    onError: (error: unknown) => {
      toast({ title: "Erro ao excluir workflow", description: error instanceof Error ? error.message : "Falha inesperada", variant: "destructive" });
    },
  });

  const handleDelete = () => {
    if (!workflow?.idUser || workflow.idUser !== currentUserId) return;
    if (!window.confirm(content.deleteWorkflowConfirm || "Tem certeza que deseja excluir este workflow?")) return;
    deleteWorkflow.mutate({ id: workflow.id });
  };

  if (!workflow) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5" />
                {workflow.name}
              </DialogTitle>
              <DialogDescription>{workflow.description}</DialogDescription>
              {workflow.createdBy && (
                <div className="flex items-center mt-4">
                  <Link href={`/user/${workflow.idUser}`} className="flex items-center hover:opacity-80 transition-opacity">
                    <Avatar className="h-8 w-8 mr-2 ring-2 ring-white dark:ring-teal-900">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${workflow.authorName || workflow.createdBy}`} />
                      <AvatarFallback className="bg-gradient-to-br from-teal-400 to-green-600 text-white text-xs">
                        {workflow.createdBy?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {workflow.createdBy}
                    </span>
                  </Link>
                </div>
              )}
            </div>
            {workflow.idUser && workflow.idUser === currentUserId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteWorkflow.isLoading}
                className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">{content?.toolSequence}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {workflow.toolSequence?.map((ts, idx) => {
                const tool = tools.find((t) => t.id === ts.toolId);
                return (
                  <div key={ts.toolId} className="flex items-center gap-2">
                    <Badge className="bg-teal-600 text-white dark:bg-teal-500 dark:text-white hover:bg-teal-700 px-2 py-1 h-auto min-w-fit">
                      {idx + 1}. {tool?.tool || "Tool"}
                    </Badge>
                    {idx < (workflow.toolSequence?.length || 0) - 1 && <ArrowRight size={16} className="text-gray-400" />}
                  </div>
                );
              })}
            </div>
          </div>

          {(workflow.pipelineCode || workflow.pipelineGitLink) && (
            <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                {content?.pipelineInfo || "Informações do Pipeline"}
              </h3>

              <div className="space-y-3">
                {workflow.pipelineGitLink && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {content?.repository || "Repositório Git"}
                    </p>
                    <a
                      href={workflow.pipelineGitLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleGitLinkClick}
                      className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline break-all"
                    >
                      {workflow.pipelineGitLink}
                    </a>
                  </div>
                )}

                {workflow.pipelineCode && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {content?.pipelineCode || "Código do Pipeline"}
                    </p>
                    <pre className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 overflow-x-auto text-xs max-h-64">
                      <code>{workflow.pipelineCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <Star className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-2xl font-bold">{workflow.rating?.toFixed(1)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{content?.rating}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <Users className="w-5 h-5 text-emerald-500 mb-2" />
              <p className="text-2xl font-bold">{workflow.usageCount}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{content?.usageCount}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{locations.data?.length || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{content?.locations}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <Badge className="capitalize">{workflow.difficulty}</Badge>
            </div>
          </div>

          {workflow.tags && workflow.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">{content?.tags}</h3>
              <div className="flex flex-wrap gap-2">
                {workflow.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-3">{content?.usedBy} ({locations.data?.length || 0})</h3>
            {locations.data && locations.data.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {locations.data.map((loc) => (
                  <div key={loc.id} className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{loc.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{loc.institution}</p>
                        <p className="text-xs text-gray-500">{loc.city}, {loc.country}</p>
                      </div>
                      <Badge className="capitalize text-xs">{loc.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm">{content?.noUsageData}</p>
            )}
          </div>

          {locations.data && locations.data.length > 0 && (
            <Button onClick={() => setShowMap(!showMap)} className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Globe className="w-4 h-4 mr-2" />
              {showMap ? content?.hideMap : content?.viewOnMap}
            </Button>
          )}

          {showMap && locations.data && locations.data.length > 0 && (
            <InteractiveMap locations={locations.data.map(loc => ({
              id: loc.id.toString(),
              name: loc.name ?? '',
              institution: loc.institution ?? '',
              city: loc.city,
              country: loc.country,
              lat: loc.lat,
              lng: loc.lng,
              type: loc.type ?? 'unknown',
            }))} />
          )}
        </div>

        <FeedbackLinkModal
          url={workflow.pipelineGitLink ?? ""}
          open={showModal}
          onOpenChange={setShowModal}
          buttonColor="emerald"
          content={content}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {content?.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FeedbackLinkModal: React.FC<FeedbackLinkModalProps & { open: boolean; onOpenChange: (open: boolean) => void, content: any }> = ({
  url,
  open,
  onOpenChange,
  icon = <GitBranch className="w-5 h-5" />,
  onConfirm,
  onClose,
  buttonColor = "emerald",
  highlightColor = "blue",
  content,
}) => {
  const buttonColorClasses = {
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    teal: "bg-teal-600 hover:bg-teal-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    red: "bg-red-600 hover:bg-red-700",
  };

  const highlightColorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-700",
      title: "text-blue-900 dark:text-blue-100",
      text: "text-blue-800 dark:text-blue-200",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-700",
      title: "text-green-900 dark:text-green-100",
      text: "text-green-800 dark:text-green-200",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-700",
      title: "text-amber-900 dark:text-amber-100",
      text: "text-amber-800 dark:text-amber-200",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-200 dark:border-purple-700",
      title: "text-purple-900 dark:text-purple-100",
      text: "text-purple-800 dark:text-purple-200",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-700",
      title: "text-red-900 dark:text-red-100",
      text: "text-red-800 dark:text-red-200",
    },
  };

  const handleOpenLink = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    onConfirm?.();
    onOpenChange(false);
  };

  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  const colors = highlightColorClasses[highlightColor];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {content?.openRepository ?? "Open Repository"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {content?.mainMessage ?? "We are making it easier for you to use this resource!"}
          </p>

          <div className={`${colors.bg} border ${colors.border} rounded-lg p-3`}>
            <p className={`text-sm font-semibold ${colors.title} mb-2`}>
              ✨ {content?.important ?? "Important"}
            </p>
            <p className={`text-sm ${colors.text}`}>
              {content?.importantMessage ?? "After using it, please return and indicate that you have used it to help us with your feedback!"}
            </p>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400">
            {content?.footerNote ?? "The repository will open in a new tab."}
          </p>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            {content?.cancel ?? "Cancel"}
          </Button>
          <Button
            className={buttonColorClasses[buttonColor]}
            onClick={handleOpenLink}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {content?.openRepository ?? "Open Repository"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UseCaseDetailsModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  useCase: UseCase | null;
  tools: Tool[];
  handleMarkAsUsing: (name: string, itemType: "tool" | "workflow" | "usecase", itemId: number) => void;
  currentUserId?: number;
  onDeleted?: () => void;
}> = ({ open, onOpenChange, useCase, tools, handleMarkAsUsing, currentUserId, onDeleted }) => {
  const router = useRouter();
  const { locale } = router;
  const { bioinfo: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];
  const [showMap, setShowMap] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  useEffect(() => {
    if (!open) {
      setOpenMenu(false);
      setShowMap(false);
    }
  }, [open]);

  const deleteUseCase = api.bioinfo.deleteUseCase.useMutation({
    onSuccess: () => {
      toast({ title: content.useCaseDeleted });
      onDeleted?.();
    },
    onError: (error: unknown) => {
      toast({ title: "Erro ao excluir caso de uso", description: error instanceof Error ? error.message : "Falha inesperada", variant: "destructive" });
    },
  });

  const handleDelete = () => {
    if (!useCase?.idUser || useCase.idUser !== currentUserId) return;
    if (!window.confirm(content.deleteUseCaseConfirm || "Tem certeza que deseja excluir este caso de uso?")) return;
    deleteUseCase.mutate({ id: useCase.id });
  };
  const locations = api.bioinfo.getUseCaseLocations.useQuery(
    { id: useCase?.id ?? 0 },
    { enabled: !!useCase?.id }
  );


  if (!useCase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                {useCase.title}
              </DialogTitle>
              <DialogDescription>{useCase.description}</DialogDescription>
              {useCase.createdBy && (
                <div className="flex items-center mt-4">
                  <Link href={`/user/${useCase.idUser}`} className="flex items-center hover:opacity-80 transition-opacity">
                    <Avatar className="h-8 w-8 mr-2 ring-2 ring-white dark:ring-blue-900">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${useCase.authorName || useCase.createdBy}`} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-600 text-white text-xs">
                        {useCase.createdBy?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {useCase.createdBy}
                    </span>
                  </Link>
                </div>
              )}
            </div>
            {useCase.idUser && useCase.idUser === currentUserId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteUseCase.isLoading}
                className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">{content?.recomendedTools}</h3>
            <div className="flex flex-wrap gap-2">
              {useCase.recommendedTools?.map((toolId) => {
                const tool = tools.find((t) => t.id === toolId);
                return (
                  <Badge key={toolId} className="bg-blue-600 text-white dark:bg-blue-500 dark:text-white hover:bg-blue-700 px-2 py-1 h-auto min-w-fit">
                    {tool?.tool || "Tool"}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">{content?.stepByStepGuide}</h3>
            <div className="space-y-3">
              {useCase.steps?.split("\n").map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <Badge className="capitalize mb-2 block w-fit">{useCase.difficulty}</Badge>
              <p className="text-xs text-gray-600 dark:text-gray-400">{content?.difficultyLevel}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{locations.data?.length || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{content?.locations}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">{content?.usedBy} ({locations.data?.length || 0})</h3>
            {locations.data && locations.data.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {locations.data.map((loc) => (
                  <div key={loc.id} className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{loc.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{loc.institution}</p>
                        <p className="text-xs text-gray-500">{loc.city}, {loc.country}</p>
                      </div>
                      <Badge className="capitalize text-xs">{loc.type}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-sm">{content?.noUsageData}</p>
            )}
          </div>

          {locations.data && locations.data.length > 0 && (
            <Button onClick={() => setShowMap(!showMap)} className="w-full bg-blue-600 hover:bg-blue-700">
              <Globe className="w-4 h-4 mr-2" />
              {showMap ? content?.hideMap : content?.viewOnMap}
            </Button>
          )}

          {showMap && locations.data && locations.data.length > 0 && (
            <InteractiveMap
              locations={locations.data.map(loc => ({
                ...loc,
                id: loc.id.toString(),
                name: loc.name || "",
                institution: loc.institution || "",
                type: loc.type || "unknown",
              }))}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {content?.close}
          </Button>
          <Button onClick={() => handleMarkAsUsing(useCase.title ?? "", "usecase", useCase.id)} className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            {content?.markAsUsing || "Marcar como usado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MarkAsUsingModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemId: number;
  itemType: "tool" | "workflow" | "usecase" | "database";
}> = ({ open, onOpenChange, itemName, itemId, itemType }) => {
  const router = useRouter();
  const { locale } = router;
  const { bioinfo: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];
  const user = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') return false;
      return failureCount < 3;
    },
  });
  const [name, setName] = useState(`${user.data?.name ?? ""} ${user.data?.lastName ?? ""}`);
  const [institution, setInstitution] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [userType, setUserType] = useState<"student" | "researcher" | "lab">("researcher");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  useEffect(() => {
    if (user.data) {
      setName(`${user.data.name ?? ""} ${user.data.lastName ?? ""}`.trim());
    }
  }, [user.data]);
  useEffect(() => {
    if (open) {
      const fetchLocation = async () => {
        setIsLoadingLocation(true);
        try {
          const langMap: Record<string, string> = {
            "pt-BR": "pt-BR", "pt": "pt-BR", "es": "es", "en": "en", "de": "de", "fr": "fr", "ja": "ja", "zh": "zh-CN", "ru": "ru"
          };
          const lang = langMap[locale as string] || "en";
          const response = await fetch(`http://ip-api.com/json/?lang=${lang}&fields=status,message,country,regionName,city`);
          const data = await response.json();
          if (data.status === "success") {
            setCity(data.city || "");
            setState(data.regionName || "");
            setCountry(data.country || "");
          }
        } catch (error) {
          console.error("Erro ao buscar localização:", error);
        } finally {
          setIsLoadingLocation(false);
        }
      };
      fetchLocation();
    }
  }, [open, locale]);

  const send = api.bioinfo.markAsUsing.useMutation({
    onSuccess: () => {
      toast({
        title: content.markAsUsingSubmitted,
      });
      setName("");
      setInstitution("");
      setCity("");
      setCountry("");
      setState("");
      setUserType("researcher");
      onOpenChange(false);
    },
  });

  const handleSubmit = () => {
    if (name && institution && city && country && state) {
      send.mutate({
        name,
        institution,
        city,
        country,
        state,
        userType,
        itemType: itemType as "tool" | "workflow" | "usecase",
        id: itemId,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{content?.markAsUsing}</DialogTitle>
          <DialogDescription>{content?.markAsUsingDescription} {itemName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="user-name">{content?.yourName}</Label>
            <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={content?.yourNamePlaceholder} />
          </div>

          <div>
            <Label htmlFor="institution">{content?.institution}</Label>
            <Input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder={content?.institutionPlaceholder} />
          </div>

          <div className="grid grid-cols-3 gap-3 relative">
            {isLoadingLocation && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-950/50 flex items-center justify-center z-10 rounded-md">
                <Loader className="w-5 h-5 animate-spin text-emerald-600" />
              </div>
            )}
            <div>
              <Label htmlFor="city">{content?.city}</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder={content?.cityPlaceholder} />
            </div>
            <div>
              <Label htmlFor="state">{content?.state}</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder={content?.statePlaceholder} />
            </div>
            <div>
              <Label htmlFor="country">{content?.country}</Label>
              <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder={content?.countryPlaceholder} />
            </div>
          </div>

          <div>
            <Label htmlFor="user-type">{content?.userType}</Label>
            <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
              <SelectTrigger id="user-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">{content?.userTypeStudent}</SelectItem>
                <SelectItem value="researcher">{content?.userTypeResearcher}</SelectItem>
                <SelectItem value="lab">{content?.userTypeLab}</SelectItem>
                <SelectItem value="other">{content?.userTypeOther}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {content?.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !institution || !city || !country} className="bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            {content?.markAsUsing}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function Bioinfo() {
  const router = useRouter();
  const { locale } = router;
  const { bioinfo: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];
  const [activeTab, setActiveTab] = useState("tools");
  const [toolType, setToolType] = useState<"all" | "tool" | "database">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPathogens, setSelectedPathogens] = useState<string[]>([]);
  const [suggestWorkflowOpen, setSuggestWorkflowOpen] = useState(false);
  const [suggestUseCaseOpen, setSuggestUseCaseOpen] = useState(false);
  const [suggestToolModalOpen, setSuggestToolModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowDetailsOpen, setWorkflowDetailsOpen] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [useCaseDetailsOpen, setUseCaseDetailsOpen] = useState(false);
  const [markAsUsingOpen, setMarkAsUsingOpen] = useState(false);
  const [markingItem, setMarkingItem] = useState<{ name: string; type: "tool" | "workflow" | "usecase" | "database"; id: number } | null>(null);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "citations" | "recent" | "usage">("recent");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>(undefined);
  const [newToolData, setNewToolData] = useState({
    tool: "",
    description: "",
    website: "",
    github: "",
    contact: "",
    isDeveloper: false,
  });
  const [formErrors, setFormErrors] = useState({
    tool: false,
    description: false,
  });
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingItem, setRatingItem] = useState<{ name: string; type: "workflow" | "usecase" | "tool" | "database"; id: number } | null>(null);
  const [forumModalOpen, setForumModalOpen] = useState(false);
  const [forumTitle, setForumTitle] = useState("");
  const [forumText, setForumText] = useState("");
  const [forumTags, setForumTags] = useState("");
  const [current, setCurrent] = useState<Workflow | UseCase | Tool | null>(null);

  const user = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') return false;
      return failureCount < 3;
    },
  });

  const workflows = api.bioinfo.getWorkflows.useQuery({
    searchQuery: searchTerm,
    filters: {
      tags: selectedTags,
      difficulty: selectedDifficulty as any,
      sortBy: sortBy as any
    }
  });

  const useCases = api.bioinfo.getUseCases.useQuery({
    searchQuery: searchTerm,
    filters: {
      tags: selectedTags,
      difficulty: selectedDifficulty as any,
      sortBy: sortBy as any
    }
  });

  const toolsQuery = api.bioinfo.getTools.useQuery({
    searchQuery: searchTerm,
    tags: selectedTags,
    pathogens: selectedPathogens,
    sortBy: sortBy === "usage" ? "recent" : (sortBy as any),
    database: "no"
  });

  const databasesQuery = api.bioinfo.getTools.useQuery({
    searchQuery: searchTerm,
    tags: selectedTags,
    pathogens: selectedPathogens,
    sortBy: sortBy === "usage" ? "recent" : (sortBy as any),
    database: "yes"
  });

  const isAuthenticated = !!user.data?.id;
  const isLoading = toolsQuery.isLoading || databasesQuery.isLoading || workflows.isLoading || useCases.isLoading || toolsQuery.isFetching || databasesQuery.isFetching || workflows.isFetching || useCases.isFetching;
  const [openLoginModal, setOpenLoginModal] = useAtom(openLoginModalAtom);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [linkToOpen, setLinkToOpen] = useState<string | null>('');
  const [showModal, setShowModal] = useState(false);

  const allToolsData = useMemo(() => [
    ...(toolsQuery.data?.tools || []),
    ...(databasesQuery.data?.tools || [])
  ], [toolsQuery.data, databasesQuery.data]);

  const allPathogens = Array.from(new Set(allToolsData.flatMap((t) => t.pathogens || []))).sort();
  const allTags = Array.from(
    new Set(allToolsData.flatMap((t) => t.tags || []))
  ).sort();

  const filteredTools = useMemo(() => {
    const all = [
      ...(toolsQuery.data?.tools || []),
      ...(databasesQuery.data?.tools || [])
    ];
    return toolType === "all" ? all : all.filter(t => t.type === toolType);
  }, [toolsQuery.data, databasesQuery.data, toolType]);

  const handleAddToComparison = (tool: Tool) => {
    if (!selectedTools.find((t) => t.id === tool.id)) {
      if (selectedTools.length < 3) {
        setSelectedTools([...selectedTools, tool]);
        setComparisonOpen(true);
      }
    }
  };

  const handleRemoveFromComparison = (id: number) => {
    setSelectedTools(selectedTools.filter((t) => t.id !== id));
  };

  const handleRate = (name: string, type: "workflow" | "usecase" | "tool" | "database", id: number) => {
    if (!isAuthenticated) {
      setOpenLoginModal(true);
      return;
    }
    setRatingItem({ name, type, id });
    setRatingOpen(true);
  };

  const handleViewWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowDetailsOpen(true);
  };

  const handleViewUseCase = (useCase: UseCase) => {
    setSelectedUseCase(useCase);
    setUseCaseDetailsOpen(true);
  };

  const handleMarkAsUsing = (itemName: string, itemType: "tool" | "workflow" | "usecase" | "database", itemId: number) => {
    if (!isAuthenticated) {
      setOpenLoginModal(true);
      return;
    }
    setMarkingItem({ name: itemName, type: itemType, id: itemId });
    setMarkAsUsingOpen(true);
  };

  const handleModalWorkflow = () => {
    if (!isAuthenticated) {
      setOpenLoginModal(true);
      return;
    }
    setSuggestWorkflowOpen(true);
  };

  const handleModalUseCase = () => {
    if (!isAuthenticated) {
      setOpenLoginModal(true);
      return;
    }
    setSuggestUseCaseOpen(true);
  };

  const addToolMutation = api.bioinfo.addTool.useMutation({
    onSuccess: () => {
      toast({
        title: content.suggestionSubmitted,
      });
      setSuggestToolModalOpen(false);
      setNewToolData({
        tool: "",
        description: "",
        website: "",
        github: "",
        contact: "",
        isDeveloper: false,
      });
      setFormErrors({ tool: false, description: false });
    },
    onError: (error) => {
      toast({
        title: "Error submitting suggestion",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleAddToolSubmit = () => {
    const newErrors = {
      tool: !newToolData.tool.trim(),
      description: !newToolData.description.trim(),
    };
    setFormErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      toast({
        title: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    const formattedNewToolData = {
      ...newToolData,
      isDeveloper: newToolData.isDeveloper ? "true" : "false",
    };
    addToolMutation.mutate(formattedNewToolData);
  };

  const handleOpenForumModal = (current?: Tool | Workflow | UseCase) => {
    if (!isAuthenticated) {
      setOpenLoginModal(true);
      return;
    }

    setCurrent(current || null);

    let title = "";

    if (current) {
      if (isTool(current)) {
        title = current.tool;
      } else if (isWorkflow(current)) {
        title = current.name ?? "";
      } else {
        title = current.title ?? "";
      }
    }

    setForumTitle(`Discussing: ${title}`);
    setForumModalOpen(true);
  };

  const send = api.bioinfo.saveForumPost.useMutation({
    onSuccess: () => {
      setForumTitle("");
      setForumText("");
      setForumTags("");
      setCurrent(null);
      toast({
        title: content.forumPosted,
      });
      setForumModalOpen(false);
    },
  });

  const tags = api.educational.getTags.useQuery();

  const handleSubmitForumPost = () => {
    if (current && 'id' in current && typeof current.id === 'number') {
      const itemType: "tool" | "workflow" | "usecase" | "database" =
        isTool(current)
          ? current.type
          : isWorkflow(current)
            ? "workflow"
            : "usecase";
      send.mutate({
        title: forumTitle,
        message: forumText,
        tags: forumTags.split(',').map(tag => tag.trim()).join(','),
        related: current.id,
        type: itemType
      });
    }
  };

  const handleGitLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, workflow: Workflow) => {
    if (workflow.pipelineGitLink) {
      setLinkToOpen(workflow.pipelineGitLink);
    }
    e.preventDefault();
    setShowModal(true);
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-white dark:bg-black">
        <motion.section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 text-white py-20 md:py-28" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <Badge className="bg-teal-500/30 text-teal-200 border-teal-400 mb-4">
              <Zap className="w-3 h-3 mr-2" />
              {content?.bioinformaticsRepository}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-white via-teal-200 to-cyan-200 bg-clip-text text-transparent">{content?.toolsandDatabases}</span>
            </h1>
            <p className="text-xl text-teal-100 max-w-2xl leading-relaxed">{content?.discover}</p>
          </div>
        </motion.section>

        <div className="max-w-6xl mx-auto px-4 py-8 -mt-12 relative z-20">
          <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Search className="w-5 h-5 text-gray-400 mt-3" />
                  <Input placeholder={content?.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1" />
                </div>

                <div className="space-y-3">
                  {(activeTab === "tools" || activeTab === "databases") && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">{content?.pathogens}</Label>
                      <div className="flex flex-wrap gap-2">
                        {allPathogens.map((pathogen) => (
                          <Badge
                            key={pathogen ?? ''}
                            variant={pathogen && selectedPathogens.includes(pathogen) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() =>
                              setSelectedPathogens((prev) => {
                                if (pathogen) {
                                  return prev.includes(pathogen) ? prev.filter((p) => p !== pathogen) : [...prev, pathogen];
                                }
                                return prev;
                              })
                            }
                          >
                            {pathogen ?? ''}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag ?? ''}
                          variant={selectedTags.includes(tag ?? '') ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() =>
                            setSelectedTags((prev) =>
                              tag ? (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]) : prev
                            )
                          }
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {(activeTab === "workflows" || activeTab === "usecases") && (
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">{content?.difficulty}</Label>
                      <div className="flex flex-wrap gap-2">
                        {["beginner", "intermediate", "advanced"].map((diff) => (
                          <Badge
                            key={diff}
                            variant={selectedDifficulty === diff ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? undefined : diff)}
                          >
                            {diff.charAt(0).toUpperCase() + diff.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="sort" className="text-sm font-semibold mb-2 block">
                        {content?.sortBy}
                      </Label>
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger id="sort" className="w-full md:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating">{content?.highestRating}</SelectItem>
                          <SelectItem value="citations">{content?.mostCited}</SelectItem>
                          <SelectItem value="recent">{content?.mostRecent}</SelectItem>
                          {(activeTab === "workflows" || activeTab === "usecases") && (
                            <SelectItem value="usage">{content?.mostUsed || "Most Used"}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto px-5 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full overflow-x-auto overflow-y-hidden justify-start md:grid md:grid-cols-5 mb-8 bg-gray-100 dark:bg-gray-800 h-auto p-1 no-scrollbar">
              <TabsTrigger
                value="tools"
                className="flex-shrink-0 min-w-[120px] md:min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 py-2.5"
              >
                <Code2 className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">
                  {content?.tools} ({filteredTools?.filter((t) => (t.type || "tool") === "tool").length || 0})
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="databases"
                className="flex-shrink-0 min-w-[120px] md:min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 py-2.5"
              >
                <Database className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">
                  {content?.databases} ({filteredTools?.filter((t) => t.type === "database").length || 0})
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="workflows"
                className="flex-shrink-0 min-w-[120px] md:min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 py-2.5"
              >
                <Workflow className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">
                  {content?.workflows} ({workflows.data?.workflows.length || 0})
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="usecases"
                className="flex-shrink-0 min-w-[120px] md:min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 py-2.5"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">
                  {content?.usecases} ({useCases.data?.useCases.length || 0})
                </span>
              </TabsTrigger>

              <TabsTrigger
                value="guide"
                className="flex-shrink-0 min-w-[100px] md:min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 py-2.5"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">{content?.guide}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader className="w-10 h-10 animate-spin text-teal-600" />
                  <p className="text-gray-500 animate-pulse">{content?.loading || "Carregando resultados..."}</p>
                </div>
              ) : (
                <>
                  {filteredTools?.filter((t) => (t.type || "tool") === "tool")
                    .map((tool) => (
                      tool.tool !== null && <ToolCard key={tool.id} tool={tool as Tool} onCompare={handleAddToComparison} onMarkAsUsing={(name) => handleMarkAsUsing(name, "tool", tool.id)} onRate={handleRate} handleOpenForumModal={handleOpenForumModal} />
                    ))}
                  <SuggestToolCard type="tool" onClick={() => setSuggestToolModalOpen(true)} />
                </>
              )}
            </TabsContent>

            <TabsContent value="databases" className="space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader className="w-10 h-10 animate-spin text-teal-600" />
                  <p className="text-gray-500 animate-pulse">{content?.loading || "Carregando resultados..."}</p>
                </div>
              ) : (
                <>
                  {filteredTools?.filter((t) => t.type === "database")
                    .map((tool) => (
                      tool.tool !== null && <ToolCard key={tool.id} tool={tool as Tool} onCompare={handleAddToComparison} onMarkAsUsing={(name) => handleMarkAsUsing(name, "database", tool.id)} onRate={handleRate} />
                    ))}
                  <SuggestToolCard type="database" onClick={() => setSuggestToolModalOpen(true)} />
                </>
              )}
            </TabsContent>

            <TabsContent value="workflows" className="space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader className="w-10 h-10 animate-spin text-teal-600" />
                  <p className="text-gray-500 animate-pulse">{content?.loading || "Carregando resultados..."}</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-4">
                    <Button onClick={() => handleModalWorkflow()} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                      <Plus className="w-3 h-3 mr-2" />
                      {content?.suggestWorkflow}
                    </Button>
                  </div>

                  {workflows.data?.workflows.map((workflow) => (
                    <Card key={workflow.id} className="border-2 border-emerald-200 dark:border-emerald-700 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 w-full">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                              <Workflow className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                              <span className="break-words">{workflow.name}</span>
                            </CardTitle>
                            <CardDescription className="mt-1 line-clamp-2 sm:line-clamp-none">
                              {workflow.description}
                            </CardDescription>

                            {workflow.createdBy && (
                              <div className="flex items-center mt-3">
                                <Link href={`/user/${workflow.idUser}`} className="flex items-center hover:opacity-80 transition-opacity">
                                  <Avatar className="h-6 w-6 mr-2 ring-1 ring-white dark:ring-teal-900">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${workflow.createdBy}`} />
                                    <AvatarFallback className="bg-gradient-to-br from-teal-400 to-green-600 text-white text-[10px]">
                                      {workflow.createdBy?.charAt(0) || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {workflow.createdBy}
                                  </span>
                                </Link>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-0 pt-3 sm:pt-0">
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/community?workflowId=${workflow.id}`)}
                                  className="h-9 px-2 sm:px-3 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                                >
                                  <MessageSquare className="h-4 w-4 sm:mr-2" />
                                  <span className="text-xs font-semibold hidden xs:inline-block">{content.whatPeopleSaying}</span>
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenForumModal(workflow)}
                                  className="h-9 px-2 sm:px-3 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                                >
                                  <Plus className="h-4 w-4 sm:mr-2" />
                                  <span className="text-xs font-semibold hidden xs:inline-block">{content.startTopic}</span>
                                </Button>
                              </TooltipProvider>
                            </div>

                            <div className="flex items-center gap-2">
                              <div
                                className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-full border border-amber-200 dark:border-amber-800"
                                onClick={() => handleRate(workflow.name || "", "workflow", workflow.id)}
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300">
                                  {workflow.rating?.toFixed(1) ?? "0.0"}
                                </span>
                              </div>

                              <DropdownMenu open={openMenuId === workflow.id} modal={false} onOpenChange={(open) => setOpenMenuId(open ? workflow.id : null)}>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-emerald-700 rounded-md">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleMarkAsUsing(workflow.name ?? "", "workflow", workflow.id)}>
                                    <CheckCircle className="w-4 h-4 mr-2" /> {content?.useThisWorkflow}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRate(workflow.name ?? "", "workflow", workflow.id)}>
                                    <Star className="w-4 h-4 mr-2" /> {content?.rateThisWorkflow}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 sm:p-6">
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{content?.toolsInSequence}</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            {(workflow.toolSequence as any[]).map((ts, idx) => {
                              const tool = allToolsData.find((t) => t.id === ts.toolId);
                              return (
                                <div key={ts.toolId} className="flex items-center gap-2 mb-1">
                                  <Badge className="bg-teal-600 text-white hover:bg-teal-700 px-2 py-1 text-[10px] sm:text-xs whitespace-nowrap">
                                    {idx + 1}. {tool?.tool || "Tool"}
                                  </Badge>
                                  {idx < (workflow.toolSequence as any[]).length - 1 && (
                                    <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {(workflow.pipelineCode || workflow.pipelineGitLink) && (
                          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <GitBranch className="w-4 h-4 text-emerald-600" />
                              {content?.pipelineInfo}
                            </h4>
                            {workflow.pipelineGitLink && (
                              <div className="overflow-hidden">
                                <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 break-all">
                                  <span className="font-semibold">{content?.repository}:</span>{" "}
                                  <a href={workflow.pipelineGitLink} target="_blank" className="text-emerald-600 underline">
                                    {workflow.pipelineGitLink}
                                  </a>
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 mb-6">
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded text-center sm:text-left">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{content?.difficulty}</p>
                            <p className="text-xs sm:text-sm font-bold capitalize">{workflow.difficulty}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded text-center sm:text-left">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{content?.usageCount}</p>
                            <p className="text-xs sm:text-sm font-bold">{workflow.usageCount}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded text-center sm:text-left cursor-pointer hover:bg-amber-50 transition-colors" onClick={() => handleRate(workflow.name || "", "workflow", workflow.id)}>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{content?.rating}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-1">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <p className="text-xs sm:text-sm font-bold">{workflow.rating?.toFixed(1) ?? "N/A"}</p>
                            </div>
                          </div>
                        </div>

                        {workflow.tags && (
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {workflow.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-none">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-center">
                          <Button
                            onClick={() => handleViewWorkflow(workflow)}
                            variant="outline"
                            className="w-full sm:w-auto sm:px-12 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-full transition-all"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {content?.viewDetails}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="usecases" className="space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader className="w-10 h-10 animate-spin text-teal-600" />
                  <p className="text-gray-500 animate-pulse">{content?.loading || "Carregando resultados..."}</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-4">
                    <Button onClick={() => handleModalUseCase()} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                      <Plus className="w-3 h-3 mr-2" />
                      {content?.suggestUseCase}
                    </Button>
                  </div>
                  {useCases.data?.useCases.map((useCase) => (
                    <Card key={useCase.id} className="border-2 border-blue-200 dark:border-blue-700 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">

                          <div className="flex-1 w-full">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-900 dark:text-blue-100">
                              <Lightbulb className="w-5 h-5 flex-shrink-0 text-blue-600" />
                              <span className="break-words">{useCase.title}</span>
                            </CardTitle>
                            <CardDescription className="mt-1 line-clamp-2 sm:line-clamp-none">
                              {useCase.description}
                            </CardDescription>

                            {useCase.createdBy && (
                              <div className="flex items-center mt-3">
                                <Link href={`/user/${useCase.idUser}`} className="flex items-center hover:opacity-80 transition-opacity">
                                  <Avatar className="h-6 w-6 mr-2 ring-1 ring-white dark:ring-blue-900">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${useCase.createdBy}`} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-600 text-white text-[10px]">
                                      {useCase.createdBy?.charAt(0) || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {useCase.createdBy}
                                  </span>
                                </Link>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-0 pt-3 sm:pt-0">
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/community?useCaseId=${useCase.id}`)}
                                  className="h-9 px-2 sm:px-3 bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                >
                                  <MessageSquare className="h-4 w-4 sm:mr-2" />
                                  <span className="text-xs font-semibold hidden xs:inline-block">{content.whatPeopleSaying}</span>
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenForumModal(useCase)}
                                  className="h-9 px-2 sm:px-3 bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                                >
                                  <Plus className="h-4 w-4 sm:mr-2" />
                                  <span className="text-xs font-semibold hidden xs:inline-block">{content.startTopic}</span>
                                </Button>
                              </TooltipProvider>
                            </div>

                            <div className="flex items-center gap-2">
                              <div
                                className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 cursor-pointer"
                                onClick={() => handleRate(useCase.title || "", "usecase", useCase.id)}
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300">
                                  {useCase.rating?.toFixed(1) ?? "0.0"}
                                </span>
                              </div>

                              <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-500">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleMarkAsUsing(useCase.title ?? "", "usecase", useCase.id)}>
                                    <CheckCircle className="w-4 h-4 mr-2" /> {content?.markAsUsing}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRate(useCase.title ?? "", "usecase", useCase.id)}>
                                    <Star className="w-4 h-4 mr-2" /> {content?.rateThisUseCase}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 sm:p-6">
                        <div className="mb-6">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            {content?.recomendedTools}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {useCase.recommendedTools.map((toolId: number) => {
                              const tool = allToolsData.find((t) => t.id === toolId);
                              return (
                                <Badge
                                  key={toolId}
                                  className="bg-blue-600 text-white dark:bg-blue-500 hover:bg-blue-700 px-2.5 py-1 text-[11px] sm:text-xs border-none shadow-sm"
                                >
                                  {tool?.tool || "Tool"}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-center mt-4">
                          <Button
                            onClick={() => handleViewUseCase(useCase)}
                            className="w-full sm:w-auto sm:px-10 bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-full transition-all py-5 sm:py-2"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {content?.viewFullGuide}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </TabsContent>
            <TabsContent value="guide" className="space-y-6">
              <Card className="border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
                    <Lightbulb className="w-6 h-6" />
                    {content?.howToChoose}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-blue-100 dark:border-blue-700">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600" />
                        {content?.executionTime}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {content?.consider}
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>{content?.fast}</li>
                        <li>{content?.medium}</li>
                        <li>{content?.slow}</li>
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-blue-100 dark:border-blue-700">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-purple-600" />
                        {content?.computeRequirements}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {content?.match}
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>{content?.light}</li>
                        <li>{content?.mediumCompute}</li>
                        <li>{content?.heavy}</li>
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-blue-100 dark:border-blue-700">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                        <FileJson className="w-5 h-5 text-green-600" />
                        {content?.inputFormats}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {content?.check}
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>{content?.fasta}</li>
                        <li>{content?.fastq}</li>
                        <li>{content?.bamSam}</li>
                        <li>{content?.vcf}</li>
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-blue-100 dark:border-blue-700">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-blue-600" />
                        {content?.comparisonTips}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {content?.use}
                      </p>
                      <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                        <li>{content?.select}</li>
                        <li>{content?.review}</li>
                        <li>{content?.checkTime}</li>
                        <li>{content?.checkFormat}</li>
                        <li>{content?.checkDiscussions}</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog
          open={suggestToolModalOpen}
          onOpenChange={setSuggestToolModalOpen}
        >
          <DialogContent className="sm:max-w-[600px] dark:bg-gray-900 text-gray-900 dark:text-white">
            <DialogHeader>
              <DialogTitle className="text-teal-800 dark:text-teal-200">
                {content.suggestTool}
              </DialogTitle>
              <DialogDescription className="text-gray-700 dark:text-gray-300">
                {content.detailsSuggest}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-tool-name" className="text-right">
                  {content.toolName}
                </Label>
                <Input
                  id="new-tool-name"
                  value={newToolData.tool}
                  onChange={(e) =>
                    setNewToolData({ ...newToolData, tool: e.target.value })
                  }
                  className={`col-span-3 dark:bg-gray-800 ${formErrors.tool ? "border-red-500" : ""}`}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-tool-description" className="text-right">
                  {content.description}
                </Label>
                <Textarea
                  id="new-tool-description"
                  value={newToolData.description}
                  onChange={(e) =>
                    setNewToolData({ ...newToolData, description: e.target.value })
                  }
                  className={`col-span-3 dark:bg-gray-800 ${formErrors.description ? "border-red-500" : ""}`}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-tool-website" className="text-right">
                  Website
                </Label>
                <Input
                  id="new-tool-website"
                  value={newToolData.website}
                  onChange={(e) =>
                    setNewToolData({ ...newToolData, website: e.target.value })
                  }
                  className="col-span-3 dark:bg-gray-800"
                  placeholder="e.g., https://www.exampletool.com"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-tool-github" className="text-right">
                  GitHub
                </Label>
                <Input
                  id="new-tool-github"
                  value={newToolData.github}
                  onChange={(e) =>
                    setNewToolData({ ...newToolData, github: e.target.value })
                  }
                  className="col-span-3 dark:bg-gray-800"
                  placeholder="e.g., https://github.com/user/repo"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-tool-contact" className="text-right">
                  {content.contact}
                </Label>
                <Input
                  id="new-tool-contact"
                  value={newToolData.contact}
                  onChange={(e) =>
                    setNewToolData({ ...newToolData, contact: e.target.value })
                  }
                  className="col-span-3 dark:bg-gray-800"
                  placeholder="e.g., contact@exampletool.com"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div></div>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox
                    id="is-developer"
                    checked={newToolData.isDeveloper}
                    onCheckedChange={(checked) =>
                      setNewToolData({ ...newToolData, isDeveloper: checked as boolean })
                    }
                  />
                  <Label htmlFor="is-developer" className="text-sm font-medium">
                    {content.isDeveloper}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddToolSubmit} disabled={addToolMutation.isLoading} className="bg-teal-600 hover:bg-teal-700 text-white">
                {addToolMutation.isLoading ? content.submiting : content.submitSuggestion}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <WorkflowSuggestionModal open={suggestWorkflowOpen} onOpenChange={setSuggestWorkflowOpen} tools={allToolsData as Tool[]} handleRate={handleRate} />
        <UseCaseSuggestionModal open={suggestUseCaseOpen} onOpenChange={setSuggestUseCaseOpen} tools={allToolsData as Tool[]} handleRate={handleRate} />
        <RatingModal
          open={ratingOpen}
          onOpenChange={setRatingOpen}
          itemName={ratingItem?.name || ""}
          itemId={ratingItem?.id || 0}
          itemType={ratingItem?.type || "workflow"}
        />
        <FeedbackLinkModal
          url={linkToOpen || ""}
          open={showModal}
          onOpenChange={setShowModal}
          buttonColor="emerald"
          content={content}
        />
        <WorkflowDetailsModal
          open={workflowDetailsOpen}
          onOpenChange={setWorkflowDetailsOpen}
          workflow={selectedWorkflow}
          tools={allToolsData as Tool[]}
          content={content}
          handleMarkAsUsing={handleMarkAsUsing}
          currentUserId={user.data?.id}
          onDeleted={() => {
            workflows.refetch();
            setSelectedWorkflow(null);
            setWorkflowDetailsOpen(false);
          }}
        />
        <UseCaseDetailsModal
          open={useCaseDetailsOpen}
          onOpenChange={setUseCaseDetailsOpen}
          useCase={selectedUseCase}
          tools={allToolsData as Tool[]}
          handleMarkAsUsing={handleMarkAsUsing}
          currentUserId={user.data?.id}
          onDeleted={() => {
            useCases.refetch();
            setSelectedUseCase(null);
            setUseCaseDetailsOpen(false);
          }}
        />
        <MarkAsUsingModal
          open={markAsUsingOpen}
          onOpenChange={setMarkAsUsingOpen}
          itemName={markingItem?.name || ""}
          itemId={markingItem?.id || 0}
          itemType={markingItem?.type || "tool"}
        />
        <Dialog open={forumModalOpen} onOpenChange={setForumModalOpen}>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {content.startCommunityTopic || "Start Discussion"}
                </DialogTitle>
                <DialogDescription className="text-teal-100">
                  {content.createForumDescription || "Connect with other researchers about this methodology."}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6 bg-white dark:bg-gray-950">
              <div className="space-y-2">
                <Label htmlFor="forum-title" className="font-bold text-gray-700 dark:text-gray-300">
                  {content.titleDialog || "Topic Title"}
                </Label>
                <Input
                  id="forum-title"
                  value={forumTitle}
                  onChange={(e) => setForumTitle(e.target.value)}
                  placeholder="Methodology question about..."
                  className="h-11 border-gray-200 dark:border-gray-800 focus-visible:ring-teal-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forum-text" className="font-bold text-gray-700 dark:text-gray-300">
                  {content.message || "Your Insights"}
                </Label>
                <Textarea
                  id="forum-text"
                  value={forumText}
                  onChange={(e) => setForumText(e.target.value)}
                  placeholder={content.detail.shareYourAnalysis || "Share your analysis, doubts or findings..."}
                  className="min-h-[150px] border-gray-200 dark:border-gray-800 focus-visible:ring-teal-500 resize-none p-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forum-tags" className="font-bold text-gray-700 dark:text-gray-300">
                  Keywords <span className="font-normal text-gray-400 text-sm">({content.commaSeparated || "comma separated"})</span>
                </Label>
                <TagInput
                  value={forumTags}
                  onChange={(value: string) => setForumTags(value)}
                  placeholder={content.detail.tagsExample || "Add tags..."}
                  availableTags={tags.data?.map((value: { id: number; createdAt: string | null; updatedAt: string | null; tag: string | null; }) => value.tag || "") || []}
                  className="border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>

            <DialogFooter className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <Button variant="ghost" onClick={() => setForumModalOpen(false)} className="hover:bg-gray-200 dark:hover:bg-gray-800">
                {content.cancel || "Cancel"}
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 font-bold shadow-lg shadow-teal-500/20"
                onClick={handleSubmitForumPost}
                disabled={!forumTitle.trim() || !forumText.trim()}
              >
                {content.postTopic || "Publish Topic"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DefaultLayout >
  );
}