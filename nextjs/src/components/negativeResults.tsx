import React, { useState } from "react";
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
    ThumbsDown,
    MessageSquare,
    Share2,
    Clock,
    User,
    AlertCircle,
    Plus,
    X,
    TrendingDown,
    Lightbulb,
    BookOpen,
    CheckCircle,
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


interface NegativeResult {
    id: number;
    title: string;
    description: string;
    hypothesis: string;
    methodology: string;
    expectedOutcome: string;
    actualOutcome: string;
    conclusion: string;
    author: string;
    institution: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    pathogens?: string[];
    methodology_type: "In Vitro" | "In Vivo" | "Computational" | "Clinical" | "Other";
    sample_size?: number;
    duration?: string;
    reactions: number;
    comments: number;
    shares: number;
    userReaction?: "helpful" | "interesting" | "surprising" | null;
    doi?: string;
    relatedPublications?: string[];
}


export const NegativeResultCard: React.FC<{
    result: NegativeResult;
    onReact: (id: number, reaction: string) => void;
    onComment: (id: number) => void;
    onShare: (id: number) => void;
}> = ({ result, onReact, onComment, onShare }) => {
    const reactionOptions = ["helpful", "interesting", "surprising"];

    return (
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 dark:from-red-600/20 dark:via-orange-600/20 dark:to-amber-600/20 border-b border-red-100/50 dark:border-red-700/50">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                {result.title}
                            </CardTitle>
                        </div>
                        <CardDescription className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-3">
                            {result.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200 border-red-200 dark:border-red-600">
                                {result.methodology_type}
                            </Badge>
                            {result.pathogens?.map((pathogen) => (
                                <Badge
                                    key={pathogen}
                                    className="bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-200 border-orange-200 dark:border-orange-600"
                                >
                                    {pathogen}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-8">
                <Tabs defaultValue="hypothesis" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-gray-50/80 dark:bg-gray-800/80 rounded-lg p-1 mb-6">
                        <TabsTrigger
                            value="hypothesis"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white text-xs sm:text-sm"
                        >
                            <Lightbulb className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Hypothesis</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="methodology"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white text-xs sm:text-sm"
                        >
                            <BookOpen className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Methods</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="expected"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white text-xs sm:text-sm"
                        >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Expected</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="actual"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white text-xs sm:text-sm"
                        >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Actual</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="conclusion"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white text-xs sm:text-sm"
                        >
                            <Lightbulb className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Conclusion</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="hypothesis" className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Research Hypothesis
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {result.hypothesis}
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="methodology" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {result.sample_size && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        Sample Size
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {result.sample_size}
                                    </p>
                                </div>
                            )}
                            {result.duration && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        Duration
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {result.duration}
                                    </p>
                                </div>
                            )}
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    Type
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {result.methodology_type}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Methodology
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {result.methodology}
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="expected" className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Expected Outcome
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {result.expectedOutcome}
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="actual" className="space-y-4">
                        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-700">
                            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Actual Outcome (Negative Result)
                            </h4>
                            <p className="text-red-700 dark:text-red-300 leading-relaxed">
                                {result.actualOutcome}
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="conclusion" className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                Conclusion & Insights
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {result.conclusion}
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                {result.tags && result.tags.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                            Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {result.tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 px-3 py-1"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback>{result.author.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        <span>{result.author}</span>
                    </div>
                    <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatUtcDate(result.createdAt)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {reactionOptions.map((reaction) => (
                            <Button
                                key={reaction}
                                variant="ghost"
                                size="sm"
                                onClick={() => onReact(result.id, reaction)}
                                className={`text-xs ${result.userReaction === reaction
                                    ? "bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                            >
                                {reaction === "helpful" && "👍"}
                                {reaction === "interesting" && "🔍"}
                                {reaction === "surprising" && "😮"}
                                <span className="ml-1 text-xs">{result.reactions}</span>
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onComment(result.id)}
                        className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span className="text-xs">{result.comments}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onShare(result.id)}
                        className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Share2 className="h-4 w-4 mr-1" />
                        <span className="text-xs">{result.shares}</span>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

// ============ SUBMIT NEGATIVE RESULT MODAL ============

interface SubmitNegativeResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export const SubmitNegativeResultModal: React.FC<
    SubmitNegativeResultModalProps
> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        hypothesis: "",
        methodology: "",
        expectedOutcome: "",
        actualOutcome: "",
        conclusion: "",
        methodology_type: "In Vitro" as const,
        sample_size: "",
        duration: "",
        tags: [] as string[],
        pathogens: [] as string[],
        doi: "",
    });

    const [currentTag, setCurrentTag] = useState("");
    const [currentPathogen, setCurrentPathogen] = useState("");

    const handleSubmit = () => {
        if (!formData.title.trim() || !formData.hypothesis.trim()) {
            toast({
                title: "Error",
                description: "Title and hypothesis are required",
                variant: "destructive",
            });
            return;
        }

        onSubmit({
            ...formData,
            sample_size: formData.sample_size ? parseInt(formData.sample_size) : null,
        });

        setFormData({
            title: "",
            description: "",
            hypothesis: "",
            methodology: "",
            expectedOutcome: "",
            actualOutcome: "",
            conclusion: "",
            methodology_type: "In Vitro",
            sample_size: "",
            duration: "",
            tags: [],
            pathogens: [],
            doi: "",
        });
        onClose();
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Share a Negative Result</DialogTitle>
                    <DialogDescription>
                        Help the community avoid dead ends by sharing your negative research
                        results
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Basic Information
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Ineffectiveness of X treatment for Y pathogen"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Short Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief summary of what you tested..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Methodology */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Methodology
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="methodology-type">Study Type</Label>
                            <Select
                                value={formData.methodology_type}
                                onValueChange={(value: any) =>
                                    setFormData({ ...formData, methodology_type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="In Vitro">In Vitro</SelectItem>
                                    <SelectItem value="In Vivo">In Vivo</SelectItem>
                                    <SelectItem value="Computational">Computational</SelectItem>
                                    <SelectItem value="Clinical">Clinical</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sample-size">Sample Size (if applicable)</Label>
                                <Input
                                    id="sample-size"
                                    type="number"
                                    placeholder="e.g., 50"
                                    value={formData.sample_size}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sample_size: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="duration">Study Duration</Label>
                                <Input
                                    id="duration"
                                    placeholder="e.g., 6 months"
                                    value={formData.duration}
                                    onChange={(e) =>
                                        setFormData({ ...formData, duration: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hypothesis">Hypothesis *</Label>
                            <Textarea
                                id="hypothesis"
                                placeholder="What did you hypothesize?"
                                value={formData.hypothesis}
                                onChange={(e) =>
                                    setFormData({ ...formData, hypothesis: e.target.value })
                                }
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="methodology">Detailed Methodology</Label>
                            <Textarea
                                id="methodology"
                                placeholder="Describe your methods in detail..."
                                value={formData.methodology}
                                onChange={(e) =>
                                    setFormData({ ...formData, methodology: e.target.value })
                                }
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Results */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            Results
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="expected">Expected Outcome</Label>
                            <Textarea
                                id="expected"
                                placeholder="What did you expect to find?"
                                value={formData.expectedOutcome}
                                onChange={(e) =>
                                    setFormData({ ...formData, expectedOutcome: e.target.value })
                                }
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="actual">Actual Outcome (Negative Result)</Label>
                            <Textarea
                                id="actual"
                                placeholder="What actually happened? Why is this a negative result?"
                                value={formData.actualOutcome}
                                onChange={(e) =>
                                    setFormData({ ...formData, actualOutcome: e.target.value })
                                }
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="conclusion">Conclusion & Insights</Label>
                            <Textarea
                                id="conclusion"
                                placeholder="What did you learn? What should others know?"
                                value={formData.conclusion}
                                onChange={(e) =>
                                    setFormData({ ...formData, conclusion: e.target.value })
                                }
                                rows={3}
                            />
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
                                    <Badge key={pathogen} className="bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200">
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

                        <div className="space-y-2">
                            <Label htmlFor="doi">DOI (optional)</Label>
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
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        Share Negative Result
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export type { NegativeResult };