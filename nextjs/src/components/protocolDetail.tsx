import {
  ExternalLink,
  Share2,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Zap,
  MessageCircleQuestion,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/router"
import { clientContent } from "@/language/client"
import { api } from "@/utils/api"
import { getCategoryLabel } from "@/config/categoryConfig";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface ProtocolDetailProps {
  protocol: {
    id: number
    title: string
    category: string
    description: string
    authors: string
    institution: string
    date: string
    tags: string[]
    citations: number
    doi?: {
      type: "doi" | "url" | "text"
      value: string
    }[]
    document?: string
    protocolType?: "routine" | "first-choice" | "alternative"
    createdBy?: string
    idUser?: number
  }
  isOpen: boolean
  onClose: () => void
  onDeleted?: () => void
}

export default function ProtocolDetail({
  protocol,
  isOpen,
  onClose,
  onDeleted,
}: ProtocolDetailProps) {
  const { locale } = useRouter()
  const { protocols: content } =
    clientContent[locale as keyof typeof clientContent] ??
    clientContent["en-us"]

  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const user = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: false,
  })

  const deleteProtocol = api.protocol.deleteProtocol.useMutation({
    onSuccess: () => {
      toast({ title: content.detail.deleted })
      onDeleted?.()
      onClose()
    },
    onError: (error) => {
      toast({ title: content.detail.deleteError || "Erro ao excluir protocolo", description: error.message, variant: "destructive" })
    },
  })

  const handleCopyDOI = (doi: string) => {
    navigator.clipboard.writeText(`https://doi.org/${doi}`)
    setCopied(true)
    toast({ title: content.detail.copied })
    setTimeout(() => setCopied(false), 2000)
  }

  const image = api.protocol.getProtocolImage.useMutation({
    onSuccess: (data) => {
      if (typeof data.link === "string") {
        const link = document.createElement("a")
        link.href = data.link
        link.target = "_blank"
        link.rel = "noopener noreferrer"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
  })

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

  const handleView = (id: number) => {
    image.mutate({ id })
  }

  const handleDelete = () => {
    if (!protocol.idUser || protocol.idUser !== user.data?.id) return
    if (!window.confirm(content.detail.deleteConfirm)) return
    deleteProtocol.mutate({ id: protocol.id })
  }

  const protocolTypeStyle = getProtocolTypeStyle(protocol.protocolType);
  const ProtocolTypeIcon = protocolTypeStyle?.icon;

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-2xl pr-8">
                {protocol.title}
              </DialogTitle>
              {protocol.idUser && protocol.idUser === user.data?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteProtocol.isLoading}
                  className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

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

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">
                  {content.detail.category}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {getCategoryLabel(protocol.category, content)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">
                  {content.detail.published}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {protocol.date}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">
                  {content.detail.institution}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {protocol.institution}
                </p>
              </div>

              {protocol.protocolType && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">
                    {content.protocolType}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border w-fit mt-1 ${protocolTypeStyle?.color}`}>
                        <ProtocolTypeIcon className="w-3.5 h-3.5" />
                        {protocolTypeStyle?.label}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p>{protocolTypeStyle?.description}</p></TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {content.detail.overview}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {protocol.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {content.detail.authors}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {protocol.authors}
              </p>
            </div>

            {protocol.doi &&
              protocol.doi.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {content.detail.linkedResearch}
                  </h3>

                  <div className="space-y-3">
                    {protocol.doi.map((ref, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 uppercase">
                            {ref.type === "doi"
                              ? "DOI"
                              : ref.type === "url"
                                ? "URL"
                                : content.detail.reference}
                          </p>

                          {ref.type === "doi" && (
                            <a
                              href={`https://doi.org/${ref.value}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-purple-600 dark:text-purple-400 hover:underline break-all flex items-center gap-1"
                            >
                              doi.org/{ref.value}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {ref.type === "url" && (
                            <a
                              href={ref.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-purple-600 dark:text-purple-400 hover:underline break-all flex items-center gap-1"
                            >
                              {ref.value}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {ref.type === "text" && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {ref.value}
                            </p>
                          )}
                        </div>

                        {ref.type === "doi" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCopyDOI(ref.value)
                            }
                          >
                            {copied ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {protocol.citations}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {content.detail.citations}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {protocol.tags.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {content.detail.tags}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {content.detail.keywords}
              </h3>
              <div className="flex flex-wrap gap-2">
                {protocol.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              {protocol.document && (
                <Button
                  variant="outline"
                  onClick={() => handleView(protocol.id)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {content.detail.downloadPDF}
                </Button>
              )}

              <Button
                onClick={onClose}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {content.detail.close}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}