import DefaultLayout, { openLoginModalAtom } from "@/layout/default";
import { useAtom } from "jotai";
import {
  Book, FileText, Search, TrendingUp, Clock, SlidersHorizontal, BookOpen, AlertCircle, Radar, Dna,
  Microscope,
  FlaskConical,
  Workflow,
  Biohazard,
  Eye,
  Database,
  Computer,
  MessageCircleQuestion,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Sparkles
} from "lucide-react";
import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { clientContent } from "@/language/client";
import { api } from "@/utils/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import TagInput from "@/components/ui/taginput";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const LIMIT = 10;

interface Article {
  id: string;
  title: string;
  doi: string;
  authors: string;
  journal: string;
  year: number;
  abstract: string;
}

const ArticleCard: React.FC<{
  article: Article;
  content: any;
  handleOpenForumModal: (article: Article) => void;
  navigateToForums: (article: Article) => void;
  handleClickArticle: (doi: string) => void;
}> = ({ article, content, handleOpenForumModal, navigateToForums, handleClickArticle }) => (
  <Card className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 mb-6">
    <CardContent className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800">
              {article.year}
            </span>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              {article.journal}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-teal-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {article.authors}
          </p>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-gray-200 dark:border-gray-800 text-gray-400 hover:text-teal-600 hover:border-teal-200"
                onClick={() => handleClickArticle(article.doi)}
              >
                <ArrowUpRight className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{content.viewArticle}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="relative mb-6">
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-justify line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
          {article.abstract}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileText className="h-4 w-4 text-teal-500" />
          <span className="truncate max-w-[200px]">DOI: {article.doi}</span>
        </div>

        <div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToForums(article)}
                  className="rounded-lg border-gray-200 hover:border-teal-400 hover:bg-teal-500 dark:border-gray-700 dark:hover:bg-teal-900/20"
                >
                  <MessageCircleQuestion className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{content.whatPeopleSaying || "Discuss"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{content.whatPeopleSaying}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenForumModal(article)}
                  className="rounded-lg border-gray-200 hover:border-teal-400 hover:bg-teal-500 dark:border-gray-700 dark:hover:bg-teal-900/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{content.startTopic || "New Topic"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{content.startTopic}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            onClick={() => handleClickArticle(article.doi)}
            className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-teal-500/20 transition-all hover:scale-105"
            size="sm"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {content.readFullArticle || "Read Full Article"}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ResistenciaAntimicrobiana() {
  const { locale } = useRouter();
  const router = useRouter();
  const { educational: content } = clientContent[locale as keyof typeof clientContent];

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [activeFilters, setActiveFilters] = useState({
    fullText: false,
    freeFullText: false,
    lastFiveYears: false,
    lastTenYears: false
  });
  const [appliedFilters, setAppliedFilters] = useState({
    fullText: false,
    freeFullText: false,
    lastFiveYears: false,
    lastTenYears: false
  });

  const [forumModalOpen, setForumModalOpen] = useState(false);
  const [forumTitle, setForumTitle] = useState("");
  const [forumText, setForumText] = useState("");
  const [forumTags, setForumTags] = useState("");
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [openLoginModal, setOpenLoginModal] = useAtom(openLoginModalAtom);
  const [pendingAction, setPendingAction] = useState<
    | { type: "addQuestion" }
    | null
  >(null);

  const user = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        return false
      }
      return failureCount < 3
    },
  });
  const isAuthenticated = !!user.data?.id;

  const page = Number((router.query.page as string) ?? 1) - 1;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(urlParams.entries());

    if (queryParams.searchQuery) {
      setSearchQuery(queryParams.searchQuery);
    }

    if (queryParams.sortBy) {
      setSortBy(queryParams.sortBy);
    }

    const newFilters = { ...activeFilters };
    if (queryParams.fullText) newFilters.fullText = queryParams.fullText === 'true';
    if (queryParams.freeFullText) newFilters.freeFullText = queryParams.freeFullText === 'true';
    if (queryParams.lastFiveYears) newFilters.lastFiveYears = queryParams.lastFiveYears === 'true';
    if (queryParams.lastTenYears) newFilters.lastTenYears = queryParams.lastTenYears === 'true';

    setActiveFilters(newFilters);
    setAppliedFilters(newFilters);
  }, []);

  const articlesQuery = api.educational.getArticles.useQuery(
    {
      limit: LIMIT,
      offset: page * LIMIT,
      searchQuery,
      sortBy: sortBy as "relevance" | "date",
      filters: appliedFilters
    },
    {
      keepPreviousData: true,
      enabled: true
    },
  );

  const tags = api.educational.getTags.useQuery();

  const updateUrlWithParams = (params = {}) => {
    const currentQuery = {
      ...(router.query as Record<string, unknown>),
      ...params
    };

    Object.keys(currentQuery).forEach((key: string) =>
      (currentQuery as Record<string, unknown>)[key] === undefined && delete (currentQuery as Record<string, unknown>)[key]
    );

    router.push({
      pathname: router.pathname,
      query: currentQuery
    }, undefined, { shallow: true });
  };

  const handleSearch = () => {
    updateUrlWithParams({
      searchQuery,
      page: 1
    });
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...activeFilters });
    updateUrlWithParams({
      fullText: activeFilters.fullText || undefined,
      freeFullText: activeFilters.freeFullText || undefined,
      lastFiveYears: activeFilters.lastFiveYears || undefined,
      lastTenYears: activeFilters.lastTenYears || undefined,
      page: 1
    });
  };

  const handleSortChange = (value: React.SetStateAction<string>) => {
    setSortBy(value);
    updateUrlWithParams({
      sortBy: value,
      page: 1
    });
  };

  const handleClickArticle = (doi: string) => {
    window.open(`https://doi.org/${doi}`, "_blank");
  };

  const handleFilterChange = (filter: keyof typeof activeFilters, value: boolean) => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  const handlePageChange = (direction: number) => {
    const newPage = page + direction + 1;
    if (newPage > 0) {
      updateUrlWithParams({ page: newPage });
    }
  };

  const handleOpenForumModal = (article: Article) => {
    if (!isAuthenticated) {
      setPendingAction({ type: "addQuestion" });
      setOpenLoginModal(true);
      return;
    }
    if (article && article.title) {
      setCurrentArticle(article);
      setForumModalOpen(true);
      setForumTitle(`Discussing: ${article.title.substring(0, 70)}${article.title.length > 70 ? '...' : ''}`);
    }
  };

  const send = api.educational.saveForumPost.useMutation({
    onSuccess: () => {
      toast({
        title: content.forumPosted,
      });
      setForumModalOpen(false);
      setForumTitle("");
      setForumText("");
      setForumTags("");
      setCurrentArticle(null);
    },
  });

  const handleSubmitForumPost = () => {
    if (currentArticle && 'id' in currentArticle && typeof currentArticle.id === 'string') {
      send.mutate({
        title: forumTitle,
        message: forumText,
        tags: forumTags.split(',').map(tag => tag.trim()).join(','),
        relatedArticle: currentArticle.id,
      });
    }
  };

  const topicQueryMap: Record<string, string> = {
    "resistance genes": '"resistance genes" OR "resistance determinants"',
    "whole genome sequencing": '"whole genome sequencing" OR WGS',
    "resistome analysis": '"resistome analysis" OR "resistome profiling"',
    "bioinformatics tools": '"bioinformatics tools" AND (resistance OR AMR)',
    "bioinformatics pipelines": '"analysis pipelines" AND (resistance OR AMR)',
    "metagenomics": 'metagenomics AND resistance',
    "genomic surveillance": '"genomic surveillance" AND resistance',
    "AMR databases": '"AMR databases" OR "resistance gene databases"'
  };

  const topicIcons: Record<string, JSX.Element> = {
    "resistance genes": <Dna className="w-6 h-6" />,
    "whole genome sequencing": <Microscope className="w-6 h-6" />,
    "resistome analysis": <FlaskConical className="w-6 h-6" />,
    "bioinformatics tools": <Computer className="w-6 h-6" />,
    "bioinformatics pipelines": <Workflow className="w-6 h-6" />,
    "metagenomics": <Biohazard className="w-6 h-6" />,
    "genomic surveillance": <Eye className="w-6 h-6" />,
    "AMR databases": <Database className="w-6 h-6" />
  };

  const navigateToForums = (article: Article) => {
    router.push(`/community?articleId=${article.id}`);
  };

  const articles = articlesQuery.data;
  const isLoading = articlesQuery.isLoading;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white py-24 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 bg-repeat"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-500/10 text-teal-300 text-sm font-medium mb-8 border border-teal-500/30 backdrop-blur-sm">
            <Book className="w-4 h-4 mr-2" />
            <span>{content.title}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-teal-200 to-cyan-200">
            {content.searchArticles}
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {content.searchArticlesDescription || "Access the latest scientific evidence, genomic data, and surveillance reports powered by direct PubMed integration."}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { icon: AlertCircle, text: content.latestResearch || "Latest Research" },
              { icon: Sparkles, text: content.newInsights || "Scientific Evidence" },
              { icon: Radar, text: content.resistanceRadar || "Genomic Data" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-200 text-sm backdrop-blur-md">
                <item.icon className="h-4 w-4 mr-2 text-teal-400" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-black min-h-screen">
        <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-20">

          <Card className="bg-white dark:bg-gray-900 shadow-2xl border-0 ring-1 ring-gray-200 dark:ring-gray-800 rounded-2xl mb-12">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-grow group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                    <Input
                      placeholder={content.searchArticles2 || "Search for genes, plasmids, antibiotics..."}
                      className="pl-12 h-14 text-lg bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-teal-500 rounded-xl transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSearch}
                      className="h-14 px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-500/25 transition-all text-lg"
                    >
                      {content.search || "Search"}
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-14 w-14 p-0 rounded-xl border-gray-200 dark:border-gray-800 hover:border-teal-500 hover:text-teal-600 bg-white dark:bg-gray-900">
                          <SlidersHorizontal className="h-6 w-6" />
                          {Object.values(appliedFilters).some(Boolean) && (
                            <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-teal-500 border-2 border-white dark:border-gray-900"></span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 border-gray-200 dark:border-gray-800 shadow-xl" align="end">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 rounded-t-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{content.filters || "Refine Results"}</h4>
                        </div>
                        <div className="p-4 space-y-4">
                          {/* Lista de Filtros */}
                          {[
                            { id: 'fullText', label: content.fullText || "Full Text Only", icon: FileText },
                            { id: 'freeFullText', label: content.freeFullText || "Free Full Text", icon: BookOpen },
                            { id: 'lastFiveYears', label: content.lastFiveYears || "Last 5 Years", icon: Clock },
                            { id: 'lastTenYears', label: content.lastTenYears || "Last 10 Years", icon: Clock },
                          ].map((filter) => (
                            <div key={filter.id} className="flex items-center justify-between">
                              <Label htmlFor={filter.id} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                                <filter.icon className="h-4 w-4 text-teal-500" />
                                {filter.label}
                              </Label>
                              <Switch
                                id={filter.id}
                                checked={activeFilters[filter.id as keyof typeof activeFilters]}
                                onCheckedChange={(checked) => handleFilterChange(filter.id as keyof typeof activeFilters, checked)}
                              />
                            </div>
                          ))}
                          <Button
                            className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                            onClick={handleApplyFilters}
                          >
                            {content.applyFilters || "Apply Filters"}
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium">{content.sortBy || "Sort by:"}</span>
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger className="w-[180px] h-9 bg-transparent border-0 ring-0 focus:ring-0 text-gray-900 dark:text-white font-bold pl-0 hover:text-teal-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">
                          <div className="flex items-center">
                            <TrendingUp className="mr-2 h-4 w-4 text-teal-500" />
                            {content.mostRelevant || "Most Relevant"}
                          </div>
                        </SelectItem>
                        <SelectItem value="date">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-teal-500" />
                            {content.mostRecent || "Most Recent"}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="hidden md:flex items-center gap-2 text-xs font-medium px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    PubMed Connected
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="artigos" className="w-full">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Book className="h-6 w-6 text-teal-500" />
                    {content.articles || "Research Articles"}
                  </h2>
                </div>

                <TabsContent value="artigos" className="mt-0 space-y-6">
                  {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <div className="flex gap-4 mb-4">
                          <Skeleton className="h-6 w-20 rounded-full" />
                          <Skeleton className="h-6 w-32 rounded-full" />
                        </div>
                        <Skeleton className="h-8 w-3/4 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3 mb-6" />
                        <div className="flex justify-between">
                          <Skeleton className="h-10 w-24" />
                          <Skeleton className="h-10 w-32" />
                        </div>
                      </div>
                    ))
                  ) : articles?.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full inline-block mb-4">
                        <AlertCircle className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{content.noResultsFound || "No results found"}</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {content.tryAnotherSearch || "Try adjusting your search terms or filters to find what you are looking for."}
                      </p>
                      <Button
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => {
                          setSearchQuery("");
                          setActiveFilters({ fullText: false, freeFullText: false, lastFiveYears: false, lastTenYears: false });
                          setAppliedFilters({ fullText: false, freeFullText: false, lastFiveYears: false, lastTenYears: false });
                          updateUrlWithParams({
                            searchQuery: undefined,
                            fullText: undefined,
                            freeFullText: undefined,
                            lastFiveYears: undefined,
                            lastTenYears: undefined,
                            page: 1
                          });
                        }}
                      >
                        {content.resetSearch || "Clear Filters"}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {articles?.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article as Article}
                          content={content}
                          handleOpenForumModal={handleOpenForumModal}
                          navigateToForums={navigateToForums}
                          handleClickArticle={handleClickArticle}
                        />
                      ))}
                    </div>
                  )}

                  {articles && articles.length > 0 && (
                    <div className="flex justify-center pt-8">
                      <div className="flex gap-2 bg-white dark:bg-gray-900 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                        <Button
                          variant="ghost"
                          disabled={page === 0}
                          onClick={() => handlePageChange(-1)}
                          className="hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/20"
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          {content.previous || "Previous"}
                        </Button>
                        <div className="flex items-center justify-center px-4 font-bold text-teal-600">
                          {page + 1}
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => handlePageChange(1)}
                          className="hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/20"
                        >
                          {content.next || "Next"}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-10 mt-8">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 bg-gradient-to-r from-teal-600 to-cyan-600">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Radar className="mr-2 h-5 w-5" />
                    {content.exploreResearchTopics || "Trending Topics"}
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 gap-3">
                  {[
                    "resistance genes",
                    "whole genome sequencing",
                    "resistome analysis",
                    "bioinformatics tools",
                    "bioinformatics pipelines",
                    "metagenomics",
                    "genomic surveillance",
                    "AMR databases"
                  ].map((topic, idx) => (
                    <button
                      key={idx}
                      className="group flex items-center p-3 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-transparent hover:border-teal-100 dark:hover:border-teal-800 transition-all text-left"
                      onClick={() => {
                        const mappedQuery = topicQueryMap[topic] || topic;
                        setSearchQuery(mappedQuery);
                        updateUrlWithParams({
                          searchQuery: mappedQuery,
                          page: 1
                        });
                      }}
                    >
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform mr-3">
                        {topicIcons[topic]}
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-teal-700 dark:group-hover:text-teal-300 capitalize">
                        {topic}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={forumModalOpen} onOpenChange={setForumModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{content.startCommunityTopic || "Start Discussion"}</DialogTitle>
              <DialogDescription className="text-teal-100">
                {content.createForumDescription || "Connect with other researchers about this article."}
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
                placeholder={content.topicTitlePlaceholder || "E.g., Methodology question about..."}
                className="h-11 border-gray-200 dark:border-gray-800 focus-visible:ring-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="forum-text" className="font-bold text-gray-700 dark:text-gray-300">{content.message || "Your Insights"}</Label>
              <Textarea
                id="forum-text"
                value={forumText}
                onChange={(e) => setForumText(e.target.value)}
                placeholder={content.shareThoughtsPlaceholder || "Share your analysis, doubts or findings..."}
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
                placeholder={content.tagsPlaceholder || "Add tags..."}
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
    </>
  );
}

ResistenciaAntimicrobiana.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};