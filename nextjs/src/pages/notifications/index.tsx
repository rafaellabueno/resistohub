import DefaultLayout from "@/layout/default"
import { api } from "@/utils/api"
import { formatUtcDate } from "@/utils/formart"
import { useRouter } from "next/router"
import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { SystemPagination } from "@/components/pagination"
import { Bell, CheckCircle, Circle, Trash2 } from "lucide-react"
import { useState } from "react"
import { clientContent } from "@/language/client"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function Notifications() {
  const { locale, query } = useRouter()
  const search = useSearchParams()
  const page = search.get("page") ? Number(search.get("page")) : 1
  const [activeFilter, setActiveFilter] = useState("all")
  const { notifications: content } =
    clientContent[locale as keyof typeof clientContent];

  const { data, refetch } = api.notifications.getNotifications.useQuery(
    {
      page: page - 1,
      limit: 10,
      status: activeFilter as "all" | "read" | "unread",
    },
    {
      keepPreviousData: true,
    },
  )

  const markAsReadMutation = api.notifications.markNotificationAsRead.useMutation({
    onSuccess: () => {
      toast({
        title: content.notificationsMarkedAsRead,
        className: "bg-green-100 border-green-400 text-green-800",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: content.errorMarkingNotificationsAsRead,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filterOptions = [
    { id: "all", label: "Todas" },
    { id: "unread", label: "Não lidas" },
    { id: "read", label: "Lidas" }
  ]

  const markAsRead = (id: number, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log(`Marcando notificação ${id} como lida`)
    markAsReadMutation.mutate({ id: id });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-teal-100 dark:bg-teal-950/30 rounded-lg">
                <Bell className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {content.title}
                </h1>
              </div>
              <Badge className="bg-teal-100 dark:bg-teal-950/40 hover:bg-teal-300 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-4 py-2 text-sm font-semibold">
                {data?.total || 0} {content.total}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {content.noNotifications || "Gerencie suas notificações"}
            </p>
          </div>

          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveFilter(option.id)}
                className={cn(
                  "px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px",
                  activeFilter === option.id
                    ? "border-b-teal-600 text-teal-600 dark:text-teal-400"
                    : "border-b-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {data?.notifications && data.notifications.length > 0 ? (
              data.notifications.map((notification, idx) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Link href={`/notifications/${notification.id}`}>
                    <Card className={cn(
                      "group cursor-pointer border transition-all hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800",
                      notification.status === "unread"
                        ? "border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20"
                        : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {notification.status === "unread" ? (
                              <div className="h-3 w-3 rounded-full bg-teal-600 dark:bg-teal-400 ring-2 ring-teal-200 dark:ring-teal-800"></div>
                            ) : (
                              <CheckCircle className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <p className={cn(
                                "text-sm leading-relaxed line-clamp-2",
                                notification.status === "unread"
                                  ? "font-semibold text-gray-900 dark:text-white"
                                  : "font-medium text-gray-700 dark:text-gray-400"
                              )}>
                                {notification.json.texts[locale as keyof typeof notification.json.texts]}
                              </p>

                              {notification.status === "unread" && (
                                <button
                                  onClick={(e) => markAsRead(notification.id, e)}
                                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-teal-100 dark:hover:bg-teal-950/30 rounded-lg"
                                >
                                  <CheckCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                </button>
                              )}
                            </div>

                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-2">
                              <span>{formatUtcDate(notification.createdAt, true)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <Bell className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {content.noNotifications}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                  {activeFilter === "unread"
                    ? content.noNotificationsUnread
                    : activeFilter === "read"
                      ? content.noNotificationsRead
                      : content.noNotifications}
                </p>
              </motion.div>
            )}
          </div>

          {data?.totalPages && data.totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <SystemPagination totalPages={data.totalPages} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

Notifications.getLayout = function getLayout(page: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined) {
  return <DefaultLayout>{page}</DefaultLayout>
}