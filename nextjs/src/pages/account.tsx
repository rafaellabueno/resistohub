import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { TwoFa } from "@/components/twoFa"
import { useToast } from "@/components/ui/use-toast"
import { clientContent } from "@/language/client"
import { schemaContentFront } from "@/language/schemaFront"
import DefaultLayout, { PageTitle } from "@/layout/default"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, Eye, EyeOff, Loader, Mail, User, Lock } from "lucide-react"
import router, { useRouter } from "next/router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { schemas } from "../../schemas/zodSchemas"
import { SendCode } from "@/components/sendCode"

export default function Account() {
  const { locale } = useRouter()
  const { account: content } = clientContent[locale as keyof typeof clientContent]
  const me = api.auth.me.useQuery()
  const status = api.auth.getStatus2FA.useQuery()

  if (me.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <PageTitle title={content.title}>
        <User className="text-accent" />
      </PageTitle>

      <section className="flex w-full flex-wrap justify-center gap-5">
        <UpdateProfile />

        {/*
        <div className="border-border bg-secondary w-full max-w-sm rounded-md border-[1px] p-5 dark:text-white">
          <p>{content.photo}</p>
          <ImageUploader
            defaultImagLink={me.data?.photo ?? ""}
            token={token.data ?? ""}
          />
        </div>
        */}
      </section>
      <section className="mt-5 flex flex-col gap-5">
        <h2 className="text-accent text-2xl font-bold dark:text-white">{content.conf}</h2>
        <div className="bg-secondary flex justify-between rounded-lg p-4">
          <p>Google Authenticator (2FA)</p>
          <TwoFa>
            <Button variant="outline" disabled={status.data === "active"}>
              {status.data === "active" ? content.enabled : content.enable}
            </Button>
          </TwoFa>
        </div>
        <div className="bg-secondary flex justify-between rounded-lg p-4">
          <p>{content.accountLock}</p>
          <BlockAccount />
        </div>
      </section>
    </div>
  )
}

const userProfileSchema = schemas.userProfileSchema

