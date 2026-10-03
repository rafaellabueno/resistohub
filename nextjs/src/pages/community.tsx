import DefaultLayout, { openLoginModalAtom } from "@/layout/default";
import {
  MessageSquare,
  Search,
  Tag,
  TrendingUp,
  Filter,
  Award,
  Clock,
  MessagesSquare,
  CheckCircle,
  User,
  Stethoscope,
  MapPin,
  FlaskConical,
  TrendingDown,
  BookOpen,
  Plus,
  ChevronRight,
  FileText,
  Zap,
  AlertCircle,
  Lightbulb,
  Calendar,
  ChevronLeft,
  Upload,
} from "lucide-react";
import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/router";
import { clientContent } from "@/language/client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAtom } from "jotai";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/utils/api";

type ContentType = 'clinical' | 'negative-result' | 'publication' | 'general';

interface ContentItem {
  id: number;
  type: ContentType;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  tags: string[];
  resolved?: boolean;
  comments: number;
  votes: number;
  clinicalUnit?: string;
  region?: string;
  resultType?: string;
  sampleSize?: number;
  journal?: string;
  doi?: string;
  authors?: string;
}

interface FormData {
  title: string;
  description: string;
  tags: string;
  clinicalUnit?: string;
  region?: string;
  additionalInfo?: string;
  studyType?: string;
  sampleSize?: string;
  workingHypothesis?: string;
  conclusions?: string;
  publicationAuthors?: string;
  journal?: string;
  year?: string;
  doi?: string;
  abstract?: string;
  scope?: string;
  targetAudience?: string;
  graphicalAbstract?: File | null;
}

const ITEMS_PER_PAGE = 10;

