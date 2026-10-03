import { schemas } from "../../schemas/zodSchemas"
import { api } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, Loader } from "lucide-react"
import { useRouter } from "next/router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { EyeOff } from "lucide-react"
import { clientContent } from "@/language/client"
import { ChartTooltipContent } from "./ui/chart"

export const LoginForm = () => {
  const [forgotPassword, setForgotPassword] = useState(false)
  const [registerMode, setRegisterMode] = useState(false)
  const [sendResetPassword, setSendResetPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()
  const login = api.auth.login.useMutation({
    onSuccess: async () => {
      await router.push("/")
    },
  })

  const { locale } = useRouter()
  const { login: content } = clientContent[locale as keyof typeof clientContent]

  const loginForm = useForm<z.infer<typeof schemas.loginSchema>>({
    resolver: zodResolver(schemas.loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleSubmit = (data: z.infer<typeof schemas.loginSchema>) => {
    if (forgotPassword) {
      return
    }
    if (registerMode) {
      return
    }
    if (sendResetPassword) {
      return
    }
    login.mutate({
      email: data.email,
      password: data.password,
    })
  }

  return (
    <>
      {!forgotPassword && (
        <Form {...loginForm}>
          <form
            className="mx-auto grid w-full gap-5 md:w-[100%]"
            onSubmit={loginForm.handleSubmit(handleSubmit)}
          >
            <p className="text-2xl font-bold">{content.title}</p>
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{content.email}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={content.example}
                      {...field}
                      className="w-full bg-transparent p-3 text-lg outline-none"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{content.password}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={content.password}
                      {...field}
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-transparent p-3 text-lg outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full text-right">
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff width={20} /> : <Eye width={20} />}
              </button>
            </div>
            <Button
              size="lg"
              className=""
              aria-disabled={login.isLoading}
              disabled={login.isLoading}
            >
              <Loader
                className="animate-spin"
                style={{
                  display: login.isLoading ? "block" : "none",
                  width: "1.5rem",
                  height: "1.5rem",
                  marginLeft: "-2.5rem",
                  marginRight: "1rem",
                }}
              />
              {content.login}
            </Button>
          </form>
        </Form>
      )}
      {forgotPassword && (
        <div className="grid font-medium">
          <p className="py-5 text-lg">{content.changePassword}</p>
          <label className="grid">
            Email
            {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
            <input
              className="dark:border-border w-full border-b-[2px] border-zinc-300 bg-transparent p-3 text-lg outline-none"
              type="email"
            ></input>
          </label>
        </div>
      )}
      {/* <button
          type="submit"
          className="bg-[#000051] p-2 rounded-md text-white font-semibold"
        >
          {submitText}
        </button> */}
      {!forgotPassword && (
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setForgotPassword(true)}
            className="font-semibold dark:text-white"
          >
            {content.forgotPassword}
          </button>
          <button
            type="button"
            onClick={() => router.push("/sign")}
            className="font-semibold dark:text-white"
          >
            {content.register}
          </button>
        </div>
      )}

      {forgotPassword && (
        <div className="grid pt-4">
          <button
            type="submit"
            className="rounded-md bg-[#345aa5] p-3 font-semibold text-white"
          >
            {registerMode ? content.login : content.submit}
          </button>
          {forgotPassword && (
            <button
              type="button"
              className="py-3 text-start font-medium dark:text-white"
              onClick={() => setForgotPassword(false)}
            >
              {content.backLogin}
            </button>
          )}
        </div>
      )}
    </>
  )
}
