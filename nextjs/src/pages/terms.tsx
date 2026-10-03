import DefaultLayout from "@/layout/default";
import type React from "react";
import Image from "next/image";
import { Shield, BookOpen, Scale, AlertCircle, FileText, CheckCircle, ChevronDown } from "lucide-react";
import { useRouter } from "next/router";
import { clientContent } from "@/language/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function TermsOfUse() {
  const { locale } = useRouter();
  const { termsOfUse: content } = clientContent[locale as keyof typeof clientContent];

  const termsSections = [
    {
      id: "acceptance",
      title: content.acceptanceTitle,
      content: content.acceptanceContent,
      icon: <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
    },
    {
      id: "use",
      title: content.useTitle,
      content: content.useContent,
      icon: <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
    },
    {
      id: "privacy",
      title: "Política de Privacidade",
      content: content.privacyContent,
      icon: <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
    },
    {
      id: "intellectual",
      title: content.intellectualTitle,
      content: content.intellectualContent,
      icon: <Scale className="h-6 w-6 text-orange-600 dark:text-orange-400" />
    },
    {
      id: "liability",
      title: content.liabilityTitle,
      content: content.liabilityContent,
      icon: <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
    }
  ];

  return (
    <>
      {/* ============ HERO SECTION ============ */}
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
              {content.termsOfUseTitle}
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {content.termsOfUseDescription}
            </p>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <section className="py-16 px-4 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto">
          {/* Last Updated Info */}
          <div className="mb-12 p-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
            <div className="p-3 bg-slate-200 dark:bg-slate-800 rounded-lg">
              <FileText className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {content.lastUpdated}: {content.lastUpdatedDate}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {content.introduction}
              </p>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="grid gap-6 mb-16">
            {termsSections.map((section) => (
              <Card key={section.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
                      {section.icon}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                  </div>
                  <div className="ml-16 prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 p-8 md:p-12 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Perguntas Frequentes
            </h2>

            <Accordion type="single" collapsible className="w-full space-y-3">
              <AccordionItem value="faq-1" className="border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-4 data-[state=open]:bg-white dark:data-[state=open]:bg-gray-800">
                <AccordionTrigger className="text-gray-900 dark:text-white font-semibold text-base md:text-lg hover:text-slate-700 dark:hover:text-slate-300 py-0">
                  {content.faq1Question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300 text-sm md:text-base pt-4 pb-0">
                  {content.faq1Answer}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-4 data-[state=open]:bg-white dark:data-[state=open]:bg-gray-800">
                <AccordionTrigger className="text-gray-900 dark:text-white font-semibold text-base md:text-lg hover:text-slate-700 dark:hover:text-slate-300 py-0">
                  {content.faq2Question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300 text-sm md:text-base pt-4 pb-0">
                  {content.faq2Answer}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="border border-gray-200 dark:border-gray-700 rounded-lg px-6 py-4 data-[state=open]:bg-white dark:data-[state=open]:bg-gray-800">
                <AccordionTrigger className="text-gray-900 dark:text-white font-semibold text-base md:text-lg hover:text-slate-700 dark:hover:text-slate-300 py-0">
                  {content.faq3Question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300 text-sm md:text-base pt-4 pb-0">
                  {content.faq3Answer}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Contact Section */}
          <div className="text-center p-8 bg-gradient-to-r from-slate-900 to-gray-900 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-700 dark:border-gray-700">
            <p className="text-gray-300 text-lg mb-4">
              {content.contactForQuestions}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-gray-100 transition-all"
            >
              {content.contactPage}
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

TermsOfUse.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};