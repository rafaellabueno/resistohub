import { Button } from "@/components/ui/button"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Card, CardContent } from "@/components/ui/card"
import { schemas } from "../../schemas/zodSchemas"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Mail, Lock, KeyRound, Send, ArrowLeft, Globe, Palette, Settings } from "lucide-react"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import Image from "next/image"
import { clientContent } from "@/language/client"
import { schemaContentFront } from "@/language/schemaFront"
import { SendCode } from "@/components/sendCode"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useChangeLang } from "@/hooks/useChangeLang"
import { REGEXP_ONLY_DIGITS } from "input-otp"

const ResetPasswordPopoverSettings = () => {
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

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [sendCode, setSendCode] = useState(false)

  const router = useRouter()
  const { locale } = useRouter()
  const { reset: content } = clientContent[locale as keyof typeof clientContent]
  const { register: schemaContent } =
    schemaContentFront[locale as keyof typeof schemaContentFront]

  const form = useForm<z.infer<typeof schemas.changePasswordSchema>>({
    resolver: zodResolver(schemas.changePasswordSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      code: "",
    },
  })

  const changePassword = api.auth.changePassword.useMutation({
    onSuccess: async () => {
      await router.push("/")
    },
  })

  const handleChangePassword = (data: z.infer<typeof schemas.changePasswordSchema>) => {
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
    changePassword.mutate(data)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-black dark:via-gray-950 dark:to-black p-4 flex items-center justify-center relative">
      <div className="absolute right-4 top-4 z-50">
        <ResetPasswordPopoverSettings />
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
                  {content.title || "Reset Password"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {content.createNewPass || "Create a new secure password to regain access to your account."}
                </p>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(handleChangePassword)}>
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
                              form.trigger("email")
                              setSendCode(true)
                            }}
                          />
                          <SendCode email={field.value} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <div className="pt-4">
                  <Button
                    size="lg"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                    aria-disabled={changePassword.isLoading}
                    disabled={changePassword.isLoading || !sendCode}
                    loading={changePassword.isLoading}
                    type="submit"
                  >
                    {content.submit}
                  </Button>
                </div>

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
