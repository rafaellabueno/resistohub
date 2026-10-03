import DefaultLayout from "@/layout/default";
import { api } from "@/utils/api";
import { formatUtcDate } from "@/utils/formart";
import { useRouter } from "next/router";
import Link from "next/link";
import { Bell, ArrowLeft, ExternalLink, CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { clientContent } from "@/language/client";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";

export default function Notification() {
  const { locale, query, back } = useRouter();
  const id = Number(query.id as string);

  const { data, refetch } = api.notifications.getNotification.useQuery(id, {
    enabled: !!id,
  });

  const { notifications: content } =
    clientContent[locale as keyof typeof clientContent] || {};

  const markAsReadMutation = api.notifications.markNotificationAsRead.useMutation({
    onSuccess: () => {
      toast({
        title: content?.notificationsMarkedAsRead || "Notification marked as read",
        className: "bg-green-100 border-green-400 text-green-800",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: content?.errorMarkingNotificationsAsRead || "Error marking notification as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsRead = () => {
    if (data && data.status === "unread") {
      markAsReadMutation.mutate({ id: data.id });
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 md:py-24 text-center"
        >
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <Bell className="h-8 w-8 text-gray-400 dark:text-gray-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {content?.loading || "Loading notification..."}
          </h3>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/notifications"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {content?.notificationDetail || "Notification Detail"}
              </h1>
            </div>
            {data.status === "unread" && (
              <Button
                onClick={markAsRead}
                className="bg-teal-600 hover:bg-teal-700 text-white gap-2 w-full md:w-auto"
              >
                <CheckCircle className="h-4 w-4" />
                {content?.markAsRead || "Mark as read"}
              </Button>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className={cn(
              "border-2 transition-all",
              data.status === "unread"
                ? "border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            )}>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {data.status === "unread" ? (
                      <div className="h-4 w-4 rounded-full bg-teal-600 dark:bg-teal-400 ring-2 ring-teal-200 dark:ring-teal-800"></div>
                    ) : (
                      <CheckCircle className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <h2 className={cn(
                        "text-2xl font-bold leading-relaxed",
                        data.status === "read"
                          ? "text-gray-600 dark:text-gray-400"
                          : "text-gray-900 dark:text-white"
                      )}>
                        {data.json.texts[locale as keyof typeof data.json.texts]}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {formatUtcDate(data.createdAt, true)}
                      </p>
                    </div>

                    {data.json.links && data.json.links.length > 0 && (
                      <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          {content?.relatedLinks || "Related Links"}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {data.json.links.map((link) => (
                            <Link
                              key={link.titles[locale as keyof typeof link.titles]}
                              href={link.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-950/50 rounded-lg px-4 py-2 text-sm font-medium transition-colors border border-teal-200 dark:border-teal-800"
                            >
                              {link.titles[locale as keyof typeof link.titles]}
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide mb-2">
                            {content?.status || "Status"}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-3 h-3 rounded-full",
                              data.status === "read"
                                ? "bg-gray-400 dark:bg-gray-600"
                                : "bg-teal-600 dark:bg-teal-400"
                            )}></span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {data.status === "read"
                                ? (content?.read || "Read")
                                : (content?.unread || "Unread")}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wide mb-2">
                            {content?.createdAt || "Created At"}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatUtcDate(data.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex justify-center pt-4">
            <Link
              href="/notifications"
              className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {content?.backToNotifications || "Back to Notifications"}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

Notification.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};