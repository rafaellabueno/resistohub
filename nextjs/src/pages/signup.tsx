import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { api } from "@/utils/api"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Mail, User, UserCircle, Lock, KeyRound, Send, ArrowLeft, Building, Globe, Briefcase, ReceiptText, GraduationCap } from "lucide-react"
import { schemas } from "../../schemas/zodSchemas"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"
import Image from "next/image"
import { clientContent } from "@/language/client"
import { schemaContentFront } from "@/language/schemaFront"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { toast } from "@/components/ui/use-toast"
import { useUserRole } from "@/hooks/userUserRole"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"
import { useChangeLang } from "@/hooks/useChangeLang"
import { Palette, Settings } from "lucide-react"

type Country = {
  code: string
  name: string
}

type Position = {
  value: string
  label: string
}

const SignupPopoverSettings = () => {
  const router = useRouter()
  const { locale } = router
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { popoverSettings: content } = clientContent[locale as keyof typeof clientContent]
  const handleLanguageChange = useChangeLang()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Settings width={20} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{content?.title || "Settings"}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Theme Switch */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Palette size={16} />
            <span>{content?.theme || "Theme"}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuCheckboxItem
                onCheckedChange={() => setTheme("system")}
                checked={theme === "system"}
              >
                System
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                onCheckedChange={() => setTheme("dark")}
                checked={theme === "dark"}
              >
                Dark
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                onCheckedChange={() => setTheme("light")}
                checked={theme === "light"}
              >
                Light
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* Language Switch */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Globe size={16} />
            <span>{content?.lang || "Language"}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuCheckboxItem
                onCheckedChange={() => handleLanguageChange("pt-br")}
                checked={locale === "pt-br"}
              >
                Português
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                onCheckedChange={() => handleLanguageChange("en-us")}
                checked={locale === "en-us"}
              >
                English
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                onCheckedChange={() => handleLanguageChange("es-es")}
                checked={locale === "es-es"}
              >
                Español
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Sign() {
  const [showPassword, setShowPassword] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(true)
  const { locale } = useRouter()
  const { register: content } = clientContent[locale as keyof typeof clientContent]
  const { register: schemaContent } =
    schemaContentFront[locale as keyof typeof schemaContentFront]
  const { changeRole } = useUserRole()

  const router = useRouter()
  const register = api.auth.signUp.useMutation({
    onSuccess: async () => {
      changeRole("client")
      await router.push("/")
    },
  })

  const positions: Position[] = [
    { value: "undergraduate_student", label: content.undergraduateStudent },
    { value: "master_student", label: content.masterStudent },
    { value: "phd_student", label: content.phdStudent },
    { value: "postdoc", label: content.postdoc },
    { value: "researcher", label: content.researcher },
    { value: "senior_researcher", label: content.seniorResearcher },
    { value: "professor_higher_education", label: content.professorHigherEducation },
    { value: "school_teacher", label: content.schoolTeacher },
    { value: "health_professional", label: content.healthProfessional },
    { value: "industry_professional", label: content.industryProfessional },
    { value: "government_professional", label: content.governmentProfessional },
    { value: "other", label: content.other }
  ]

  const form = useForm<z.infer<typeof schemas.registerSchema>>({
    resolver: zodResolver(schemas.registerSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
      lastName: "",
      code: "",
      country: "",
      institution: "",
      typeSpecialist: "",
      description: "",
      position: "",
    },
  })

  const handleSubmit = (data: z.infer<typeof schemas.registerSchema>) => {
    const regexPasssword = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}/
    if (!regexPasssword.test(data.password)) {
      form.setError("password", {
        message: schemaContent.password,
      })
      return
    }
    if (data.password !== data.passwordConfirm) {
      form.setError("passwordConfirm", {
        message: schemaContent.passwordsNotMatch,
      })
      return
    }
    register.mutate({
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
      name: data.name,
      lastName: data.lastName,
      code: data.code,
      country: data.country,
      institution: data.institution,
      typeSpecialist: data.typeSpecialist,
      description: data.description,
      position: data.position,
    })
  }

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true)
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2")
        const data = await response.json()

        const formattedCountries = data
          .map((country: any) => ({
            code: country.cca2,
            name: country.name.common
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name))

        setCountries(formattedCountries)
      } catch (error) {
        console.error("Failed to fetch countries:", error)
        toast({
          description: "Failed to load countries. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-black dark:via-gray-950 dark:to-black p-4 flex items-center justify-center relative">
      <div className="absolute right-4 top-4 z-50">
        <SignupPopoverSettings />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2 border-gray-200 dark:border-gray-800 shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="mb-8 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-teal-100 dark:bg-teal-950/30 rounded-lg">
                <Image
                  src="/logo.png"
                  width={48}
                  height={48}
                  alt="Logo"
                  className="transition-opacity duration-150 hover:opacity-90"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {content.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Join our community of researchers
                </p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                          <User size={16} className="text-teal-600" />
                          {content.name}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={content.name}
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
                          <UserCircle size={16} className="text-teal-600" />
                          {content.lastName}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={content.lastName}
                            {...field}
                            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <Mail size={16} className="text-teal-600" />
                        {content.email}
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder={content.example}
                            {...field}
                            className="flex-1 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                            onBlur={() => {
                              form.setValue("email", field.value)
                              form.trigger("email")
                            }}
                          />
                          <SendCode email={field.value} name={form.getValues("name")} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                          <Globe size={16} className="text-teal-600" />
                          {content.country || "Country"}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                          <GraduationCap size={16} className="text-teal-600" />
                          {content.position || "Position"}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="typeSpecialist"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                          <Briefcase size={16} className="text-teal-600" />
                          {content.typeSpecialist}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={content.typeSpecialistExample}
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
                    name="institution"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                          <Building size={16} className="text-teal-600" />
                          {content.institute || "Institute"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={content.institutePlace || "Institution where you work/study"}
                            {...field}
                            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <ReceiptText size={16} className="text-teal-600" />
                        {content.description}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="resize-none min-h-[100px] bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                          placeholder={content.descriptionExample}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                          <Lock size={16} className="text-teal-600" />
                          {content.password}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder={content.password}
                              {...field}
                              type={showPassword ? "text" : "password"}
                              className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 pr-10"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                          <KeyRound size={16} className="text-teal-600" />
                          {content.confirmPassword}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={content.confirmPassword}
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <Send size={16} className="text-teal-600" />
                        {content.code}
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 p-6 border border-gray-300 dark:border-gray-700">
                          <InputOTP
                            maxLength={8}
                            inputMode="numeric"
                            pattern={REGEXP_ONLY_DIGITS}
                            onPaste={(e) => {
                              e.preventDefault()
                              const pastedText = e.clipboardData.getData("text")
                              const sanitizedText = pastedText.replace(/\D/g, "")
                              field.onChange(sanitizedText)
                            }}
                            {...field}
                          >
                            <div className="flex w-full flex-wrap justify-center">
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                                <InputOTPSlot index={6} />
                                <InputOTPSlot index={7} />
                              </InputOTPGroup>
                            </div>
                          </InputOTP>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button
                    size="lg"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                    aria-disabled={register.isLoading}
                    disabled={register.isLoading || form.getValues("name").length <= 3}
                    loading={register.isLoading}
                    type="submit"
                  >
                    {content.title}
                  </Button>
                </div>

                {/* Back to Login */}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    {content.backLogin}
                  </button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}

const SendCode = ({ email, name }: { email: string; name: string }) => {
  const { locale } = useRouter()
  const { reset: content } = clientContent[locale as keyof typeof clientContent]
  const [time, setTime] = useState(0)

  const sendCode = api.auth.sendPasswordRegister.useMutation({
    onMutate: () => setTime(60),
  })

  useEffect(() => {
    if (time <= 0) return

    const timer = setInterval(() => {
      setTime((prevTime) => prevTime - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [time])

  return (
    <Button
      type="button"
      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
      disabled={time > 0 || name.length <= 3}
      onClick={() => {
        const valid = schemas.sendCodeSchema.safeParse({ email, name })
        if (!valid.success) {
          toast({
            description: valid.error?.errors?.[0]?.message ?? "",
            variant: "destructive",
          })
          return
        }
        sendCode.mutate({ email, name })
      }}
    >
      <Send size={16} className="mr-2" />
      {time > 0 ? `${time}s` : content.sendCode}
    </Button>
  )
}