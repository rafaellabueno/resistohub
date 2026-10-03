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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  InboxIcon
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
import { schemas } from "../schemas/zodSchemas"

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
      bioinfo: "Bioinformática",
      epidemiology: "Epidemiologia",
      comunity: "Comunidade",
      education: "Educacional"
    }
  }

  const navLinks = [
    { href: "/", label: content.home, icon: <Home size={18} /> },
    { href: "/bioinfo", label: content.bioinfo, icon: <Laptop size={18} /> },
    { href: "/community", label: content.comunity, icon: <MessagesSquare size={18} /> },
    { href: "/educational", label: content.education, icon: <Book size={18} /> },
  ];

  return (
    <div className="bg-background border-b border-border sticky top-0 z-10 w-full bg-teal-900">
      <div className="container mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
        <div className="flex items-center">
          <Image
            src="/logo.png"
            width={60}
            height={60}
            alt="ResistoHub"
            className="flex duration-150 hover:cursor-pointer hover:opacity-80 mr-4"
          />

          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 font-medium ${router.pathname === link.href ? 'text-teal-200' : 'text-white hover:text-teal-200'}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-xl text-white dark:text-white">
          {me.isError && (
            <LoginModal />
          )}
          {me.isSuccess && me.data && (
            <Notification />
          )}
          <CommandMenu />
          <PopoverSettigns me={me.data} />

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-teal-800">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle className="flex items-center">
                  <Image
                    src="/logo.png"
                    width={40}
                    height={40}
                    alt="ResistoHub"
                    className="mr-2"
                  />
                  ResistoHub
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 p-2 rounded-md transition-colors ${router.pathname === link.href ? 'bg-teal-100 text-teal-800' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {link.icon}
                    <span className="text-lg">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}

export const Footer = () => {
  const { locale } = useRouter()
  const { footer: content } = clientContent[locale as keyof typeof clientContent] || {
    footer: {
      copyright: "© 2025 BiotecLab - UFCSPA. All rights reserved.",
      terms: "Terms",
      privacy: "Privacy",
      contact: "Contact"
    }
  }

  return (
    <footer className="bg-background border-t border-border py-4 md:py-6 mt-auto">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="text-muted-foreground text-sm md:text-base mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <Image
                src="/bioteclab.png"
                width={40}
                height={40}
                alt="BiotecLab"
                className="mr-2 duration-150 hover:cursor-pointer hover:opacity-80"
              />
              <span> {content.copyright || " © 2025 BiotecLab - UFCSPA. All rights reserved."}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-4 md:space-x-6">
            <Link href="/terms" className="text-muted-foreground hover:text-primary text-sm">
              {content.terms || "Terms"}
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary text-sm">
              {content.contact || "Contact"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function DefaultLayout(props: { children: React.ReactNode }) {
  const [animate] = useAutoAnimate()

  return (
    <div className={cn("bg-background w-full flex flex-col min-h-screen", lato.variable, lato.className)}>
      <div className="flex flex-col flex-grow">
        <HorizontalMenu />
        <main
          className="mx-auto flex flex-col flex-grow w-full max-w-[calc(100vw-2rem)] px-2 lg:px-4 pb-8 md:pb-12 2xl:container"
          ref={animate}
        >
          {props.children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

export const LanguageSwitch = () => {
  const { locale } = useRouter()
  const { popoverSettings: content } = clientContent[locale as keyof typeof clientContent]

  const handleLanguageChange = useChangeLang()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2">
        <Globe /> {content.lang}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuCheckboxItem
            onCheckedChange={() => handleLanguageChange("pt-br")}
            checked={locale === "pt-br"}
            className="bg-secondary"
          >
            pt-br
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            onCheckedChange={() => handleLanguageChange("en-us")}
            checked={locale === "en-us"}
            className="bg-secondary"
          >
            en-us
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            onCheckedChange={() => handleLanguageChange("es-es")}
            checked={locale === "es-es"}
            className="bg-secondary"
          >
            es-es
          </DropdownMenuCheckboxItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

const ThemeSwitch = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { locale } = useRouter()
  const { popoverSettings: content } = clientContent[locale as keyof typeof clientContent]
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2">
        <Palette /> {content.theme}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuCheckboxItem
            onCheckedChange={() => setTheme("system")}
            checked={theme === "system"}
            className="bg-secondary"
          >
            System
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            onCheckedChange={() => setTheme("dark")}
            checked={theme === "dark"}
            className="bg-secondary"
          >
            Dark
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            onCheckedChange={() => setTheme("light")}
            checked={theme === "light"}
            className="bg-secondary"
          >
            Light
          </DropdownMenuCheckboxItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

export const PopoverSettigns = ({ me }: { me: any }) => {
  const router = useRouter()
  const { locale } = router
  const { popoverSettings: content } =
    clientContent[locale as keyof typeof clientContent]

  const logoutMutation = api.auth.logout.useMutation({
    onSuccess: () => {
      router.push("/")
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Settings width={22} />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>{content.title}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ThemeSwitch />
        <LanguageSwitch />

        {me && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/user/" + me.id)}
              className="gap-2"
            >
              <UserCog /> {content.profile}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => logoutMutation.mutate()}
              className="gap-2"
              disabled={logoutMutation.isLoading}
            >
              <DoorClosed /> {content.logout}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const toggleButton = atom(false)

export const PageTitle = ({
  title,
  children,
}: {
  title: string
  children?: React.ReactNode
}) => {
  return (
    <div className="border-rounded border-border border-b-[1px] py-2 text-3xl font-semibold">
      <h1 className="flex items-center gap-2 text-gray-800 duration-300 dark:text-[#fff]">
        {children}
        {title}
      </h1>
    </div>
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
      <PopoverTrigger className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200">
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
                className="flex items-start px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
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

        <div className="border-t border-gray-100 p-3">
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
          <Button variant="ghost" size="icon">
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