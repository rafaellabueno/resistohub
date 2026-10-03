import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUserRole } from "@/hooks/userUserRole"
import { cn } from "@/lib/utils"
import { api } from "@/utils/api"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { PersonIcon } from "@radix-ui/react-icons"
import { atom, useAtom } from "jotai"
import {
  Bell,
  CheckIcon,
  DoorClosed,
  Eye,
  EyeOff,
  Globe,
  GlobeIcon,
  Handshake,
  Home,
  Mail,
  Palette,
  PaletteIcon,
  Phone,
  Search,
  Settings,
  UserCog,
  UsersRound,
  ChevronLeft,
  Info,
  FileText,
  HelpCircle,
  Menu,
  LogIn,
  LogInIcon,
  Laptop,
  Earth,
  MessagesSquare,
  Book,
  ChevronRightIcon,
  Badge,
  InboxIcon,
  ShieldAlert
} from "lucide-react"
import { useTheme } from "next-themes"
import { Lato } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { useChangeLang } from "@/hooks/useChangeLang"
import { useShowValue } from "@/hooks/useShowValue"
import { clientContent } from "@/language/client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { schemas } from "../../schemas/zodSchemas"

export const openCommand = atom<"closed" | "all" | "clients" | "theme" | "profile">(
  "closed",
)

export const openLoginModalAtom = atom(false)
const isMac =
  typeof window !== "undefined" && window.navigator.userAgent.indexOf("Mac") !== -1
const langArray = ["en-us", "pt-br", "es-es"] as const

export function CommandMenu() {
  const [open, setOpen] = useAtom(openCommand)
  const { theme, setTheme } = useTheme()
  const [value, setValue] = React.useState("")
  const { userRole } = useUserRole()

  const { locale } = useRouter()

  const handleTheme = () => {
    if (theme === "dark") setTheme("light")
    else setTheme("dark")
  }

  const handleLanguageChange = useChangeLang()
  const handleChangeLang = () => {
    // @ts-ignore
    const newLang = langArray[(langArray.indexOf(locale as string) + 1) % 3]
    // @ts-ignore
    handleLanguageChange(newLang)
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (open !== "closed") {
          setValue("")
          setOpen("closed")
          return
        }
        setOpen("all")
        return
      }
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleTheme()
        return
      }
      if (userRole === "client") return
      if (e.key === "d" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen("clients")
        return
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [theme, open, userRole, locale])

  const handleOpen = (state: boolean) => {
    if (state) setOpen("all")
    else {
      setValue("")
      setOpen("closed")
    }
  }
  const { popoverSettings: content } = clientContent[locale as keyof typeof clientContent]
  return (
    <CommandDialog open={open !== "closed" && open !== "theme"} onOpenChange={handleOpen}>
      {open === "all" && (
        <CommandList>
          <CommandGroup>
            <CommandItem onSelect={handleTheme}>
              <PaletteIcon className="" />
              <span>Theme</span>
              <CommandShortcut>{isMac ? "⌘B" : "Ctrl + B"}</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={handleChangeLang}>
              <GlobeIcon className="" />
              <span>{content.lang}</span>
              <span className="text-muted-foreground text-sm">{locale}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      )}
    </CommandDialog>
  )
}

