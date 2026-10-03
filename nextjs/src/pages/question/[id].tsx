import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  MessageSquare,
  Tag,
  MessagesSquare,
  ChevronLeft,
  Bookmark,
  Share2,
  ChevronUp,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Send,
  Heart,
  Calendar,
  User,
  Clock,
  Filter,
  Copy,
  CheckCircle,
  Stethoscope,
  TrendingDown,
  BookOpen,
  Lightbulb,
  MapPin,
  FlaskConical,
  FileText,
  Zap,
  AlertCircle,
  ChevronRight,
  Award,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { clientContent } from "@/language/client";
import { api } from "@/utils/api";
import { formatUtcDate } from "@/utils/formart";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import DefaultLayout, { openLoginModalAtom } from "@/layout/default";
import { useAtom } from "jotai";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ContentType = 'clinical' | 'negative-result' | 'publication' | 'general';

export default function QuestionDetailModern() {
  const router = useRouter();
  const { id } = router.query;
  const { locale } = useRouter();
  const { question: content, community: communityContent } =
    clientContent[locale as keyof typeof clientContent];

  const user = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') return false;
      return failureCount < 3;
    },
  });
  const isAuthenticated = !!user.data?.id;

  const [commentText, setCommentText] = useState("");
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copySuccess, setCopySuccess] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useAtom(openLoginModalAtom);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [pendingAction, setPendingAction] = useState<
    | { type: "voteQuestion" }
    | { type: "voteComment"; commentId: number; userVoteStatus: boolean }
    | { type: "addAnswer" }
    | { type: "unvoteQuestion" }
    | { type: "unvoteComment"; commentId: number; userVoteStatus: boolean }
    | null
  >(null);

  const commentsPerPage = 5;

  const question = api.community.getQuestionById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  const comments = api.community.getQuestionComments.useQuery(
    {
      id: Number(id),
      limit: commentsPerPage,
      offset: (currentPage - 1) * commentsPerPage,
    },
    { enabled: !!id, keepPreviousData: true }
  );

  const voteQuestionMutation = api.community.voteQuestion.useMutation({
    onSuccess: () => {
      toast({
        title: content.voteAdded || "Voto adicionado",
        className: "bg-teal-100 border-teal-400 text-teal-800",
      });
      question.refetch();
    },
    onError: (error) => {
      toast({
        title: content.voteError || "Erro ao votar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unvoteQuestionMutation = api.community.unvoteQuestion.useMutation({
    onSuccess: () => {
      toast({
        title: content.voteRemoved || "Voto removido",
        className: "bg-gray-100 border-gray-400 text-gray-800",
      });
      question.refetch();
    },
    onError: (error) => {
      toast({
        title: content.unvoteError || "Erro ao remover voto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const voteCommentMutation = api.community.voteCommentQuestion.useMutation({
    onSuccess: () => {
      toast({
        title: content.commentVoteAdded || "Voto no comentário adicionado",
        className: "bg-teal-100 border-teal-400 text-teal-800",
      });
      comments.refetch();
    },
    onError: (error) => {
      toast({
        title: content.commentVoteError || "Erro ao votar no comentário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unvoteCommentMutation = api.community.unvoteCommentQuestion.useMutation({
    onSuccess: () => {
      toast({
        title: content.commentVoteRemoved || "Voto no comentário removido",
        className: "bg-gray-100 border-gray-400 text-gray-800",
      });
      comments.refetch();
    },
    onError: (error) => {
      toast({
        title: content.commentUnvoteError || "Erro ao remover voto do comentário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const postComment = api.community.saveQuestionComment.useMutation({
    onSuccess: () => {
      toast({
        title: content.commentPosted,
        className: "bg-teal-100 border-teal-400 text-teal-800",
      });
      setCommentModalOpen(false);
      setCommentText("");
      comments.refetch();
      question.refetch();
    },
    onError: (error) => {
      toast({
        title: content.commentPostError || "Erro ao postar comentário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markResolvedMutation = api.community.markQuestionAsResolved.useMutation({
    onSuccess: () => {
      toast({
        title: content.questionMarkedAsResolved || "Questão marcada como resolvida",
        className: "bg-green-100 border-green-400 text-green-800",
      });
      question.refetch();
    },
    onError: (error) => {
      toast({
        title: content.errorMarkingResolved || "Erro ao marcar como resolvida",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unmarkResolvedMutation = api.community.unmarkQuestionAsResolved.useMutation({
    onSuccess: () => {
      toast({
        title: content.questionUnmarked || "Questão desmarcada",
        className: "bg-gray-100 border-gray-400 text-gray-800",
      });
      question.refetch();
    },
    onError: (error) => {
      toast({
        title: content.errorUnmarking || "Erro ao desmarcar questão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteQuestionMutation = api.community.deleteQuestion.useMutation({
    onSuccess: () => {
      toast({
        title: content.questionDeleted,
        className: "bg-emerald-100 border-emerald-400 text-emerald-800",
      });
      router.push("/community");
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir tópico",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = api.community.deleteCommentQuestion.useMutation({
    onSuccess: () => {
      toast({
        title: content.commentDeleted,
        className: "bg-emerald-100 border-emerald-400 text-emerald-800",
      });
      comments.refetch();
      question.refetch();
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir comentário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const qData = question.data;
  const typeInfo = getContentTypeInfo(qData?.question.type as ContentType);

  const { data: image } = api.community.getImage.useQuery(
    { id: Number(id) },
    { enabled: !!qData?.question?.id }
  );

  useEffect(() => {
    if (isAuthenticated && pendingAction) {
      if (pendingAction.type === "voteQuestion") {
        const currentVoteStatus = question.data?.userVoteStatus;
        if (currentVoteStatus) {
          unvoteQuestionMutation.mutate({ id: Number(id) });
        } else {
          voteQuestionMutation.mutate({ id: Number(id) });
        }
      } else if (pendingAction.type === "voteComment") {
        const { commentId, userVoteStatus } = pendingAction;
        if (userVoteStatus) {
          unvoteCommentMutation.mutate({ id: Number(id), idComment: commentId });
        } else {
          voteCommentMutation.mutate({ id: Number(id), idComment: commentId });
        }
      } else if (pendingAction.type === "unvoteComment") {
        const { commentId } = pendingAction;
        unvoteCommentMutation.mutate({ id: Number(id), idComment: commentId });
      } else if (pendingAction.type === "addAnswer") {
        setCommentModalOpen(true);
      }
      setPendingAction(null);
    }
  }, [isAuthenticated, pendingAction, question.data?.userVoteStatus]);

  const handleVoteQuestion = () => {
    if (!isAuthenticated) {
      setPendingAction({ type: "voteQuestion" });
      setOpenLoginModal(true);
      return;
    }
    console.log(question.data?.userVoteStatus);
    if (question.data?.userVoteStatus) {
      unvoteQuestionMutation.mutate({ id: Number(id) });
    } else {
      voteQuestionMutation.mutate({ id: Number(id) });
    }
  };

  const handleVoteComment = (commentId: number, userVoteStatus: boolean) => {
    if (!isAuthenticated) {
      setPendingAction({ type: "voteComment", commentId, userVoteStatus });
      setOpenLoginModal(true);
      return;
    }

    if (!id) return;
    if (userVoteStatus) {
      unvoteCommentMutation.mutate({ id: Number(id), idComment: commentId });
    } else {
      voteCommentMutation.mutate({ id: Number(id), idComment: commentId });
    }
  };

  const handleUnvoteComment = (commentId: number, userVoteStatus: boolean) => {
    if (!isAuthenticated) {
      setPendingAction({ type: "unvoteComment", commentId, userVoteStatus });
      setOpenLoginModal(true);
      return;
    }

    if (!id) return;
    unvoteCommentMutation.mutate({ id: Number(id), idComment: commentId });
  };

  const handleAddAnswer = () => {
    if (!isAuthenticated) {
      setPendingAction({ type: "addAnswer" });
      setOpenLoginModal(true);
      return;
    }
    setCommentModalOpen(true);
  };

  const handlePostComment = () => {
    if (!isAuthenticated) {
      setPendingAction({ type: "addAnswer" });
      setOpenLoginModal(true);
      return;
    }

    if (!commentText.trim() || !id) {
      toast({
        title: content.emptyComment || "Comentário não pode estar vazio",
        variant: "destructive",
      });
      return;
    }
    postComment.mutate({
      id: Number(id),
      message: commentText,
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    toast({
      title: content.linkCopiedToClipboard || "Link copiado!",
      className: "bg-teal-100 border-teal-400 text-teal-800",
    });
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleMarkResolved = () => {
    if (!isAuthenticated) {
      setOpenLoginModal(true);
      return;
    }

    if (!id) return;

    const currentResolved = question.data?.question.resolved === 'yes';
    if (currentResolved) {
      unmarkResolvedMutation.mutate({ id: Number(id) });
    } else {
      markResolvedMutation.mutate({ id: Number(id) });
    }
  };

  const handleDeleteQuestion = () => {
    if (!isAuthenticated || qData?.question.idUser !== user.data?.id || !qData?.question.id) {
      return;
    }

    if (!window.confirm("Tem certeza que deseja excluir este tópico?")) {
      return;
    }

    deleteQuestionMutation.mutate({ id: qData.question.id });
  };

  const handleDeleteComment = (commentId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este comentário?")) {
      return;
    }

    deleteCommentMutation.mutate({ id: commentId });
  };

  const handleLoadMoreComments = () => {
    setCurrentPage((prev) => prev + 1);
  };

  if (question.isLoading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-slate-900 to-slate-900 text-white py-20 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/community" className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors group">
            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            {content.backToCommunity || "Voltar para Comunidade"}
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-white/20 backdrop-blur-md text-white border-0 px-3 py-1 flex items-center gap-2">
                  {typeInfo.icon}
                  {typeInfo.label}
                </Badge>
                {qData?.question.resolved === 'yes' && (
                  <Badge className="bg-green-500 text-white border-0 px-3 py-1 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {communityContent.resolved}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                {qData?.question.question}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  {qData?.user?.name && (
                    <div className="flex items-center mt-2">
                      <Link href={`/user/${qData?.user?.id}`} className="flex items-center hover:opacity-80 transition-opacity">
                        <Avatar className="h-8 w-8 mr-2 ring-2 ring-white dark:ring-teal-900">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${qData?.user?.name} ${qData?.user?.lastName}`} />
                          <AvatarFallback className="bg-gradient-to-br from-teal-400 to-green-600 text-white text-xs">
                            {qData?.user?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-white-700 dark:text-gray-300">
                          {qData?.user?.name} {qData?.user?.lastName}
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {qData?.question.createdAt && formatUtcDate(qData.question.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {qData?.question.idUser === user.data?.id && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleMarkResolved}
                        variant="outline"
                        className={cn(
                          "bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white h-12 w-12 p-0 rounded-xl",
                          qData?.question.resolved === 'yes' && "bg-green-500 hover:bg-green-600 border-0"
                        )}
                        disabled={markResolvedMutation.isLoading || unmarkResolvedMutation.isLoading}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {qData?.question.resolved === "yes"
                          ? content.unmarkAsResolved || "Desmarcar como Resolvida"
                          : content.markAsResolved || "Marcar como Resolvida"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {qData?.question.idUser === user.data?.id && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleDeleteQuestion}
                        variant="outline"
                        className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-red-500/20 text-white h-12 w-12 p-0 rounded-xl"
                        disabled={deleteQuestionMutation.isLoading}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir tópico</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                onClick={handleVoteQuestion}
                variant="outline"
                className={cn("bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white gap-2 h-12 px-6 rounded-xl", qData?.userVoteStatus && "bg-white text-teal-600 hover:bg-white/90 border-0")}
                disabled={voteQuestionMutation.isLoading || unvoteQuestionMutation.isLoading}
              >
                <Heart className={cn("w-5 h-5", qData?.userVoteStatus && "fill-current")} />
                <span className="font-bold">{qData?.votes || 0}</span>
              </Button>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white h-12 w-12 p-0 rounded-xl"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-black min-h-screen -mt-8 rounded-t-[32px] relative z-20 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 space-y-8">
              <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="prose prose-teal dark:prose-invert max-w-none">
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {qData?.question.description}
                    </p>
                  </div>

                  <AnimatePresence>
                    {qData?.question.type === 'clinical' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                          <p className="text-xs font-bold text-blue-600 uppercase mb-1">{communityContent.healthcareUnit}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> {qData?.question.clinicalUnit || "N/A"}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                          <p className="text-xs font-bold text-blue-600 uppercase mb-1">{communityContent.region}</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{qData?.question.region || "N/A"}</p>
                        </div>
                        {qData?.question.additionalInfo && (
                          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 md:col-span-2">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{communityContent.additionalInfo}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{qData.question.additionalInfo}</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {qData?.question.type === 'negative-result' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                            <p className="text-xs font-bold text-red-600 uppercase mb-1">{communityContent.studyType}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{qData?.question.studyType || "N/A"}</p>
                          </div>
                          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                            <p className="text-xs font-bold text-red-600 uppercase mb-1">{communityContent.sampleSize}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{qData?.question.sampleSize || "N/A"}</p>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">{communityContent.workingHipothesis}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{qData?.question.workingHipothesis || "N/A"}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">{communityContent.conclusions}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{qData?.question.conclusions || "N/A"}</p>
                        </div>
                      </motion.div>
                    )}

                    {qData?.question.type === 'publication' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
                        <div className="p-6 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-100 dark:border-purple-900/30">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-purple-600 text-white">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-purple-900 dark:text-purple-100">{qData?.question.journal || "Journal N/A"}</h4>
                              <p className="text-sm text-purple-700 dark:text-purple-300">{qData?.question.authors || "Autores N/A"}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <Badge variant="outline" className="border-purple-200 text-purple-700">{communityContent.year}: {qData?.question.year || "N/A"}</Badge>
                                {qData?.question.doi && (
                                  <a href={`https://doi.org/${qData.question.doi}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1">
                                    DOI: {qData.question.doi} <Share2 className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {qData?.question.abstract && (
                          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Abstract</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">{qData.question.abstract}</p>
                          </div>
                        )}
                        {(qData?.question.scope || qData?.question.targetAudience) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {qData?.question.scope && (
                              <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-1">
                                  <Zap className="w-3 h-3" /> {communityContent.scope}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {qData.question.scope}
                                </p>
                              </div>
                            )}
                            {qData?.question.targetAudience && (
                              <div className="p-5 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                                <p className="text-xs font-bold text-green-600 uppercase mb-2 flex items-center gap-1">
                                  <User className="w-3 h-3" /> {communityContent.targetAudience}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {qData.question.targetAudience}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {qData?.question.conclusions && (
                          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                            <p className="text-xs font-bold text-amber-600 uppercase mb-2 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" /> {communityContent.conclusions}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {qData.question.conclusions}
                            </p>
                          </div>
                        )}

                        {image?.link && (
                          <img
                            src={image.link}
                            alt="Graphical Abstract"
                            className="w-full h-auto object-contain max-h-[500px] mx-auto"
                            onError={(e) => {
                              console.error("Erro ao carregar imagem:", e);
                            }}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-10 flex flex-wrap gap-2">
                    {qData?.tags?.map((tag: any) => (
                      <Badge key={tag.id} variant="secondary" className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-800/40 transition-colors px-3 py-1 rounded-lg border-0">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <MessagesSquare className="text-teal-600" />
                    {content.answers || "Respostas"} ({qData?.answers || 0})
                  </h3>
                  <Button onClick={handleAddAnswer} className="bg-gradient-to-r from-teal-600 to-green-500 hover:from-teal-700 hover:to-green-600 text-white rounded-xl">
                    <Send className="w-4 h-4 mr-2" />
                    {content.addAnswer || "Responder"}
                  </Button>
                </div>

                <Separator className="bg-teal-100 dark:bg-teal-900/50" />

                {comments.isLoading && (
                  <div className="py-8">
                    <div className="animate-pulse space-y-6">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex gap-4">
                          <div className="h-10 w-10 rounded-full bg-teal-200 dark:bg-teal-700"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-teal-200 dark:bg-teal-700 rounded w-1/4"></div>
                            <div className="h-3 bg-teal-200 dark:bg-teal-700 rounded w-1/6"></div>
                            <div className="h-16 bg-teal-200 dark:bg-teal-700 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {comments.isError && (
                  <div className="text-center text-red-500 py-8">
                    {content.errorLoadingComments}
                  </div>
                )}

                {comments.data?.comments && comments.data.comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.data.comments.map((comment: any, index: number) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="border-2 border-teal-100 dark:border-teal-900/50 hover:border-teal-200 dark:hover:border-teal-800 transition-all rounded-2xl overflow-hidden bg-teal-50 dark:bg-teal-900/20">
                          <CardContent className="p-6">
                            <div className="grid grid-cols-[auto_1fr] gap-4">
                              <div className="flex flex-col items-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "rounded-full h-8 w-8 p-0 flex items-center justify-center",
                                    comment.userVoteStatus
                                      ? "text-teal-600 dark:text-teal-300 bg-teal-100 dark:bg-teal-800"
                                      : "text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-800"
                                  )}
                                  onClick={() => handleVoteComment(comment.id, comment.userVoteStatus)}
                                  disabled={voteCommentMutation.isLoading || unvoteCommentMutation.isLoading}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <span className={cn(
                                  "text-sm font-medium",
                                  comment.userVoteStatus
                                    ? "text-teal-600 dark:text-teal-300"
                                    : "text-gray-500 dark:text-gray-400"
                                )}>
                                  {comment.votes || 0}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "rounded-full h-8 w-8 p-0 flex items-center justify-center",
                                    "text-gray-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-800"
                                  )}
                                  onClick={() => handleUnvoteComment(comment.id, comment.userVoteStatus)}
                                  disabled={unvoteCommentMutation.isLoading || voteCommentMutation.isLoading}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <div className="flex-1">
                                    {comment.authorName && (
                                      <div className="flex items-center mt-2">
                                        <Link href={`/user/${comment.authorId}`} className="flex items-center hover:opacity-80 transition-opacity">
                                          <Avatar className="h-8 w-8 mr-2 ring-2 ring-white dark:ring-teal-900">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorName} ${comment.authorLastName}`} />
                                            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-green-600 text-white text-xs">
                                              {comment.authorName?.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {comment.authorName} {comment.authorLastName}
                                          </span>
                                        </Link>
                                      </div>
                                    )}
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                                      <Clock className="mr-1 h-3 w-3" />
                                      {formatUtcDate(comment.createdAt)}
                                    </div>
                                  </div>
                                  {comment.authorId === user.data?.id && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                      disabled={deleteCommentMutation.isLoading}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>

                                <div className="prose dark:prose-invert prose-sm max-w-none mt-2">
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {comment.comment}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}

                    {comments.data.hasMore && (
                      <div className="text-center mt-6">
                        <Button
                          variant="outline"
                          onClick={handleLoadMoreComments}
                          disabled={comments.isFetching}
                          className="bg-white hover:bg-teal-50 dark:bg-gray-800 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/50 font-medium rounded-lg px-6"
                        >
                          {comments.isFetching
                            ? content.loadingMoreComments || "Carregando..."
                            : content.loadMoreAnswers || "Carregar Mais Respostas"}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-teal-100 dark:bg-teal-900 mb-4">
                      <MessagesSquare className="h-8 w-8 text-teal-400 dark:text-teal-500" />
                    </div>
                    <h3 className="text-lg font-medium text-teal-900 dark:text-teal-100 mb-2">
                      {content.noAnswersYet || "Nenhuma resposta ainda"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {content.beTheFirstToShareYourKnowledgeAndHelpOthersWithThisQuestion || "Seja o primeiro a compartilhar seu conhecimento e ajudar outros com esta questão"}
                    </p>
                    <Button
                      onClick={handleAddAnswer}
                      className="bg-gradient-to-r from-teal-600 to-green-500 hover:from-teal-700 hover:to-green-600 text-white rounded-lg px-6"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {content.addAnswer || "Adicionar Resposta"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Award className="text-teal-600" size={18} />
                    {content.statistics || "Estatísticas"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{content.votesCount}</span>
                    <span className="text-sm font-bold text-teal-600">{qData?.votes || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{content.answersCount}</span>
                    <span className="text-sm font-bold">{qData?.answers || 0}</span>
                  </div>
                  <Separator />
                  <div className="pt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-3">{content.share}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={handleCopyLink}>
                        <Copy className="w-4 h-4 mr-2" /> Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl overflow-hidden bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
                <CardContent className="p-6">
                  <Zap className="w-8 h-8 mb-4 text-teal-200" />
                  <h4 className="font-bold text-lg mb-2">{content.communityTip}</h4>
                  <p className="text-sm text-teal-50/80 leading-relaxed">
                    {content.communityTipDescription}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={commentModalOpen} onOpenChange={setCommentModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <MessageSquare className="text-teal-600" />
              {content.addAnswer || "Sua Resposta"}
            </DialogTitle>
            <DialogDescription>
              {content.commentDescription || "Compartilhe seu conhecimento com a comunidade."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={content.commentPlaceholder || "Escreva aqui sua resposta detalhada..."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[150px] rounded-2xl border-2 border-gray-100 focus:border-teal-500 transition-all"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCommentModalOpen(false)} className="rounded-xl">
              {content.cancel || "Cancelar"}
            </Button>
            <Button
              onClick={handlePostComment}
              disabled={postComment.isLoading}
              className="bg-gradient-to-r from-teal-600 to-green-500 hover:from-teal-700 hover:to-green-600 text-white rounded-xl px-8"
            >
              {postComment.isLoading ? "Publicando..." : (content.postComment || "Publicar Resposta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}

const getContentTypeInfo = (type: ContentType) => {
  const router = useRouter();
  const { locale } = useRouter();
  const { question: content, community: communityContent } =
    clientContent[locale as keyof typeof clientContent];
  const info: Record<ContentType, { icon: React.ReactNode; color: string; label: string; bgColor: string; gradient: string }> = {
    clinical: {
      icon: <Stethoscope className="w-6 h-6" />,
      color: "text-blue-600",
      label: communityContent.tabs.clinical,
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      gradient: "from-blue-600 to-cyan-500"
    },
    'negative-result': {
      icon: <TrendingDown className="w-6 h-6" />,
      color: "text-red-600",
      label: communityContent.tabs.negativeResults,
      bgColor: "bg-red-50 dark:bg-red-950/20",
      gradient: "from-red-600 to-orange-500"
    },
    publication: {
      icon: <BookOpen className="w-6 h-6" />,
      color: "text-purple-600",
      label: communityContent.tabs.publications,
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      gradient: "from-purple-600 to-pink-500"
    },
    general: {
      icon: <Lightbulb className="w-6 h-6" />,
      color: "text-amber-600",
      label: communityContent.tabs.general,
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      gradient: "from-amber-600 to-yellow-500"
    }
  };
  return info[type] || info.general;
};