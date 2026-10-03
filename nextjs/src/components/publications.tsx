import React, { useState, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    BookOpen,
    Download,
    Share2,
    MessageSquare,
    Clock,
    User,
    Plus,
    X,
    FileText,
    ExternalLink,
    Lock,
    Unlock,
    AlertCircle,
    CheckCircle,
    Upload,
    Trash2,
    Eye,
    Users,
} from "lucide-react";
import { formatUtcDate } from "@/utils/formart";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// ============ TIPOS ============

interface Publication {
    id: number;
    title: string;
    authors: string[];
    journal: string;
    year: number;
    volume?: string;
    issue?: string;
    pages?: string;
    doi: string;
    abstract: string;
    keywords: string[];
    publicationDate: string;
    submittedBy: string;
    submittedAt: string;
    updatedAt: string;
    accessType: "open" | "restricted" | "closed";
    pdfUrl?: string;
    pdfFileName?: string;
    pdfSize?: number;
    externalUrl?: string;
    comments: number;
    downloads: number;
    shares: number;
    views: number;
    userDownloaded?: boolean;
    tags: string[];
    pathogens?: string[];
    relatedTools?: number[];
    relatedDatabases?: number[];
    citationCount?: number;
    impactFactor?: number;
}


export const PublicationCard: React.FC<{
    publication: Publication;
    onDownload: (id: number) => void;
    onComment: (id: number) => void;
    onShare: (id: number) => void;
}> = ({ publication, onDownload, onComment, onShare }) => {
    const getAccessBadgeColor = (type: string) => {
        switch (type) {
            case "open":
                return "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200";
            case "restricted":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-200";
            case "closed":
                return "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-200";
        }
    };

    const getAccessIcon = (type: string) => {
        switch (type) {
            case "open":
                return <Unlock className="w-4 h-4 mr-1" />;
            case "restricted":
                return <AlertCircle className="w-4 h-4 mr-1" />;
            case "closed":
                return <Lock className="w-4 h-4 mr-1" />;
            default:
                return null;
        }
    };

    const getAccessLabel = (type: string) => {
        switch (type) {
            case "open":
                return "Open Access";
            case "restricted":
                return "Restricted";
            case "closed":
                return "Closed Access";
            default:
                return "Unknown";
        }
    };

    return (
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-600/20 dark:via-indigo-600/20 dark:to-purple-600/20 border-b border-blue-100/50 dark:border-blue-700/50">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-2">
                                {publication.title}
                            </CardTitle>
                        </div>

                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                            <p className="font-medium">
                                {publication.authors.join(", ")}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                                {publication.journal}
                                {publication.year && ` (${publication.year})`}
                                {publication.volume && ` • Vol. ${publication.volume}`}
                                {publication.issue && ` • Issue ${publication.issue}`}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge className={getAccessBadgeColor(publication.accessType)}>
                                {getAccessIcon(publication.accessType)}
                                {getAccessLabel(publication.accessType)}
                            </Badge>
                            {publication.pathogens?.map((pathogen) => (
                                <Badge
                                    key={pathogen}
                                    className="bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200 border-blue-200 dark:border-blue-600"
                                >
                                    {pathogen}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {publication.impactFactor && (
                        <div className="ml-4 text-right">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Impact Factor
                            </p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {publication.impactFactor.toFixed(2)}
                            </p>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-8">
                <Tabs defaultValue="abstract" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg p-1 mb-6">
                        <TabsTrigger
                            value="abstract"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white text-xs sm:text-sm"
                        >
                            <BookOpen className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Abstract</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="metadata"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white text-xs sm:text-sm"
                        >
                            <FileText className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Metadata</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="pdf"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white text-xs sm:text-sm"
                        >
                            <Download className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">PDF</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="stats"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white text-xs sm:text-sm"
                        >
                            <Eye className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Stats</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="abstract" className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                Abstract
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {publication.abstract}
                            </p>
                        </div>

                        {publication.keywords && publication.keywords.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                    Keywords
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {publication.keywords.map((keyword) => (
                                        <Badge
                                            key={keyword}
                                            className="bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-200"
                                        >
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="metadata" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                                    DOI
                                </p>
                                <a
                                    href={`https://doi.org/${publication.doi}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                                >
                                    {publication.doi}
                                </a>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                                    Publication Date
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                    {formatUtcDate(publication.publicationDate)}
                                </p>
                            </div>

                            {publication.pages && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                                        Pages
                                    </p>
                                    <p className="text-gray-900 dark:text-white">
                                        {publication.pages}
                                    </p>
                                </div>
                            )}

                            {publication.citationCount !== undefined && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                                        Citations
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {publication.citationCount}
                                    </p>
                                </div>
                            )}
                        </div>

                        {publication.tags && publication.tags.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                    Tags
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {publication.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="pdf" className="space-y-4">
                        {publication.pdfUrl ? (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {publication.pdfFileName || "Full Text PDF"}
                                            </p>
                                            {publication.pdfSize && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {(publication.pdfSize / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => onDownload(publication.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>

                                {publication.accessType === "closed" && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-3 rounded-lg flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            This article is from a closed-access journal. The author
                                            has shared this PDF for educational and research purposes.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    No PDF available for this publication
                                </p>
                                {publication.externalUrl && (
                                    <a
                                        href={publication.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-flex items-center gap-1"
                                    >
                                        View on external site <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                        <Eye className="w-5 h-5" />
                                        Views
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                                        {publication.views}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-green-800 dark:text-green-200 flex items-center gap-2">
                                        <Download className="w-5 h-5" />
                                        Downloads
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                                        {publication.downloads}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-purple-800 dark:text-purple-200 flex items-center gap-2">
                                        <Share2 className="w-5 h-5" />
                                        Shares
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                                        {publication.shares}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg text-orange-800 dark:text-orange-200 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        Comments
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                                        {publication.comments}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>

            <CardFooter className="bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback>
                                {publication.submittedBy.slice(0, 1)}
                            </AvatarFallback>
                        </Avatar>
                        <span>{publication.submittedBy}</span>
                    </div>
                    <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatUtcDate(publication.submittedAt)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {publication.pdfUrl && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownload(publication.id)}
                            className={`text-xs ${publication.userDownloaded
                                ? "bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            {publication.downloads}
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onComment(publication.id)}
                        className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span className="text-xs">{publication.comments}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onShare(publication.id)}
                        className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Share2 className="h-4 w-4 mr-1" />
                        <span className="text-xs">{publication.shares}</span>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

// ============ SUBMIT PUBLICATION MODAL ============

interface SubmitPublicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export const SubmitPublicationModal: React.FC<
    SubmitPublicationModalProps
> = ({ isOpen, onClose, onSubmit }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        authors: [] as string[],
        journal: "",
        year: new Date().getFullYear(),
        volume: "",
        issue: "",
        pages: "",
        doi: "",
        abstract: "",
        keywords: [] as string[],
        publicationDate: "",
        accessType: "open" as "open" | "restricted" | "closed",
        externalUrl: "",
        tags: [] as string[],
        pathogens: [] as string[],
    });

    const [currentAuthor, setCurrentAuthor] = useState("");
    const [currentKeyword, setCurrentKeyword] = useState("");
    const [currentTag, setCurrentTag] = useState("");
    const [currentPathogen, setCurrentPathogen] = useState("");

    const handleSubmit = () => {
        if (!formData.title.trim() || !formData.doi.trim()) {
            toast({
                title: "Error",
                description: "Title and DOI are required",
                variant: "destructive",
            });
            return;
        }

        if (formData.authors.length === 0) {
            toast({
                title: "Error",
                description: "At least one author is required",
                variant: "destructive",
            });
            return;
        }

        onSubmit({
            ...formData,
            pdf: uploadedFile,
        });

        // Reset form
        setFormData({
            title: "",
            authors: [],
            journal: "",
            year: new Date().getFullYear(),
            volume: "",
            issue: "",
            pages: "",
            doi: "",
            abstract: "",
            keywords: [],
            publicationDate: "",
            accessType: "open",
            externalUrl: "",
            tags: [],
            pathogens: [],
        });
        setUploadedFile(null);
        setUploadProgress(0);
        onClose();
    };

    const addAuthor = () => {
        if (currentAuthor.trim() && !formData.authors.includes(currentAuthor)) {
            setFormData({
                ...formData,
                authors: [...formData.authors, currentAuthor],
            });
            setCurrentAuthor("");
        }
    };

    const removeAuthor = (author: string) => {
        setFormData({
            ...formData,
            authors: formData.authors.filter((a) => a !== author),
        });
    };

    const addKeyword = () => {
        if (currentKeyword.trim() && !formData.keywords.includes(currentKeyword)) {
            setFormData({
                ...formData,
                keywords: [...formData.keywords, currentKeyword],
            });
            setCurrentKeyword("");
        }
    };

    const removeKeyword = (keyword: string) => {
        setFormData({
            ...formData,
            keywords: formData.keywords.filter((k) => k !== keyword),
        });
    };

    const addTag = () => {
        if (currentTag.trim() && !formData.tags.includes(currentTag)) {
            setFormData({
                ...formData,
                tags: [...formData.tags, currentTag],
            });
            setCurrentTag("");
        }
    };

    const removeTag = (tag: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter((t) => t !== tag),
        });
    };

    const addPathogen = () => {
        if (currentPathogen.trim() && !formData.pathogens.includes(currentPathogen)) {
            setFormData({
                ...formData,
                pathogens: [...formData.pathogens, currentPathogen],
            });
            setCurrentPathogen("");
        }
    };

    const removePathogen = (pathogen: string) => {
        setFormData({
            ...formData,
            pathogens: formData.pathogens.filter((p) => p !== pathogen),
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== "application/pdf") {
                toast({
                    title: "Error",
                    description: "Only PDF files are allowed",
                    variant: "destructive",
                });
                return;
            }

            if (file.size > 50 * 1024 * 1024) {
                toast({
                    title: "Error",
                    description: "File size must be less than 50MB",
                    variant: "destructive",
                });
                return;
            }

            setUploadedFile(file);
            // Simulate upload progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                }
                setUploadProgress(Math.min(progress, 100));
            }, 300);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Share a Publication</DialogTitle>
                    <DialogDescription>
                        Share your published research with the community. You can upload a
                        PDF if your article is from a closed-access journal.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Publication Information
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="Article title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="authors">Authors *</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="authors"
                                    placeholder="Add author name..."
                                    value={currentAuthor}
                                    onChange={(e) => setCurrentAuthor(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addAuthor();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addAuthor}
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.authors.map((author) => (
                                    <Badge key={author} variant="secondary">
                                        {author}
                                        <button
                                            onClick={() => removeAuthor(author)}
                                            className="ml-1 hover:text-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="journal">Journal</Label>
                                <Input
                                    id="journal"
                                    placeholder="e.g., Nature Microbiology"
                                    value={formData.journal}
                                    onChange={(e) =>
                                        setFormData({ ...formData, journal: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    placeholder="2024"
                                    value={formData.year}
                                    onChange={(e) =>
                                        setFormData({ ...formData, year: parseInt(e.target.value) })
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="volume">Volume</Label>
                                <Input
                                    id="volume"
                                    placeholder="e.g., 5"
                                    value={formData.volume}
                                    onChange={(e) =>
                                        setFormData({ ...formData, volume: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="issue">Issue</Label>
                                <Input
                                    id="issue"
                                    placeholder="e.g., 3"
                                    value={formData.issue}
                                    onChange={(e) =>
                                        setFormData({ ...formData, issue: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pages">Pages</Label>
                                <Input
                                    id="pages"
                                    placeholder="e.g., 123-145"
                                    value={formData.pages}
                                    onChange={(e) =>
                                        setFormData({ ...formData, pages: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="doi">DOI *</Label>
                            <Input
                                id="doi"
                                placeholder="10.1234/example.doi"
                                value={formData.doi}
                                onChange={(e) =>
                                    setFormData({ ...formData, doi: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Abstract & Keywords */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Content
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="abstract">Abstract</Label>
                            <Textarea
                                id="abstract"
                                placeholder="Article abstract..."
                                value={formData.abstract}
                                onChange={(e) =>
                                    setFormData({ ...formData, abstract: e.target.value })
                                }
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="keywords">Keywords</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="keywords"
                                    placeholder="Add a keyword..."
                                    value={currentKeyword}
                                    onChange={(e) => setCurrentKeyword(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addKeyword();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addKeyword}
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.keywords.map((keyword) => (
                                    <Badge key={keyword} variant="secondary">
                                        {keyword}
                                        <button
                                            onClick={() => removeKeyword(keyword)}
                                            className="ml-1 hover:text-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Access & PDF */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Access & PDF
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="access-type">Access Type</Label>
                            <Select
                                value={formData.accessType}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, accessType: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">
                                        <Unlock className="h-4 w-4 mr-2 inline" />
                                        Open Access
                                    </SelectItem>
                                    <SelectItem value="restricted">
                                        <AlertCircle className="h-4 w-4 mr-2 inline" />
                                        Restricted
                                    </SelectItem>
                                    <SelectItem value="closed">
                                        <Lock className="h-4 w-4 mr-2 inline" />
                                        Closed Access
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="external-url">External URL (optional)</Label>
                            <Input
                                id="external-url"
                                placeholder="https://..."
                                value={formData.externalUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, externalUrl: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Upload PDF (optional)</Label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    PDF up to 50MB
                                </p>
                            </div>

                            {uploadedFile && (
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                                {uploadedFile.name}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setUploadedFile(null);
                                                setUploadProgress(0);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {uploadProgress < 100 && (
                                        <Progress value={uploadProgress} className="h-2" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags & Pathogens */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Classification
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="tags"
                                    placeholder="Add a tag..."
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addTag();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addTag}
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary">
                                        {tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 hover:text-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pathogens">Pathogens Studied</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="pathogens"
                                    placeholder="Add a pathogen..."
                                    value={currentPathogen}
                                    onChange={(e) => setCurrentPathogen(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addPathogen();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addPathogen}
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.pathogens.map((pathogen) => (
                                    <Badge key={pathogen} className="bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200">
                                        {pathogen}
                                        <button
                                            onClick={() => removePathogen(pathogen)}
                                            className="ml-1 hover:text-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Share Publication
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export type { Publication };