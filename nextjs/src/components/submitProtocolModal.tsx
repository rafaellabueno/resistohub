import { useState } from "react"
import { X, Plus, Trash2, AlertCircle, Upload, Clock, ShieldCheck, Building2, FileText, CheckCircle2, Zap, MessageCircleQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/router"
import { clientContent } from "@/language/client"
import { api } from "@/utils/api"
import { getCategoriesWithLabels } from "@/config/categoryConfig";

interface SubmitProtocolModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  title: string
  category: string
  description: string
  validation: string
  estimatedTime: string
  file: File | null
  references: Array<{ type: "doi" | "url" | "text"; value: string }>
  authors: string
  institution: string
  tags: string[]
  tagInput: string
  materials: string
  methodology: string
  troubleshooting: string
  protocolType: "routine" | "first-choice" | "alternative"
}


export default function SubmitProtocolModal({ isOpen, onClose }: SubmitProtocolModalProps) {
  const router = useRouter()
  const { locale } = useRouter();
  const { protocols: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent["en-us"];
  const { toast } = useToast()

  const categoriesWithLabels = getCategoriesWithLabels(content);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    description: "",
    validation: "",
    estimatedTime: "",
    file: null,
    references: [{ type: "doi", value: "" }],
    authors: "",
    institution: "",
    tags: [],
    tagInput: "",
    materials: "",
    methodology: "",
    troubleshooting: "",
    protocolType: "routine"
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const addProtocolMutation = api.protocol.saveProtocol.useMutation({
    onSuccess: () => {
      toast({
        title: content.protocolSubmitted,
      });
      setFormData({
        title: "",
        category: "",
        description: "",
        validation: "",
        estimatedTime: "",
        file: null,
        references: [{ type: "doi", value: "" }],
        authors: "",
        institution: "",
        tags: [],
        tagInput: "",
        materials: "",
        methodology: "",
        troubleshooting: "",
        protocolType: "routine"
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: content.modal.errorSubmittingProtocol,
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const getProtocolTypeInfo = (type: string) => {
    const info: Record<string, { label: string; description: string; icon: any }> = {
      routine: {
        label: content.routine,
        description: content.routineDescription,
        icon: CheckCircle2
      },
      "first-choice": {
        label: content.firstLine,
        description: content.firstLineDescription,
        icon: Zap
      },
      alternative: {
        label: content.alternative,
        description: content.alternativeDescription,
        icon: MessageCircleQuestion
      }
    };
    return info[type] || info.routine;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }))
  }

  const handleValidationChange = (value: string) => {
    setFormData(prev => ({ ...prev, validation: value }))
  }

  const handleProtocolTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, protocolType: value as "routine" | "first-choice" | "alternative" }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] || null }))
    }
  }

  const handleReferenceChange = (
    index: number,
    field: "type" | "value",
    value: string
  ) => {
    setFormData((prev) => {
      const newReferences = [...prev.references];
      newReferences[index] = {
        ...newReferences[index],
        [field]: value
      } as { type: "doi" | "url" | "text"; value: string };
      return { ...prev, references: newReferences };
    });
  };


  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, { type: "doi", value: "" }]
    }))
  }

  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ""
      }))
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({ title: content.modal.errorTitle, variant: "destructive" })
      return
    }
    if (!formData.category) {
      toast({ title: content.modal.errorCategory, variant: "destructive" })
      return
    }
    if (!formData.validation) {
      toast({ title: content.modal.errorValidation, variant: "destructive" })
      return
    }
    if (!formData.file) {
      toast({ title: content.modal.errorFile, variant: "destructive" })
      return
    }
    if (!formData.estimatedTime.trim()) {
      toast({ title: content.modal.errorTime, variant: "destructive" })
      return
    }

    const base64Image = await convertToBase64(formData.file)
    addProtocolMutation.mutate({
      title: formData.title,
      category: formData.category,
      description: formData.description,
      validation: formData.validation,
      estimatedTime: formData.estimatedTime,
      file: base64Image,
      references: formData.references,
      authors: formData.authors,
      institution: formData.institution,
      tags: formData.tags,
      materials: formData.materials,
      methodology: formData.methodology,
      troubleshooting: formData.troubleshooting,
      protocolType: formData.protocolType,
    })
  }

  const currentTypeInfo = getProtocolTypeInfo(formData.protocolType);
  const CurrentIcon = currentTypeInfo?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{content.modal.title}</DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{content.modal.subtitle}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">

          <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-sm font-bold">1</span>
              {content.modal.basicInfo}
            </h3>

            <div>
              <Label htmlFor="title" className="text-sm font-medium">{content.modal.protocolTitle} *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={content.modal.titleExample}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium">{content.modal.category} *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="category" className="mt-1">
                    <SelectValue placeholder={content.modal.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesWithLabels.map(({ key, label }) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="validation" className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {content.modal.validation} *
                </Label>
                <Select value={formData.validation} onValueChange={handleValidationChange}>
                  <SelectTrigger id="validation" className="mt-1">
                    <SelectValue placeholder={content.modal.selectLevel} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="experimental">{content.modal.experimental}</SelectItem>
                    <SelectItem value="validated">{content.modal.validated}</SelectItem>
                    <SelectItem value="standard">{content.modal.standard}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="institution" className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  {content.modal.institution} *
                </Label>
                <Input
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  placeholder={content.modal.institutionExample}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="estimatedTime" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {content.modal.estimatedTime} *
                </Label>
                <Input
                  id="estimatedTime"
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleInputChange}
                  placeholder={content.modal.timeExample}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="authors" className="text-sm font-medium">{content.modal.authors} *</Label>
              <Input
                id="authors"
                name="authors"
                value={formData.authors}
                onChange={handleInputChange}
                placeholder="John Doe, Jane Smith"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">{content.modal.description} *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={content.modal.descriptionExample}
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium"></Label>

              <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <CurrentIcon className="w-5 h-5 mt-0.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {currentTypeInfo?.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {currentTypeInfo?.description}
                    </p>
                  </div>
                </div>
              </Card>

              <Select value={formData.protocolType} onValueChange={handleProtocolTypeChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={content.selectType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {content.routine}
                    </div>
                  </SelectItem>
                  <SelectItem value="first-choice">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {content.firstLine}
                    </div>
                  </SelectItem>
                  <SelectItem value="alternative">
                    <div className="flex items-center gap-2">
                      <MessageCircleQuestion className="w-4 h-4" />
                      {content.alternative}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-sm font-bold">2</span>
              {content.modal.protocolFile}
            </h3>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 flex gap-2 text-sm text-blue-800 dark:text-blue-300 mb-2">
              <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{content.modal.uploadDesc}</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative cursor-pointer group">
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-2">
                {formData.file ? (
                  <>
                    <FileText className="h-10 w-10 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                      {formData.file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {content.modal.clickUpload}
                    </span>
                    <span className="text-xs text-gray-400">{content.modal.maxSize}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-sm font-bold">3</span>
              {content.modal.detailedProtocol}
            </h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="methodology" className="text-sm font-medium">{content.modal.methodology} *</Label>
                <Textarea
                  id="methodology"
                  name="methodology"
                  value={formData.methodology}
                  onChange={handleInputChange}
                  placeholder={content.modal.methodologyExample}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="materials" className="text-sm font-medium">{content.modal.materials} *</Label>
                <Textarea
                  id="materials"
                  name="materials"
                  value={formData.materials}
                  onChange={handleInputChange}
                  placeholder={content.modal.materialsExample}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="troubleshooting" className="text-sm font-medium">{content.modal.troubleshooting} *</Label>
                <Textarea
                  id="troubleshooting"
                  name="troubleshooting"
                  value={formData.troubleshooting}
                  onChange={handleInputChange}
                  placeholder={content.modal.troubleshootingExample}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-sm font-bold">4</span>
              {content.modal.linkResearch}
            </h3>

            <div className="space-y-3">
              {formData.references.map((ref, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{content.modal.referenceType}</Label>
                    <Select
                      value={String(ref.type)}
                      onValueChange={(value) => handleReferenceChange(index, "type", value)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doi">DOI</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-[2]">
                    <Label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                      {ref.type === "doi" ? "DOI" : ref.type === "url" ? "URL" : "Reference"}
                    </Label>
                    <Input
                      value={ref.value}
                      onChange={(e) => handleReferenceChange(index, "value", e.target.value)}
                      placeholder={ref.type === "doi" ? "10.1038/..." : ref.type === "url" ? "https://..." : "Journal, Year, Authors"}
                      className="h-9"
                    />
                  </div>
                  {formData.references.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReference(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addReference}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" /> {content.modal.addRef}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-sm font-bold">5</span>
              {content.modal.tagsKeywords}
            </h3>

            <div className="flex gap-2">
              <Input
                value={formData.tagInput}
                onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder={content.modal.addTagPlaceholder}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                {content.modal.addTag}
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <div key={tag} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-purple-900 dark:hover:text-purple-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>


          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || addProtocolMutation.isLoading}
              className="flex-1"
            >
              {content.modal.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || addProtocolMutation.isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              loading={addProtocolMutation.isLoading}
            >
              {addProtocolMutation.isLoading ? content.modal.submitting : content.modal.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}