export default function CommunityUpdated() {
  const { locale } = useRouter();
  const router = useRouter();
  const { community: content } = clientContent[locale as keyof typeof clientContent];

  const [activeTab, setActiveTab] = useState<ContentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "thisWeek" | "thisMonth" | "">("")
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'popular' | 'unanswered' | 'resolved'>('all');
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [contentTypeModalOpen, setContentTypeModalOpen] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  const [openLoginModal, setOpenLoginModal] = useAtom(openLoginModalAtom);
  const [currentPage, setCurrentPage] = useState(1);
  const [article, setArticle] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<string | null>(null);
  const [useCase, setUseCase] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [tool, setTool] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    tags: "",
  });

  const experts = api.community.getExperts.useQuery();
  const popularTags = api.community.getPopularTags.useQuery();

  const user = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') return false;
      return failureCount < 3;
    },
  });

  const isAuthenticated = !!user.data?.id;

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      setOpenLoginModal(true);
      return;
    }
    setContentTypeModalOpen(true);
  };

  const handleSelectContentType = (type: ContentType) => {
    setCurrentPage(1);
    setSelectedContentType(type);
    setFormData({
      title: "",
      description: "",
      tags: "",
    });
  };

  const handleFormChange = (field: keyof FormData, value: string | File) => {
    setCurrentPage(1);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitContent = () => {
    if (!formData.title || !formData.description) {
      toast({ title: "Por favor, preencha os campos obrigatórios" });
      return;
    }

    handleSubmitForumPost();
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleDateFilterClick = (filter: "today" | "thisWeek" | "thisMonth") => {
    setDateFilter(prev => prev === filter ? "" : filter);
  };

  const handleStatusFilterChange = (status: 'all' | 'popular' | 'unanswered' | 'resolved') => {
    setStatusFilter(status);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    setAppliedSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, graphicalAbstract: e.target.files![0] || null }));
    }
  }

  const recentQuestions = api.community.getRecentQuestions.useQuery({
    limit: ITEMS_PER_PAGE,
    page: currentPage,
    searchQuery: appliedSearch || undefined,
    filters: JSON.stringify({
      statusFilter: statusFilter !== 'all' ? statusFilter : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      dateFilter: dateFilter !== '' ? dateFilter : undefined,
      type: activeTab !== 'all' ? activeTab : undefined,
    }),
    workflowId: Number(workflow) || undefined,
    protocolId: Number(protocol) || undefined,
    article: article || undefined,
    toolId: Number(tool) || undefined,
    useCaseId: Number(useCase) || undefined,
  }, {
    keepPreviousData: true,
  });

  const getContentTypeInfo = (type: ContentType) => {
    const info: Record<ContentType, { icon: React.ReactNode; color: string; label: string; bgColor: string }> = {
      clinical: { icon: <Stethoscope className="w-5 h-5" />, color: "text-blue-600", label: "Discussão Clínica", bgColor: "bg-blue-50 dark:bg-blue-950/20" },
      'negative-result': { icon: <TrendingDown className="w-5 h-5" />, color: "text-red-600", label: "Resultado Negativo", bgColor: "bg-red-50 dark:bg-red-950/20" },
      publication: { icon: <BookOpen className="w-5 h-5" />, color: "text-purple-600", label: "Publicação", bgColor: "bg-purple-50 dark:bg-purple-950/20" },
      general: { icon: <Lightbulb className="w-5 h-5" />, color: "text-amber-600", label: "Discussão Geral", bgColor: "bg-amber-50 dark:bg-amber-950/20" }
    };
    return info[type];
  };

  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.article) {
      const article = router.query.article as string;
      setArticle(article);
    }

    if (router.query.toolId) {
      const toolId = router.query.toolId as string;
      setTool(toolId);
    }

    if (router.query.protocolId) {
      const protocolId = router.query.protocolId as string;
      setProtocol(protocolId);
    }

    if (router.query.workflowId) {
      const workflowId = router.query.workflowId as string;
      setWorkflow(workflowId);
    }

    if (router.query.useCaseId) {
      const useCaseId = router.query.useCaseId as string;
      setUseCase(useCaseId);
    }

    if (isInitialLoad) {
      setCurrentPage(1);
      setIsInitialLoad(false);
    }
  }, [router.isReady, router.query, isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad) {
      setCurrentPage(1);
    }
  }, [statusFilter, appliedSearch, selectedTags, dateFilter, activeTab, isInitialLoad, workflow, protocol, article, tool, useCase]);

  const send = api.educational.saveForumPost.useMutation({
    onSuccess: () => {
      toast({
        title: content.forumPosted,
      });
      setOpenLoginModal(false);
      setContentTypeModalOpen(false);
      setSelectedContentType(null);
      setFormData({ title: "", description: "", tags: "" });
      recentQuestions.refetch();
      setCurrentPage(1);
    },
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmitForumPost = async () => {
    setCurrentPage(1);
    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "")
      .join(",");

    const payload: any = {
      title: formData.title,
      message: formData.description,
      tags: tagsArray,
      type: selectedContentType,
      relatedArticle: article ?? undefined,
    };

    if (selectedContentType === 'clinical') {
      payload.clinicalUnit = formData.clinicalUnit || undefined;
      payload.region = formData.region || undefined;
      payload.additionalInfo = formData.additionalInfo || undefined;
    } else if (selectedContentType === 'negative-result') {
      payload.studyType = formData.studyType || undefined;
      payload.sampleSize = formData.sampleSize ? parseInt(formData.sampleSize) : undefined;
      payload.workingHypothesis = formData.workingHypothesis || undefined;
      payload.conclusions = formData.conclusions || undefined;
    } else if (selectedContentType === 'publication') {
      let base64Image: string | undefined = undefined;
      if (formData.graphicalAbstract) {
        base64Image = await convertToBase64(formData.graphicalAbstract as File)
      }
      payload.authors = formData.publicationAuthors || undefined;
      payload.journal = formData.journal || undefined;
      payload.year = formData.year ? parseInt(formData.year) : undefined;
      payload.doi = formData.doi || undefined;
      payload.abstract = formData.abstract || undefined;
      payload.scope = formData.scope || undefined;
      payload.targetAudience = formData.targetAudience || undefined;
      payload.graphicalAbstract = base64Image || undefined;
      payload.conclusions = formData.conclusions || undefined;
    }

    send.mutate(payload);
  };

  const totalItems = recentQuestions.data?.totalCount || 0;
  const totalPages = recentQuestions.data?.totalPages || 1;
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  return (
    <DefaultLayout>
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-slate-900 to-slate-900 text-white py-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-200 text-sm font-medium mb-6 border border-teal-500/30 backdrop-blur-sm">
              <MessagesSquare className="w-4 h-4 mr-2" />
              <span>{content.communityHub}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-teal-200 to-cyan-200 leading-tight">
              {content.title}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              {content.subtitle}
            </p>
            <Button
              onClick={handleOpenModal}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg shadow-teal-500/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              {content.newQuestion}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-black min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          <Card className="bg-white dark:bg-gray-900 shadow-lg border-2 border-gray-200 dark:border-gray-800 rounded-2xl mb-10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder={content.search}
                    className="pl-12 h-12 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-teal-500 rounded-xl"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <Button
                  onClick={handleSearchSubmit}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 rounded-xl h-12"
                >
                  {content.searchButton}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 min-w-0 w-full overflow-hidden">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType | 'all')} className="w-full mb-8">
                <TabsList className="flex w-full overflow-x-auto overflow-y-hidden justify-start md:grid md:grid-cols-5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg no-scrollbar h-auto">
                  <TabsTrigger
                    value="all"
                    className="flex-shrink-0 min-w-[80px] md:min-w-0 whitespace-nowrap text-xs md:text-sm px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 shadow-sm"
                  >
                    {content.tabs.all}
                  </TabsTrigger>

                  <TabsTrigger
                    value="clinical"
                    className="flex-shrink-0 min-w-[100px] md:min-w-0 whitespace-nowrap text-xs md:text-sm px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 shadow-sm"
                  >
                    {content.tabs.clinical}
                  </TabsTrigger>

                  <TabsTrigger
                    value="negative-result"
                    className="flex-shrink-0 min-w-[140px] md:min-w-0 whitespace-nowrap text-xs md:text-sm px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 shadow-sm"
                  >
                    {content.tabs.negativeResults}
                  </TabsTrigger>

                  <TabsTrigger
                    value="publication"
                    className="flex-shrink-0 min-w-[120px] md:min-w-0 whitespace-nowrap text-xs md:text-sm px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 shadow-sm"
                  >
                    {content.tabs.publications}
                  </TabsTrigger>

                  <TabsTrigger
                    value="general"
                    className="flex-shrink-0 min-w-[100px] md:min-w-0 whitespace-nowrap text-xs md:text-sm px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 shadow-sm"
                  >
                    {content.tabs.general}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab} className="mt-8">
                  {recentQuestions.data?.questions && recentQuestions.data.questions.length > 0 ? (
                    <>
                      <div className="grid gap-6 mb-8">
                        {recentQuestions.data.questions.map((item) => {
                          const typeInfo = item.type ? getContentTypeInfo(item.type as ContentType) : null;
                          return (
                            <Card
                              onClick={() => router.push(`/question/${item.id}`)}
                              key={item.id}
                              className={`border-2 border-gray-200 dark:border-gray-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all cursor-pointer overflow-hidden ${typeInfo?.bgColor}`}
                            >
                              <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                  <div className={`flex-shrink-0 w-full md:w-20 flex items-center justify-center p-6 md:p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700`}>
                                    <div className={`${typeInfo?.color} text-3xl`}>
                                      {typeInfo?.icon}
                                    </div>
                                  </div>

                                  <div className="flex-1 p-6">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                      <div className="flex-1">
                                        <Badge className={`mb-3 ${typeInfo?.bgColor} ${typeInfo?.color} border-0`}>
                                          {typeInfo?.label}
                                        </Badge>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                          {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                                          {item?.excerpt}
                                        </p>
                                      </div>

                                      <div className="flex-shrink-0">
                                        {item.resolved === 'yes' ? (
                                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            {content.resolved}
                                          </Badge>
                                        ) : (
                                          <Badge variant="destructive" className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {content.open}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {item.tags.map((tagObj) => (
                                        <Badge key={tagObj.id} variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                          {tagObj.tag}
                                        </Badge>
                                      ))}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {item.author}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}
                                      </span>

                                      {item.type === 'clinical' && item.clinicalUnit && (
                                        <span className="flex items-center gap-1">
                                          <Stethoscope className="w-3 h-3" />
                                          {item.clinicalUnit}
                                        </span>
                                      )}
                                      {item.type === 'clinical' && item.region && (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {item.region}
                                        </span>
                                      )}

                                      {item.type === 'negative-result' && item.workingHipothesis && (
                                        <span className="flex items-center gap-1">
                                          <FlaskConical className="w-3 h-3" />
                                          {item.workingHipothesis}
                                        </span>
                                      )}

                                      {item.type === 'publication' && item.journal && (
                                        <span className="flex items-center gap-1">
                                          <BookOpen className="w-3 h-3" />
                                          {item.journal}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex-shrink-0 flex md:flex-col items-center justify-around md:justify-center gap-4 p-6 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                                        {item.votes}
                                      </div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {content.votes}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                                        {item.comments}
                                      </div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" />
                                        {content.comments}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800">
                        <Button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={!canPreviousPage || recentQuestions.isFetching}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          {content.previous}
                        </Button>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {content.page} <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> de <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 ml-4">
                            {content.total} {totalItems} {totalItems === 1 ? content.topic : content.topics}
                          </span>
                        </div>

                        <Button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={!canNextPage || recentQuestions.isFetching}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {content.next}
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-16">
                      <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {content.noTopicsFound}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {content.tryAnotherSearch}
                      </p>
                      <Button onClick={handleOpenModal} className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="w-4 h-4 mr-2" />
                        {content.createNewTopic}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-lg rounded-2xl">
                <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Filter size={16} className="text-teal-600 dark:text-teal-400" />
                    {content.filters.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-3">{content.byStatus}</p>
                      <div className="space-y-2">
                        {[
                          { value: 'all' as const, label: content.filters.all, icon: '📋' },
                          { value: 'popular' as const, label: content.filters.popular, icon: '🔥' },
                          { value: 'unanswered' as const, label: content.filters.unanswered, icon: '🤔' },
                          { value: 'resolved' as const, label: content.filters.resolved, icon: '🔍' },
                        ].map(filter => (
                          <button
                            key={filter.value}
                            onClick={() => handleStatusFilterChange(filter.value)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${statusFilter === filter.value
                              ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                              }`}
                          >
                            <span>{filter.icon}</span>
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400 mb-3">{content.filters.byPeriod}</p>
                      <div className="space-y-2">
                        {(['today', 'thisWeek', 'thisMonth'] as const).map(filter => (
                          <button
                            key={filter}
                            onClick={() => handleDateFilterClick(filter)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${dateFilter === filter
                              ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                              }`}
                          >
                            {filter === 'today' ? content.filters.today : filter === 'thisWeek' ? content.filters.thisWeek : content.filters.thisMonth}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-lg rounded-2xl">
                <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Tag size={16} className="text-teal-600 dark:text-teal-400" />
                    {content.popularTags}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    {popularTags.data?.tags.map((tag) => (
                      <button
                        key={tag.tag}
                        onClick={() => handleTagClick(tag.tag as string)}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${selectedTags.includes(tag.tag as string)
                          ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{tag.tag}</span>
                          <span className="text-xs bg-gray-300 dark:bg-gray-600 px-2 py-1 rounded">{tag.count}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-lg rounded-2xl">
                <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Award size={16} className="text-teal-600 dark:text-teal-400" />
                    {content.mostActiveUsers}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {experts.data?.experts.map((expert) => (
                      <div key={expert.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name} ${expert.lastName}`} />
                          <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{expert.name} {expert.lastName}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{expert.typeSpecialist}</p>
                          <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{expert.count} {expert.count === 1 ? content.answer : content.answers}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={contentTypeModalOpen} onOpenChange={setContentTypeModalOpen}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <Plus className="text-teal-600" size={24} />
              {!selectedContentType ? content.startCommunityTopic : selectedContentType === 'clinical' ? content.tabs.clinical : selectedContentType === 'negative-result' ? content.tabs.negativeResults : selectedContentType === 'publication' ? content.tabs.publications : content.tabs.general}
            </DialogTitle>
            <DialogDescription>
              {!selectedContentType ? content.createForumDescription : content.createForumDescription2}
            </DialogDescription>
          </DialogHeader>

          {!selectedContentType ? (
            <div className="grid grid-cols-2 gap-4 py-8">
              <button
                onClick={() => handleSelectContentType('clinical')}
                className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{content.clinicalCaseDiscussion}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{content.shareClinical}</p>
              </button>

              <button
                onClick={() => handleSelectContentType('negative-result')}
                className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{content.negativeResult}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{content.shareNegative}</p>
              </button>

              <button
                onClick={() => handleSelectContentType('publication')}
                className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{content.publication}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{content.shareResearch}</p>
              </button>

              <button
                onClick={() => handleSelectContentType('general')}
                className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{content.generalTopics}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{content.shareGeneral}</p>
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitContent(); }} className="space-y-6 py-6">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.titleDialog}</label>
                <Input
                  placeholder={
                    selectedContentType === 'clinical' ? content.titleExamples.clinical :
                      selectedContentType === 'negative-result' ? content.titleExamples.regativeResult :
                        selectedContentType === 'publication' ? content.titleExamples.publication :
                          content.titleExamples.general
                  }
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.descriptionDialog}</label>
                <Textarea
                  placeholder={
                    selectedContentType === 'clinical' ? content.descriptionExamples.clinical :
                      selectedContentType === 'negative-result' ? content.descriptionExamples.regativeResult :
                        selectedContentType === 'publication' ? content.descriptionExamples.publication :
                          content.descriptionExamples.general
                  }
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  required
                  className="min-h-[120px]"
                />
              </div>

              {selectedContentType === 'clinical' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.healthcareUnit}</label>
                      <Input
                        placeholder={content.healthcareUnitExample}
                        value={formData.clinicalUnit || ''}
                        onChange={(e) => handleFormChange('clinicalUnit', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">{content.healthcareUnitOptional}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.region}</label>
                      <Input
                        placeholder={content.regionExample}
                        value={formData.region || ''}
                        onChange={(e) => handleFormChange('region', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">{content.regionOptional}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.additionalInfo}</label>
                    <Textarea
                      placeholder={content.additionalInfoExample}
                      value={formData.additionalInfo || ''}
                      onChange={(e) => handleFormChange('additionalInfo', e.target.value)}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">{content.additionalInfoOptional}</p>
                  </div>
                </>
              )}

              {selectedContentType === 'negative-result' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.studyType}</label>
                      <Select value={formData.studyType || ''} onValueChange={(value) => handleFormChange('studyType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={content.selectOptional} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-vitro">In Vitro</SelectItem>
                          <SelectItem value="in-vivo">In Vivo</SelectItem>
                          <SelectItem value="computational">{content.computational}</SelectItem>
                          <SelectItem value="clinical">{content.clinical}</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">{content.optional}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.sampleSize}</label>
                      <Input
                        type="number"
                        placeholder={content.sampleSizeExample}
                        value={formData.sampleSize || ''}
                        onChange={(e) => handleFormChange('sampleSize', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">{content.optional}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.workingHipothesis}</label>
                    <Input
                      placeholder={content.workingHipothesisExample}
                      value={formData.workingHypothesis || ''}
                      onChange={(e) => handleFormChange('workingHypothesis', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">{content.optional}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.conclusions}</label>
                    <Textarea
                      placeholder={content.conclusionsExample}
                      value={formData.conclusions || ''}
                      onChange={(e) => handleFormChange('conclusions', e.target.value)}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">{content.optional}</p>
                  </div>
                </>
              )}

              {selectedContentType === 'publication' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.authors}</label>
                      <Input
                        placeholder={content.authorsExample}
                        value={formData.publicationAuthors || ''}
                        onChange={(e) => handleFormChange('publicationAuthors', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">{content.optional}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.journal}</label>
                      <Input
                        placeholder={content.journalExample}
                        value={formData.journal || ''}
                        onChange={(e) => handleFormChange('journal', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">{content.optional}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.year}</label>
                      <Input
                        type="number"
                        placeholder={content.yearExample}
                        value={formData.year || ''}
                        onChange={(e) => handleFormChange('year', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">{content.optional}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-2">DOI</label>
                      <Input
                        placeholder={content.doiExample}
                        value={formData.doi || ''}
                        onChange={(e) => handleFormChange('doi', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">{content.optional}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.abstract}</label>
                    <Textarea
                      placeholder={content.abstractExample}
                      value={formData.abstract || ''}
                      onChange={(e) => handleFormChange('abstract', e.target.value)}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">{content.optional}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.scope}</label>
                    <Textarea
                      placeholder={content.scopeExample}
                      value={formData.scope || ''}
                      onChange={(e) => handleFormChange('scope', e.target.value)}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">{content.optional}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.conclusions}</label>
                    <Textarea
                      placeholder={content.conclusionsExample2}
                      value={formData.conclusions || ''}
                      onChange={(e) => handleFormChange('conclusions', e.target.value)}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">{content.optional}</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.targetAudience}</label>
                    <Textarea
                      placeholder={content.targetAudienceExample}
                      value={formData.targetAudience || ''}
                      onChange={(e) => handleFormChange('targetAudience', e.target.value)}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">{content.optional}</p>
                  </div>

                  <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-sm font-bold">2</span>
                      {content.graphicalAbstract} ({content.optional})
                    </h3>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 flex gap-2 text-sm text-blue-800 dark:text-blue-300 mb-2">
                      <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>{content.graphicalAbstractExample}</p>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative cursor-pointer group">
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        accept=".png,.jpg,.jpeg,.svg,.gif"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center gap-2">
                        {formData.graphicalAbstract ? (
                          <>
                            <FileText className="h-10 w-10 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                              {formData.graphicalAbstract.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(formData.graphicalAbstract.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-gray-400 group-hover:text-purple-500 transition-colors" />
                            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400">
                              {content.graphicalAbstractExample}
                            </span>
                            <span className="text-xs text-gray-400">{content.graphicalAbstractExample2}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 block mb-2">{content.tagsLabel}</label>
                <Input
                  placeholder={content.tagsPlaceholder}
                  value={formData.tags}
                  onChange={(e) => handleFormChange('tags', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">{content.optionalTags}</p>
              </div>

              <div className="flex gap-3 justify-end pt-6">
                <Button type="button" variant="ghost" onClick={() => { setSelectedContentType(null); setContentTypeModalOpen(false); }}>
                  {content.cancel}
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-10 shadow-lg shadow-teal-900/20">
                  {content.postTopic}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}