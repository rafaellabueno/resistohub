import type { AppProps, AppType } from "next/app"
import { api } from "@/utils/api"
import { Toaster } from "@/components/ui/toaster"
import "@/styles/globals.css"
import i18next from "i18next"
import type { NextPage } from "next"
import { ThemeProvider } from "next-themes"
import { useRouter } from "next/router"
import { useEffect, type ReactElement, type ReactNode } from "react"
import Image from "next/image"
import { useUserRole } from "@/hooks/userUserRole"
import Head from "next/head"

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const MyApp: AppType = ({ Component, pageProps, router }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page)

  useEffect(() => {
    if (!router.isReady) return
    const languageCode = router.locale?.split("-")[0] ?? "en"
    if (typeof i18next !== "undefined" && i18next.isInitialized) {
      i18next.changeLanguage(languageCode)
    }
  }, [router.isReady, router.locale])

  return (
    <ThemeProvider attribute="class">
      <PageHeader />
      <InitialLoad />
      <Toaster />
      {getLayout(<Component {...pageProps} key={router.pathname} />)}
    </ThemeProvider>
  )
}

const pages = [
  "/", "/signup", "/reset", "/bioinfo", "/surveillance", "/community",
  "/educational", "/contact", "/terms", "/question/[id]", "/user/[id]",
  "/protocols", "/protocols/[id]", "/clinical", "/account",
  "/notifications", "/notifications/[id]"
]

const InitialLoad = () => {
  const router = useRouter()
  const { userRole } = useUserRole()

  const me = api.auth.me.useQuery(undefined, {
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') return false
      return failureCount < 3
    },
  })

  const isRouteIndex = pages.includes(router.pathname)

  useEffect(() => {
    if (me.isInitialLoading) return

    if (!me.data && !isRouteIndex) {
      router.push(`/${router.locale ?? "en-us"}`)
    }
  }, [me.data, me.isInitialLoading, router.locale, isRouteIndex, router])

  if (!isRouteIndex && me.data && userRole !== undefined) return null
  if (isRouteIndex) return null

  return (
    <div className="bg-background fixed z-50 flex h-screen w-screen items-center justify-center">
      <Image
        src="/logo.png"
        width={100}
        height={100}
        className="mt-[9px] flex animate-pulse flex-row duration-[1000]"
        alt="ResistoHub"
      />
    </div>
  )
}

const content = {
  "en-us": {
    title: "ResistoHub",
    description: `ResistoHub is a collaborative platform connecting researchers and healthcare professionals interested in antimicrobial resistance (AMR).`,
    language: "English",
    preview: "https://resistohub.com/preview_en.png"
  },
  "pt-br": {
    title: "ResistoHub",
    description: `O ResistoHub é uma plataforma colaborativa que conecta pesquisadores e profissionais da saúde interessados em resistência antimicrobiana (RAM).`,
    language: "Português",
    preview: "https://resistohub.com/preview_pt.png"
  },
  "es-es": {
    title: "ResistoHub",
    description: `ResistoHub es una plataforma colaborativa que conecta investigadores y profesionales de la salud interesados en la resistencia a los antimicrobianos (RAM).`,
    language: "Español",
    preview: "https://resistohub.com/preview_es.png"
  },
}

const PageHeader = () => {
  const { locale } = useRouter()
  const ctx = content[locale as keyof typeof content] || content["en-us"]

  return (
    <Head>
      <title>{ctx.title}</title>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#000000" />
      <meta name="description" content={ctx.description} />
      <meta property="og:title" content={ctx.title} />
      <meta property="og:description" content={ctx.description} />
      <meta property="og:image" content={ctx.preview} />
      <link rel="icon" type="image/svg+xml" href="/logo.ico" />
    </Head>
  )
}

export default api.withTRPC(MyApp)