const lato = Lato({
  weight: ["300", "400", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--lato-font-display",
  display: "swap",
})

const MobileMenu = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { locale } = router;
  const { menu: content } = clientContent[locale as keyof typeof clientContent] || {
    menu: {
      home: "Home",
      bioinfo: "Bioinformática",
      surveillance: "Vigilância",
      protocols: "Protocolos",
      comunity: "Comunidade",
      education: "Educacional"
    }
  }

  return (
    <div className="lg:hidden flex items-center">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
        <Menu size={24} className="text-white" />
      </Button>
      {isOpen && (
        <div className="absolute top-14 left-0 w-full bg-slate-900 border-b border-slate-800 z-50">
          <nav className="flex flex-col space-y-4 p-4">
            <Link href="/" className={`flex items-center gap-2 font-medium text-white hover:text-teal-300 transition-colors ${router.pathname === '/' ? 'text-teal-300' : ''}`} onClick={() => setIsOpen(false)}>
              <Home size={18} />
              <span>{content.home || "Home"}</span>
            </Link>
            <Link href="/surveillance" className={`flex items-center gap-2 font-medium text-white hover:text-teal-300 transition-colors ${router.pathname === '/surveillance' ? 'text-teal-300' : ''}`} onClick={() => setIsOpen(false)}>
              <ShieldAlert size={18} />
              <span>{content.surveillance || "Vigilância"}</span>
            </Link>
            <Link href="/bioinfo" className={`flex items-center gap-2 font-medium text-white hover:text-teal-300 transition-colors ${router.pathname === '/bioinfo' ? 'text-teal-300' : ''}`} onClick={() => setIsOpen(false)}>
              <Laptop size={18} />
              <span>{content.bioinfo || "Bioinformática"}</span>
            </Link>
            <Link href="/protocols" className={`flex items-center gap-2 font-medium text-white hover:text-teal-300 transition-colors ${router.pathname === '/protocols' ? 'text-teal-300' : ''}`} onClick={() => setIsOpen(false)}>
              <FileText size={18} />
              <span>{content.protocols || "Protocolos"}</span>
            </Link>
            <Link href="/community" className={`flex items-center gap-2 font-medium text-white hover:text-teal-300 transition-colors ${router.pathname === '/community' ? 'text-teal-300' : ''}`} onClick={() => setIsOpen(false)}>
              <MessagesSquare size={18} />
              <span>{content.comunity || "Comunidade"}</span>
            </Link>
            <Link href="/educational" className={`flex items-center gap-2 font-medium text-white hover:text-teal-300 transition-colors ${router.pathname === '/educational' ? 'text-teal-300' : ''}`} onClick={() => setIsOpen(false)}>
              <Book size={18} />
              <span>{content.education || "Educacional"}</span>
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}

export const HorizontalMenu = () => {
  const router = useRouter()
  const { locale } = router
  const me = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,

    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        return false
      }
      return failureCount < 3
    },
  });
  const { menu: content } = clientContent[locale as keyof typeof clientContent] || {
    menu: {
      home: "Home",
      surveillance: "Vigilância",
      bioinfo: "Bioinformática",
      protocols: "Protocolos",
      comunity: "Comunidade",
      education: "Educacional"
    }
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-40 w-full">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.png"
            width={50}
            height={50}
            alt="ResistoHub"
            className="duration-150 hover:opacity-80"
          />
        </Link>

        <nav className="hidden lg:flex items-center space-x-1">
          <Link
            href="/"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/' ? 'bg-slate-700 text-teal-300' : 'text-gray-300 hover:text-white hover:bg-slate-700'}`}
          >
            <Home className="inline mr-1" size={16} />
            {content.home || "Home"}
          </Link>
          <Link
            href="/surveillance"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/surveillance' ? 'bg-slate-700 text-teal-300' : 'text-gray-300 hover:text-white hover:bg-slate-700'}`}
          >
            <ShieldAlert className="inline mr-1" size={16} />
            {content.surveillance || "Vigilância"}
          </Link>
          <Link
            href="/bioinfo"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/bioinfo' ? 'bg-slate-700 text-teal-300' : 'text-gray-300 hover:text-white hover:bg-slate-700'}`}
          >
            <Laptop className="inline mr-1" size={16} />
            {content.bioinfo || "Bioinformática"}
          </Link>
          <Link
            href="/protocols"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/protocols' ? 'bg-slate-700 text-teal-300' : 'text-gray-300 hover:text-white hover:bg-slate-700'}`}
          >
            <FileText className="inline mr-1" size={16} />
            {content.protocols || "Protocolos"}
          </Link>
          <Link
            href="/community"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/community' ? 'bg-slate-700 text-teal-300' : 'text-gray-300 hover:text-white hover:bg-slate-700'}`}
          >
            <MessagesSquare className="inline mr-1" size={16} />
            {content.comunity || "Comunidade"}
          </Link>
          <Link
            href="/educational"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === '/educational' ? 'bg-slate-700 text-teal-300' : 'text-gray-300 hover:text-white hover:bg-slate-700'}`}
          >
            <Book className="inline mr-1" size={16} />
            {content.education || "Educacional"}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {me.data && <Notification />}
          <SettingsMenu />
          {!me.data ? <LoginModal /> : <UserMenu />}
          <MobileMenu />
        </div>
      </div>
    </div>
  )
}

const SettingsMenu = () => {
  const { theme, setTheme } = useTheme()
  const { locale } = useRouter()
  const { popoverSettings: content } = clientContent[locale as keyof typeof clientContent]

  const handleTheme = () => {
    if (theme === "dark") setTheme("light")
    else setTheme("dark")
  }

  const handleLanguageChange = useChangeLang()
  const handleChangeLang = () => {
    // @ts-ignore
    const newLang = langArray[(langArray.indexOf(locale as string) + 1) % 3]
    // @ts-ignore
    handleLanguageChange(newLang)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{content.settings}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleTheme}>
            <PaletteIcon className="mr-2 h-4 w-4" />
            <span>{content.theme}</span>
            <CommandShortcut className="ml-2">{isMac ? "⌘B" : "Ctrl + B"}</CommandShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleChangeLang}>
            <GlobeIcon className="mr-2 h-4 w-4" />
            <span>{content.lang}</span>
            <span className="text-muted-foreground text-xs ml-2">{locale}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

const UserMenu = () => {
  const router = useRouter()
  const { locale } = router
  const { data } = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,

    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
        return false
      }
      return failureCount < 3
    },
  });
  const logoutMutation = api.auth.logout.useMutation({
    onSuccess: () => {
      router.reload();
    }
  });
  const { popoverSettings: content } = clientContent[locale as keyof typeof clientContent]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
          <UserCog className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{content.account}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/user/" + data?.id)} className="gap-2">
          <UserCog className="h-4 w-4" /> {content.profile}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="gap-2">
          <DoorClosed className="h-4 w-4" /> {content.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const Notification = () => {
  const { locale } = useRouter()
  const { data } = api.notifications.getNotifications.useQuery({
    status: "all",
    limit: 5,
  })
  const { notifications: content } = clientContent[locale as keyof typeof clientContent]
  const markAllAsRead = api.notifications.markAllAsRead.useMutation()

  return (
    <Popover>
      <PopoverTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 text-gray-300 hover:text-white hover:bg-slate-700">
        <Bell className="h-5 w-5" />
        {data?.totalNotRead ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {data?.totalNotRead > 9 ? "9+" : data?.totalNotRead}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 border shadow-lg rounded-lg overflow-hidden">
        <div className="bg-background px-4 py-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{content.title}</h3>
            <Badge className="bg-accent text-white">
              {data?.totalNotRead ?? 0}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{content.youHave(data?.totalNotRead ?? 0)}</p>
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {data?.notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <InboxIcon className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">{content.noNotifications}</p>
            </div>
          ) : (
            data?.notifications.map((notification) => (
              <Link
                key={notification.id}
                className="flex items-start px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                href={`/notifications/${notification.id}`}
              >
                <div className="flex-shrink-0 mr-3">
                  {notification.status === "unread" ? (
                    <div className="h-2 w-2 mt-1 rounded-full bg-accent"></div>
                  ) : (
                    <div className="h-2 w-2 mt-1 rounded-full bg-background"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notification.status === "unread" ? "font-medium" : ""}`}>
                    {notification.json.texts[locale as keyof typeof notification.json.texts]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt ?? 0).toLocaleDateString(locale, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700 p-3">
          <div className="flex space-x-2">
            <Button
              className="flex-1"
              onClick={() => markAllAsRead.mutate()}
              disabled={Number(data?.totalNotRead ?? 0) === 0 || markAllAsRead.isLoading}
              loading={markAllAsRead.isLoading}
            >
              <CheckIcon className="mr-2 h-4 w-4" /> {content.markAllAsRead}
            </Button>
            <Link
              href="/notifications"
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-accent hover:underline"
            >
              {content.seeAll}
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const LoginModal = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { changeRole } = useUserRole()
  const [open, setOpen] = useAtom(openLoginModalAtom)

  const router = useRouter()
  const login = api.auth.login.useMutation({
    onSuccess: async (data) => {
      changeRole(data?.profile ?? undefined)
      setOpen(false)
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
    login.mutate({
      email: data.email,
      password: data.password,
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <LogInIcon className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <div className="bg-background flex w-full max-w-xl flex-col gap-3 px-4">
            <Form {...loginForm}>
              <form
                className="grid w-full gap-5"
                onSubmit={loginForm.handleSubmit(handleSubmit)}
              >
                <p className="text-2xl font-bold">{content.title}</p>
                <div className="flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    width={100}
                    height={100}
                    alt="ResistoHub"
                    className="flex duration-150 hover:cursor-pointer hover:opacity-80"
                  />
                </div>
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
                        <div className="relative flex w-full items-center">
                          <Input
                            placeholder={content.password}
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="w-full bg-transparent p-3 text-lg outline-none"
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
                <Button
                  size="lg"
                  className=""
                  aria-disabled={login.isLoading}
                  disabled={login.isLoading}
                  loading={login.isLoading}
                  type="submit"
                >
                  {content.login}
                </Button>
              </form>
            </Form>
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  router.push("/reset")
                }}
                className="font-semibold dark:text-white"
              >
                {content.forgotPassword}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  router.push("/signup")
                }}
                className="font-semibold dark:text-white"
              >
                {content.register}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const PageTitle = ({
  title,
  children,
}: {
  title: string
  children?: React.ReactNode
}) => {
  return (
    <div className="border-b border-border py-4 mb-6">
      <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white">
        {children}
        {title}
      </h1>
    </div>
  )
}

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useRouter()
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <HorizontalMenu />
      <CommandMenu />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}

const Footer = () => {
  const { locale } = useRouter()
  const { footer: content } = clientContent[locale as keyof typeof clientContent]

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-slate-900 dark:from-black dark:to-gray-950 text-white py-12 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-lg mb-4">ResistoHub</h4>
            <p className="text-gray-400 text-sm">
              {content.phrase}
            </p>
          </div>
          <div>
            <h5 className="font-semibold mb-4">{content.explore}</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/surveillance" className="hover:text-white transition">
                  {content.surveillance}
                </Link>
              </li>
              <li>
                <Link href="/bioinfo" className="hover:text-white transition">
                  {content.bioinformatics}
                </Link>
              </li>
              <li>
                <Link href="/protocols" className="hover:text-white transition">
                  {content.protocols}
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition">
                  {content.educational}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">{content.community}</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/community" className="hover:text-white transition">
                  {content.forum}
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition">
                  {content.negativeResults}
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition">
                  {content.publications}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">{content.support}</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  {content.contact}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            {content.copyright}
          </p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition">
              {content.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