const UpdateProfile = () => {
  const { locale } = useRouter()
  const { account: content } = clientContent[locale as keyof typeof clientContent]

  const { toast } = useToast()

  const me = api.auth.me.useQuery()

  const form = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: me.data?.name!,
      lastName: me.data?.lastName!,
    },
  })

  const updateProfile = api.auth.updateUserProfile.useMutation({
    onSuccess: () => {
      toast({
        title: content.success,
      })
    },
  })

  const onSubmit = (data: z.infer<typeof userProfileSchema>) => {
    updateProfile.mutate(data)
  }

  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()
  const { register: schemaContent } =
    schemaContentFront[locale as keyof typeof schemaContentFront]

  const resetPasswordForm = useForm<z.infer<typeof schemas.changePasswordSchema>>({
    resolver: zodResolver(schemas.changePasswordSchema),
    defaultValues: {
      email: me.data?.email ?? "",
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
      resetPasswordForm.setError("password", {
        message: schemaContent.password,
      })
      return
    }
    if (data.password !== data.passwordConfirm) {
      resetPasswordForm.setError("passwordConfirm", {
        message: schemaContent.passwordsNotMatch,
      })
      return
    }
    changePassword.mutate(data)
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="border-border bg-secondary flex w-full max-w-md flex-col gap-5 rounded-md border-[1px] p-5 dark:text-white"
        >
          <p>{content.personalInformation}</p>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{content.name}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{content.lastName}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            variant="aqua"
            className="mt-auto w-full px-8"
            area-disabled={updateProfile.isLoading}
            disabled={updateProfile.isLoading}
            loading={updateProfile.isLoading}
            type="submit"
          >
            {content.update}
          </Button>
        </form>
      </Form>
      <Form {...resetPasswordForm}>
        <form
          className="border-border bg-secondary flex w-full max-w-md flex-col gap-5 rounded-md border-[1px] p-5 dark:text-white"
          onSubmit={resetPasswordForm.handleSubmit(handleChangePassword)}
        >
          <p>{content.updatePassword}</p>
          <FormField
            control={resetPasswordForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{content.email}</FormLabel>
                <FormControl className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full items-center justify-between rounded-md border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <div>
                    <p className="truncate px-3">{me.data?.email}</p>
                    <SendCode email={me.data?.email ?? ""} />
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={resetPasswordForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{content.code}</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-center">
                    <InputOTP
                      maxLength={8}
                      inputMode="numeric"
                      onPaste={(e) => {
                        e.preventDefault()
                        const pastedText = e.clipboardData.getData("text")
                        // remove all spaces and non-numeric characters
                        const sanitizedText = pastedText.replace(/\D/g, "")
                        field.onChange(sanitizedText)
                      }}
                      {...field}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={0}
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <InputOTPSlot
                          index={1}
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={2}
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <InputOTPSlot
                          index={3}
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={4}
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <InputOTPSlot
                          index={5}
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={6}
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <InputOTPSlot
                          index={7}
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={resetPasswordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{content.password}</FormLabel>
                <FormControl>
                  <div className="relative flex w-full items-center">
                    <Input
                      placeholder={content.password}
                      {...field}
                      type={showPassword ? "text" : "password"}
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button
                      type="button"
                      className="absolute right-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff width={20} /> : <Eye width={20} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={resetPasswordForm.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{content.confirmPassword}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={content.confirmPassword}
                    {...field}
                    type={showPassword ? "text" : "password"}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-3 pt-4">
            <Button
              variant="aqua"
              className="mt-auto w-full px-8"
              aria-disabled={changePassword.isLoading}
              disabled={changePassword.isLoading}
              loading={changePassword.isLoading}
              type="submit"
            >
              {content.update}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

const BlockAccount = () => {
  const { locale } = useRouter()
  const { account: content } = clientContent[locale as keyof typeof clientContent]

  const statusBlock = api.auth.getStatusBlock.useQuery()

  const me = api.auth.me.useQuery()

  const blockForm = useForm<z.infer<typeof schemas.blockSchema>>({
    resolver: zodResolver(schemas.blockSchema),
    defaultValues: {
      code: "",
      email: me.data?.email ?? "",
    },
  })

  const block = api.auth.block.useMutation({
    onSuccess: async () => {
      await router.push("/")
    },
  })

  const handleChangeBlock = (data: z.infer<typeof schemas.blockSchema>) => {
    block.mutate(data)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={statusBlock.data === "disable" ? "destructive" : "outline"}
          disabled={statusBlock.data === "active"}
          className="min-w-[100px]"
        >
          {statusBlock.data === "disable" ? content.block : content.blocked}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-fit lg:max-w-4xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-xl">
            {statusBlock.data === "disable" ? content.block : content.unblock}
          </DialogTitle>
          <DialogDescription className="flex items-center justify-center gap-3 pt-2">
            <AlertTriangle className="text-destructive w-60" size={60} />
            <p>
              {statusBlock.data === "disable"
                ? content.blockMessage
                : content.unblockMessage}
            </p>
          </DialogDescription>
        </DialogHeader>

        <Form {...blockForm}>
          <form
            onSubmit={blockForm.handleSubmit(handleChangeBlock)}
            className="space-y-6 pt-4"
          >
            <FormField
              control={blockForm.control}
              name="email"
              render={() => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{content.email}</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">{me.data?.email}</p>
                      <SendCode email={me.data?.email ?? ""} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={blockForm.control}
              name="code"
              rules={{
                onChange: (v) => {
                  if (v.target.value.length === 8) blockForm.trigger("code")
                },
              }}
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>{content.code}</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={8}
                        inputMode="numeric"
                        value={field.value}
                        onChange={field.onChange}
                        onPaste={(e) => {
                          e.preventDefault()
                          const pastedText = e.clipboardData.getData("text")
                          const sanitizedText = pastedText.replace(/\D/g, "")
                          field.onChange(sanitizedText)
                        }}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={6} />
                          <InputOTPSlot index={7} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                variant="destructive"
                loading={block.isLoading}
                disabled={block.isLoading || blockForm.getValues("code").length !== 8}
                className="w-full"
              >
                {content.block}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

Account.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>
}
