import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  User,
  Mail,
  MapPin,
  Building,
  Calendar,
  Medal,
  MessageSquare,
  Edit,
  ChevronLeft,
  Globe,
  GraduationCap,
  Heart,
  Share2,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/utils/api";
import { clientContent } from "@/language/client";
import DefaultLayout from "@/layout/default";

interface UserData {
  id: number;
  name?: string;
  lastName?: string;
  email: string;
  country?: string;
  institution?: string;
  typeSpecialist?: string;
  description?: string;
  createdAt?: string;
  position?: string;
}

interface Country {
  code: string;
  name: string;
}

interface Position {
  value: string;
  label: string;
}

const profileSchema = z.object({
  name: z.string().min(1),
  lastName: z.string().min(1),
  country: z.string().min(1),
  institution: z.string().min(1),
  typeSpecialist: z.string().min(1),
  description: z.string(),
  position: z.string().min(1),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: UserData;
  onProfileUpdated: (data: UserData) => void;
}

function EditProfileModal({ open, onOpenChange, userData, onProfileUpdated }: EditProfileModalProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState<boolean>(true);
  const { locale } = useRouter();
  const { register: content } = clientContent[locale as keyof typeof clientContent];

  const positions: Position[] = [
    { value: "undergraduate_student", label: content.undergraduateStudent },
    { value: "master_student", label: content.masterStudent },
    { value: "phd_student", label: content.phdStudent },
    { value: "postdoc", label: content.postdoc },
    { value: "junior_researcher", label: content.juniorResearcher },
    { value: "researcher", label: content.researcher },
    { value: "senior_researcher", label: content.seniorResearcher },
    { value: "lecturer", label: content.lecturer },
    { value: "assistant_professor", label: content.assistantProfessor },
    { value: "associate_professor", label: content.associateProfessor },
    { value: "full_professor", label: content.fullProfessor },
    { value: "research_director", label: content.researchDirector },
    { value: "other", label: content.other }
  ]

  const updateUser = api.auth.updateUserProfile.useMutation({
    onSuccess: (data) => {
      toast({
        description: content.saveUpdateUserProfile,
        duration: 6000,
      });
      onProfileUpdated(userData);
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        description: content.errorUpdateUserProfile,
        variant: "destructive",
      });
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userData?.name || "",
      lastName: userData?.lastName || "",
      country: userData?.country || "",
      institution: userData?.institution || "",
      typeSpecialist: userData?.typeSpecialist || "",
      description: userData?.description || "",
      position: userData?.position || "",
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        name: userData.name || "",
        lastName: userData.lastName || "",
        country: userData.country || "",
        institution: userData.institution || "",
        typeSpecialist: userData.typeSpecialist || "",
        description: userData.description || "",
        position: userData.position || "",
      });
    }
  }, [userData, form]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true);
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2");
        const data = await response.json();

        const formattedCountries = data
          .map((country: any) => ({
            code: country.cca2,
            name: country.name.common
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        toast({
          description: "Failed to load countries. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCountries(false);
      }
    };

    if (open) {
      fetchCountries();
    }
  }, [open]);

  const onSubmit = (data: ProfileFormValues) => {
    updateUser.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-6 sm:p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {content.editProfile || "Edit Profile"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                      <User size={16} />
                      {content.name || "First Name"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={content.name || "First Name"}
                        {...field}
                        className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                      <User size={16} />
                      {content.lastName || "Last Name"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={content.lastName || "Last Name"}
                        {...field}
                        className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                      <Globe size={16} />
                      {content.country || "Country"}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                          <SelectValue placeholder={content.selectCountry || "Select your country"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                      <GraduationCap size={16} />
                      {content.position || "Position"}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                          <SelectValue placeholder={content.selectPosition || "Select your position"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <Building size={16} />
                    {content.institute || "Institution"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={content.institute || "Institution"}
                      {...field}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="typeSpecialist"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <Medal size={16} />
                    {content.typeSpecialist || "Specialty"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={content.typeSpecialist || "Specialty"}
                      {...field}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <MessageSquare size={16} />
                    {content.description || "Bio"}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={content.descriptionExample || "Tell us about yourself..."}
                      {...field}
                      className="resize-none min-h-[120px] bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-300 dark:border-gray-700"
              >
                {content.cancel || "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={updateUser.isLoading}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {updateUser.isLoading ? "Saving..." : content.saveChanges || "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [copied, setCopied] = useState(false);

  const me = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        return false
      }
      return failureCount < 3
    },
  });

  const { data: user, refetch } = api.user.getUser.useQuery(
    { id: Number(id) },
    {
      enabled: !!id,
      onSuccess: (data) => {
        if (data) {
          const adjustedData: UserData = {
            name: data.name ?? "",
            lastName: data.lastName ?? "",
            country: data.country ?? "",
            institution: data.institution ?? "",
            typeSpecialist: data.typeSpecialist ?? "",
            description: data.description ?? "",
            id: data.id,
            email: data.email ?? "",
            position: data.position ?? "",
          };
          setUserData(adjustedData);
        }
      },
    }
  );

  const { locale } = useRouter();
  const { user: content } = clientContent[locale as keyof typeof clientContent];

  const handleProfileUpdated = (updatedData: UserData) => {
    setUserData(updatedData);
    refetch();
  };

  const isOwnProfile = me.data?.id === Number(id);

  const getPositionLabel = (positionValue: string) => {
    const positions: Position[] = [
      { value: "undergraduate_student", label: content.undergraduateStudent },
      { value: "master_student", label: content.masterStudent },
      { value: "phd_student", label: content.phdStudent },
      { value: "postdoc", label: content.postdoc },
      { value: "junior_researcher", label: content.juniorResearcher },
      { value: "researcher", label: content.researcher },
      { value: "senior_researcher", label: content.seniorResearcher },
      { value: "lecturer", label: content.lecturer },
      { value: "assistant_professor", label: content.assistantProfessor },
      { value: "associate_professor", label: content.associateProfessor },
      { value: "full_professor", label: content.fullProfessor },
      { value: "research_director", label: content.researchDirector },
      { value: "other", label: content.other }
    ]

    const position = positions.find(p => p.value === positionValue);
    return position ? position.label : positionValue;
  };

  const handleCopyProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${id}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="sticky top-0 z-40 backdrop-blur-sm bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white gap-2 pl-0"
          >
            <ChevronLeft className="h-5 w-5" />
            {content.back || "Back"}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              <Avatar className="h-32 w-32 ring-2 ring-teal-200 dark:ring-teal-800 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-teal-600 to-cyan-600 text-white text-4xl font-bold">
                  {userData?.name?.slice(0, 1)}
                  {userData?.lastName?.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="flex-1">
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {userData?.name} {userData?.lastName}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {userData?.description || "Researcher"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {userData?.position && (
                    <Badge className="bg-teal-100 dark:bg-teal-950/40 text-teal-700 hover:bg-teal-200 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-3 py-1 flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {getPositionLabel(userData.position)}
                    </Badge>
                  )}
                  {userData?.typeSpecialist && (
                    <Badge className="bg-cyan-100 dark:bg-cyan-950/40 text-cyan-700 hover:bg-teal-200 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 px-3 py-1 flex items-center gap-1">
                      <Medal className="h-3 w-3" />
                      {userData.typeSpecialist}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {isOwnProfile ? (
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      {content.editProfile || "Edit Profile"}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => window.location.href = `mailto:${userData?.email}`}
                        className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {content.connect || "Connect"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyProfile}
                        className="border-gray-300 dark:border-gray-700"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-950/30 rounded-lg">
                    <Mail className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">Email</p>
                </div>
                <p className="text-sm text-gray-900 dark:text-white break-all font-medium">{userData?.email}</p>
              </CardContent>
            </Card>

            {userData?.country && (
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-cyan-100 dark:bg-cyan-950/30 rounded-lg">
                      <MapPin className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">Country</p>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{userData.country}</p>
                </CardContent>
              </Card>
            )}

            {userData?.institution && (
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-950/30 rounded-lg">
                      <Building className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">Institution</p>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">{userData.institution}</p>
                </CardContent>
              </Card>
            )}

            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-950/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase">Joined</p>
                </div>
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString(locale as string, { year: 'numeric', month: 'short' }) : "Unknown"}
                </p>
              </CardContent>
            </Card>
          </div>

          {!isOwnProfile && (
            <Card className="border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {content.wantToCollaborate || "Interested in Collaboration?"}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {content.feedbackMessage || "Connect with this researcher to explore opportunities for partnership and joint research."}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      onClick={() => window.location.href = `mailto:${userData?.email}`}
                      className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {content.sendMessage || "Send Message"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {isModalOpen && userData && (
        <EditProfileModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          userData={userData}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
}

UserProfile.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};