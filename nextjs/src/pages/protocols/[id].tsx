import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import DefaultLayout, { openLoginModalAtom } from "@/layout/default";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Calendar,
  User,
  Building2,
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  MessageCircleQuestion,
  Plus,
  MessageSquare,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type React from "react";
import { clientContent } from "@/language/client";
import { api } from "@/utils/api";
import { useAtom } from "jotai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TagInput from "@/components/ui/taginput";
import { getCategoryLabel } from "@/config/categoryConfig";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export interface Protocol {
  id: number;
  title: string;
  category: string;
  description: string;
  doi?: {
    type: "doi" | "url" | "text";
    value: string;
  }[];
  reference?: string;
  authors: string;
  institution: string;
  date: string;
  tags: string[];
  validation: "experimental" | "validated" | "standard";
  estimatedTime: string;
  document?: string;
  methodology?: string;
  materials?: string;
  troubleshooting?: string;
  protocolType?: "routine" | "first-choice" | "alternative";
  createdBy?: string;
  idUser?: number;
}

export default function ProtocolPage() {
  const router = useRouter();
  const { id } = router.query;
  const { locale } = useRouter();
  const { protocols: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent["en-us"];
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const [forumModalOpen, setForumModalOpen] = useState(false);
  const [forumTitle, setForumTitle] = useState("");
  const [forumText, setForumText] = useState("");
  const [forumTags, setForumTags] = useState("");
  const [currentProtocol, setCurrentProtocol] = useState<Protocol | null>(null);

  const user = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') return false;
      return failureCount < 3;
    },
  });

  const isAuthenticated = !!user.data?.id;
  const [openLoginModal, setOpenLoginModal] = useAtom(openLoginModalAtom);

  const protocolId = typeof id === 'string' ? Number(id) : null;

  const protocolQuery = api.protocol.getProcotolById.useQuery(
    { id: protocolId ?? 0 },
    { enabled: protocolId !== null }
  );

  const image = api.protocol.getProtocolImage.useMutation({
    onSuccess: (data) => {
      if (typeof data.link === "string") {
        const link = document.createElement("a");
        link.href = data.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  });

  const send = api.protocol.saveForumPost.useMutation({
    onSuccess: () => {
      setForumTitle("");
      setForumText("");
      setForumTags("");
      setCurrentProtocol(null);
      toast({
        title: content.forumPosted,
      });
      setForumModalOpen(false);
    },
  });

  const tags = api.educational.getTags.useQuery();

  if (!router.isReady || protocolId === null) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  if (protocolQuery.isLoading) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  const protocol = protocolQuery.data?.protocol;
  if (!protocol) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-gray-800">{content.id.notFound}</h2>
        <Button onClick={() => router.push("/protocols")} className="mt-4">{content.id.backToList}</Button>
      </div>
    );
  }

  const getValidationStyle = (status: string) => {
    const styles: Record<string, { color: string, icon: any, label: string }> = {
      experimental: {
        color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
        icon: AlertTriangle,
        label: content.experimental
      },
      validated: {
        color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        icon: CheckCircle2,
        label: content.validated
      },
      standard: {
        color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        icon: BookOpenCheck,
        label: content.standard
      }
    };
    return styles[status] || styles.validated;
  };

  const getProtocolTypeStyle = (type?: string) => {
    const styles: Record<string, { label: string, color: string, icon: any, description: string }> = {
      routine: {
        label: content.routine,
        color: "text-green-700 bg-green-50 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
        icon: CheckCircle2,
        description: content.routineDescription
      },
      "first-choice": {
        label: content.firstLine,
        color: "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        icon: Zap,
        description: content.firstLineDescription
      },
      alternative: {
        label: content.alternative,
        color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
        icon: MessageCircleQuestion,
        description: content.alternativeDescription
      }
    };
    return styles[type || "routine"] || styles.routine;
  };

  const valStyle = getValidationStyle(protocol.validation ?? "validated");
  const ValIcon = valStyle?.icon;

  const protocolTypeStyle = getProtocolTypeStyle(protocol.protocolType || "routine");
  const ProtocolTypeIcon = protocolTypeStyle?.icon;

  const handleCopyDOI = (doiValue: string) => {
    navigator.clipboard.writeText(`https://doi.org/${doiValue}`);
    setCopied(true);
    toast({ title: content.detail.doiCopied });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenForumModal = () => {
    if (!isAuthenticated) {
      setOpenLoginModal(true);
      return;
    }
    if (protocol.id !== undefined) {
      setCurrentProtocol(protocol as Protocol);
      setForumTitle(`Discussing: ${protocol.title}`);
      setForumModalOpen(true);
    }
  };

  const handleSubmitForumPost = () => {
    if (currentProtocol && 'id' in currentProtocol && typeof currentProtocol.id === 'number') {
      send.mutate({
        title: forumTitle,
        message: forumText,
        tags: forumTags.split(',').map(tag => tag.trim()).join(','),
        relatedProtocol: currentProtocol.id,
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="bg-gray-50 dark:bg-black min-h-screen pb-20">
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Button
              variant="ghost"
              onClick={() => router.push("/protocols")}
              className="mb-6 pl-0 hover:pl-2 transition-all text-gray-500 dark:text-gray-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {content.id.backToProtocols}
            </Button>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300">
                  {getCategoryLabel(protocol.category ?? '', content)}
                </Badge>
                <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${valStyle?.color}`}>
                  <ValIcon className="w-3.5 h-3.5" />
                  {valStyle?.label}
                </div>
                {protocol.protocolType && (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${protocolTypeStyle?.color}`}>
                        <ProtocolTypeIcon className="w-3.5 h-3.5" />
                        {protocolTypeStyle?.label}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p>{protocolTypeStyle?.description}</p></TooltipContent>
                  </Tooltip>
                )}
              </div>

              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/community?protocolId=${protocol.id}`)}
                      className="rounded-full border-gray-200 hover:border-teal-400 hover:bg-teal-500 dark:border-gray-700 dark:hover:bg-teal-900/20"
                    >
                      <MessageSquare className="h-4 w-4 md:mr-2 text-teal-600" />
                      <span className="hidden md:inline font-semibold">{content.whatPeopleSaying || "Discuss"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{content.whatPeopleSaying}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenForumModal}
                      className="rounded-full border-gray-200 hover:border-teal-400 hover:bg-teal-500 dark:border-gray-700 dark:hover:bg-teal-900/20"
                    >
                      <Plus className="h-4 w-4 md:mr-2 text-teal-600" />
                      <span className="hidden md:inline font-semibold">{content.startTopic || "New Topic"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{content.startTopic}</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
              {protocol.title}
            </h1>

            {protocol.createdBy && (
              <div className="flex items-center mt-2">
                <Link href={`/user/${protocol.idUser}`} className="flex items-center hover:opacity-80 transition-opacity">
                  <Avatar className="h-8 w-8 mr-2 ring-2 ring-white dark:ring-teal-900">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${protocol.createdBy}`} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-400 to-green-600 text-white text-xs">
                      {protocol.createdBy?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {protocol.createdBy}
                  </span>
                </Link>
              </div>
            )}

            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed mb-6 mt-4">
              {protocol.description}
            </p>

            {protocol.document && (
              <Button
                onClick={() => image.mutate({ id: protocol.id ?? 0 })}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
              >
                <Download className="w-4 h-4 mr-2" />
                {content.id.downloadPDF}
              </Button>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-gray-200 dark:border-gray-800 shadow-sm sticky top-6">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                      {content.id.details}
                    </h3>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">{content.id.intitution}</p>
                        <p className="text-sm font-medium dark:text-gray-200">{protocol.institution}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">{content.id.authors}</p>
                        <p className="text-sm font-medium dark:text-gray-200">{protocol.authors}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">{content.id.estimatedTime}</p>
                        <p className="text-sm font-medium dark:text-gray-200">{protocol.estimatedTime}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">{content.id.published}</p>
                        <p className="text-sm font-medium dark:text-gray-200">{protocol.date}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 border border-teal-100 dark:border-teal-900/30 rounded-xl p-4">
                    <h4 className="font-bold text-sm text-teal-900 dark:text-teal-400 flex items-center gap-2 mb-2">
                      <MessageCircleQuestion className="w-4 h-4" />
                      {content.detail.communityInsights || "Community Insights"}
                    </h4>
                    <p className="text-xs text-teal-700 dark:text-teal-500 mb-4">
                      {content.detail.communityInsightsDescription || "Ask your questions or share your improvements with other researchers."}
                    </p>
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold"
                        onClick={handleOpenForumModal}
                      >
                        {content.startTopic || "New Topic"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-teal-700 dark:text-teal-400 hover:bg-teal-700 dark:hover:bg-teal-900/40"
                        onClick={() => router.push(`/community?protocolId=${protocol.id}`)}
                      >
                        {content.whatPeopleSaying || "View Forum"}
                      </Button>
                    </div>
                  </div>

                  {protocol.doi && Array.isArray(protocol.doi) && protocol.doi.length > 0 ? (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{content.detail.linkedResearch || "Linked Research"}</h3>
                      <div className="space-y-3">
                        {protocol.doi.map((ref: any, index: number) => (
                          <div key={index} className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 text-xs">
                              <p className="text-gray-600 dark:text-gray-400 mb-1 uppercase font-bold">{ref.type}</p>
                              <a href={ref.type === "doi" ? `https://doi.org/${ref.value}` : ref.value} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline break-all flex items-center gap-1">
                                {ref.value} <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            {ref.type === "doi" && (
                              <Button variant="outline" size="sm" onClick={() => handleCopyDOI(ref.value)}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{content.id.methology}</h2>
                </div>
                <Card className="border-none shadow-md bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800">
                  <CardContent className="p-6 md:p-8">
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {protocol.methodology}
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{content.id.materials}</h2>
                </div>
                <Card className="border-none shadow-md bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800">
                  <CardContent className="p-6 md:p-8">
                    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {protocol.materials}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {protocol.troubleshooting && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{content.id.troubleshooting}</h2>
                  </div>
                  <Card className="border-none shadow-md bg-amber-50/50 dark:bg-amber-900/10 ring-1 ring-amber-200 dark:ring-amber-800/50">
                    <CardContent className="p-6 md:p-8">
                      <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                        {protocol.troubleshooting}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">{content.id.keywords}</h3>
                <div className="flex flex-wrap gap-2">
                  {protocol.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <Label htmlFor="forum-title" className="font-bold text-gray-700 dark:text-gray-300">{content.titleDialog || "Topic Title"}</Label>
                <Input
                  id="forum-title"
                  value={forumTitle}
                  onChange={(e) => setForumTitle(e.target.value)}
                  className="h-11 border-gray-200 dark:border-gray-800 focus-visible:ring-teal-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forum-text" className="font-bold text-gray-700 dark:text-gray-300">{content.message || "Your Insights"}</Label>
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
                  placeholder={content.detail.tagsExample || "e.g. reagents, method, physics"}
                />
              </div>
            </div>

            <DialogFooter className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <Button variant="ghost" onClick={() => setForumModalOpen(false)}>
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
    </TooltipProvider>
  );
}

ProtocolPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};