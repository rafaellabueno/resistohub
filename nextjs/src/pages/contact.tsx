import DefaultLayout from "@/layout/default";
import type React from "react";
import Image from "next/image";
import { Mail, MapPin, Phone, MessageSquare, Send, CheckCircle } from "lucide-react";
import { useRouter } from "next/router";
import { clientContent } from "@/language/client";
import { api } from "@/utils/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

export default function Contact() {
  const { locale } = useRouter();
  const { contact: content } = clientContent[locale as keyof typeof clientContent];
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const send = api.contact.sendEmail.useMutation({
    onSuccess: () => {
      toast({
        title: content.emailSentSuccess,
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: content.error,
        description: content.errorDescription,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    send.mutate(data);
  };

  const contactInfo = [
    {
      title: content.email,
      details: "resistohub@ufcspa.edu.br",
      icon: <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      color: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      title: content.address,
      details: "Sarmento Leite, 245 - Centro Histórico, Porto Alegre - RS, 90050-170",
      icon: <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      color: "bg-emerald-100 dark:bg-emerald-900/30"
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4 md:py-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Image
                src="/resistohub.png"
                width={60}
                height={60}
                alt="ResistoHub"
                className="hover:opacity-80 transition-opacity"
              />
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-300">
              {content.contactUs}
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {content.contactDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  {content.sendMessage}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {content.formDescription}
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">
                            {content.name}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={content.name}
                              className="h-11 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">
                            {content.emailAddress}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={content.emailAddress}
                              type="email"
                              className="h-11 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">
                          {content.subject}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={content.subject}
                            className="h-11 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">
                          {content.message}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={content.message}
                            className="resize-none min-h-[150px] bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={send.isLoading}
                    className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                  >
                    <Send className="h-5 w-5" />
                    {send.isLoading ? content.sending : content.sendMessage}
                  </Button>
                </form>
              </Form>
            </div>

            <div>
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  {content.contactInfo}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {content.contactInfoDescription}
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <Card
                    key={index}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
                  >
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className={`p-3 rounded-lg flex-shrink-0 ${item.color}`}>
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.details}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {content.responseTime}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {content.responseTimeDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

Contact.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};