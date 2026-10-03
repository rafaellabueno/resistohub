import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useMemo } from "react";
import DefaultLayout, { openLoginModalAtom } from "@/layout/default";
import {
  FlaskConical,
  Search,
  Clock,
  Upload,
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  BookOpenCheck,
  Building2,
  User,
  CheckCircle2,
  MessageCircleQuestion,
  Plus,
  MessageSquare,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SubmitProtocolModal from "@/components/submitProtocolModal";
import ProtocolDetail from "@/components/protocolDetail";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { clientContent } from "@/language/client";
import { api } from "@/utils/api";
import { useAtom } from "jotai";
import { toast } from "@/components/ui/use-toast";
import TagInput from "@/components/ui/taginput";
import { getCategoryLabel } from "@/config/categoryConfig";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LIMIT = 10;

export interface Protocol {
  id: number;
  title: string;
  category: string;
  description: string;
  doi?: { type: "doi" | "url" | "text"; value: string; }[];
  reference?: string;
  authors: string;
  institution: string;
  date: string;
  tags: string[];
  validation: "experimental" | "validated" | "standard";
  estimatedTime: string;
  citations: number;
  document?: string;
  protocolType?: "routine" | "first-choice" | "alternative"; // NOVO CAMPO
}

export default function Protocols() {
  const router = useRouter();
  const { locale } = useRouter();
  const { protocols: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent["en-us"];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");

  const [forumModalOpen, setForumModalOpen] = useState(false);
  const [forumTitle, setForumTitle] = useState("");
  const [forumText, setForumText] = useState("");
  const [forumTags, setForumTags] = useState("");
  const [currentProtocol, setCurrentProtocol] = useState<Protocol | null>(null);

  const protocols = api.protocol.getProtocols.useQuery({
    limit: LIMIT,
    searchQuery,
    filters: searchQuery,
  });

  const user = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') return false;
      return failureCount < 3;
    },
  });

  const isAuthenticated = !!user.data?.id;
  const [openLoginModal, setOpenLoginModal] = useAtom(openLoginModalAtom);

  const categories = Array.from(new Set(protocols.data?.protocols.map(p => p.category)));

  const filteredAndSortedProtocols = useMemo(() => {
    let filtered = protocols.data?.protocols.filter(p => {
      const matchCategory = !selectedCategory || p.category === selectedCategory;
      const matchSearch = !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });

    return filtered?.sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [protocols.data?.protocols, selectedCategory, searchQuery, sortBy]);

  const getValidationStyle = (status: string) => {
    const styles: Record<string, { color: string, icon: any }> = {
      experimental: {
        color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: AlertTriangle
      },
      validated: {
        color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        icon: CheckCircle2
      },
      standard: {
        color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        icon: BookOpenCheck
      }
    };
    return styles[status] || styles.validated;
  };

  const getProtocolTypeStyle = (type?: string) => {
    const styles: Record<string, { label: string, color: string, icon: any, description: string }> = {
      routine: {
        label: content.routine,
        color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800",
        icon: CheckCircle2,
        description: content.routineDescription
      },
      "first-choice": {
        label: content.firstLine,
        color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        icon: Zap,
        description: content.firstLineDescription
      },
      alternative: {
        label: content.alternative,
        color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        icon: MessageCircleQuestion,
        description: content.alternativeDescription
      }
    };
    return styles[type || "routine"] || styles.routine;
  };

  const image = api.protocol.getProtocolImage.useMutation({
    onSuccess: (data) => {
      if (typeof data.link === "string") {
        const link = document.createElement("a");
        link.href = data.link;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  });

  const handleOpenForumModal = (protocol: Protocol) => {
    if (!isAuthenticated) {
      setOpenLoginModal(true);
      return;
    }
    setCurrentProtocol(protocol);
    setForumTitle(`Discussing: ${protocol.title}`);
    setForumModalOpen(true);
  };

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
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white py-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 bg-repeat"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-200 text-sm font-medium mb-6 border border-indigo-500/30 backdrop-blur-sm">
              <FlaskConical className="w-4 h-4 mr-2" />
              <span>{content.title}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200 leading-tight">
              {content.title}
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mb-8 leading-relaxed">
              {content.subtitle}.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6 rounded-2xl max-w-sm">
              <div className="text-center">
                <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">{content.contribute}</h3>
                <p className="text-gray-300 text-sm mb-4">{content.uploadDesc}</p>
                <Button
                  onClick={() => isAuthenticated ? setIsModalOpen(true) : setOpenLoginModal(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-500/25"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {content.uploadBtn}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-black min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl -mt-20 relative z-20">

          <Card className="bg-white dark:bg-gray-900 shadow-xl border-0 ring-1 ring-gray-200 dark:ring-gray-800 rounded-2xl mb-10">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder={content.search}
                      className="pl-12 h-12 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-purple-500 rounded-xl"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                    <SelectTrigger className="w-[180px] h-12 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">{content.recent}</SelectItem>
                      <SelectItem value="oldest">{content.oldest}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-500 flex items-center mr-2">
                    <Filter className="w-3 h-3 mr-1" />
                    {content.filterBy}:
                  </span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === null
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                  >
                    {content.allProtocols}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProtocols?.map((protocol) => {
              const style = getValidationStyle(protocol.validation);
              const Icon = style?.icon;
              const protocolTypeStyle = getProtocolTypeStyle(protocol.protocolType);
              const ProtocolTypeIcon = protocolTypeStyle?.icon;

              return (
                <Card
                  key={protocol.id}
                  className="group flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/10">
                        {getCategoryLabel(protocol.category, content)}
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${style?.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {protocol.validation.toUpperCase()}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent><p>{content.modal.validation}</p></TooltipContent>
                      </Tooltip>
                    </div>

                    {protocol.createdBy && (
                      <div className="flex items-center mt-2">
                        <Link href={`/user/${protocol.idUser}`} className="flex items-center hover:opacity-80 transition-opacity">
                          <Avatar className="h-8 w-8 mr-2 ring-2 ring-white dark:ring-teal-900">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${protocol.createdBy}`} />
                            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-green-600 text-white text-xs">
                              {protocol.createdBy?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {protocol.createdBy}
                          </span>
                        </Link>
                      </div>
                    )}

                    {protocol.protocolType && (
                      <div className="mb-3 mt-4">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border w-fit ${protocolTypeStyle?.color}`}>
                              <ProtocolTypeIcon className="w-3.5 h-3.5" />
                              {protocolTypeStyle?.label}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent><p>{protocolTypeStyle?.description}</p></TooltipContent>
                        </Tooltip>
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                      <a href={`/protocols/${protocol.id}`}>{protocol.title}</a>
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {protocol.description}
                    </p>

                    <div className="mt-auto space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <Building2 className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="truncate font-medium">{protocol.institution}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate">{protocol.authors}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(protocol.date).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        {protocol.document && (
                          <Button size="sm" variant="ghost" onClick={() => image.mutate({ id: protocol.id })} className="h-8 w-8 p-0">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => { setSelectedProtocol(protocol); setIsDetailOpen(true); }}
                          className="h-8 bg-white dark:bg-gray-800 text-purple-700 border-purple-200 hover:bg-purple-50"
                        >
                          {content.readMore}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/community?protocolId=${protocol.id}`)}
                            className="h-9 border-gray-200 hover:border-indigo-400 hover:bg-indigo-500 dark:hover:bg-indigo-900/20"
                          >
                            <MessageSquare className="h-4 w-4 mr-2 text-indigo-600" />
                            <span className="text-xs font-semibold">{content.whatPeopleSaying}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">{content.whatPeopleSaying}</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenForumModal(protocol)}
                            className="h-9 border-gray-200 hover:border-indigo-400 hover:bg-indigo-500 dark:hover:bg-indigo-900/20"
                          >
                            <Plus className="h-4 w-4 mr-2 text-indigo-600" />
                            <span className="text-xs font-semibold">{content.startTopic}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">{content.startTopic}</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <SubmitProtocolModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        {selectedProtocol && (
          <ProtocolDetail
            protocol={selectedProtocol}
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            onDeleted={() => {
              protocols.refetch();
              setSelectedProtocol(null);
              setIsDetailOpen(false);
            }}
          />
        )}

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
      </section>
    </TooltipProvider>
  );
}

Protocols.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};