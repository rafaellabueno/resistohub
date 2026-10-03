import DefaultLayout, { openLoginModalAtom } from "@/layout/default";
import type React from "react";
import Image from "next/image";
import {
  Activity,
  Microscope,
  ArrowRight,
  ShieldCheck,
  Users,
  Database,
  Sparkles,
  Zap,
  Globe,
  Code2,
  BarChart3,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/router";
import { clientContent } from "@/language/client";
import Link from "next/link";
import { api } from "@/utils/api";
import { useAtom } from "jotai";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommunityProfileSection } from "@/components/CommunityProfileSection";

export default function Home() {
  const { locale } = useRouter();
  const { index: content } =
    clientContent[locale as keyof typeof clientContent] ?? clientContent["en-us"];

  const user = api.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 3;
    },
  });

  const dataStats = api.stats.getStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 3;
    },
  });

  const isAuthenticated = !!user.data?.id;
  const [openLoginModal, setOpenLoginModal] = useAtom(openLoginModalAtom);

  const collaborators = [
    {
      name: "Adriana Seixas",
      role: content.roleAdriana,
      institution: content.intitutionRafaellaAdriana,
      image: "/adriana.jpg",
    },
    {
      name: "Camila Gazolla Volpiano",
      role: content.roleCamila,
      institution: "Baker Heart and Diabetes Institute",
      image: "/camila.jpg",
    },
    {
      name: "Rafaella Bueno",
      role: content.roleRafaella,
      institution: content.intitutionRafaellaAdriana,
      image: "/rafaella.jpg",
    },
  ];

  const features = [
    {
      icon: Activity,
      title: content.surveillance,
      description: content.surveillanceDescription,
      href: "/surveillance",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800",
    },
    {
      icon: Database,
      title: content.bioinfo,
      description: content.bioinfoDescription,
      href: "/bioinfo",
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50 dark:bg-teal-950/20",
      borderColor: "border-teal-200 dark:border-teal-800",
      badge: "Tools • Databases • Pipelines",
    },
    {
      icon: Microscope,
      title: content.protocols,
      description: content.protocolsDescription,
      href: "/protocols",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      icon: Users,
      title: content.community,
      description: content.communityDescription,
      href: "/community",
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      badge: "Forum • Negative Results • Publications",
    },
    {
      icon: BookOpen,
      title: content.educational,
      description: content.educationalDescription,
      href: "/educational",
      color: "from-green-500 to-lime-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
    }
  ];

  const stats = [
    { label: content.activeResearchers, value: dataStats.data?.totalUsers, icon: Users },
    { label: content.toolsAndDatabases, value: dataStats.data?.totalTools, icon: Database },
    { label: content.publishedProtocols, value: dataStats.data?.totalProtocols, icon: BookOpen },
    { label: content.communityDiscussions, value: dataStats.data?.totalQuestions, icon: Activity },
  ];

  const highlights = [
    {
      icon: Sparkles,
      title: content.integratedPlatform,
      description: content.integratedPlatformDescription,
    },
    {
      icon: Zap,
      title: content.realTimeUpdates,
      description: content.realTimeUpdatesDescription,
    },
    {
      icon: Globe,
      title: content.globalCollaboration,
      description: content.globalCollaborationDescription,
    },
    {
      icon: Code2,
      title: content.standardizedPipelines,
      description: content.standardizedPipelinesDescription,
    },
    {
      icon: BarChart3,
      title: content.dataDrivenInsights,
      description: content.dataDrivenInsightsDescription,
    },
    {
      icon: BookOpen,
      title: content.knowledgeRepository,
      description: content.knowledgeRepositoryDescription,
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 text-white py-24 px-4 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-500/10 text-teal-300 text-sm font-medium mb-8 border border-teal-500/30 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 mr-2" />
              <span>{content.subtitle}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-teal-200 to-cyan-200">
              ResistoHub
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4 leading-relaxed">
              {content.description ||
                "The unified ecosystem for Genomics, Bioinformatics, and Clinical surveillance."}
            </p>

            <p className="text-lg text-teal-200/80 max-w-2xl mx-auto mb-10">
              {content.objective}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <button
                  onClick={() => setOpenLoginModal(true)}
                  className="group relative px-8 py-4 bg-white text-slate-900 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <span className="flex items-center justify-center">
                    {content.getStarted || "Get Started"}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                  </span>
                </button>
              ) : null}
              <Link
                href="/community"
                className="px-8 py-4 bg-teal-600/20 border-2 border-teal-400 text-white font-bold rounded-lg hover:bg-teal-600/40 transition-all hover:scale-105"
              >
                {content.joinTheCommunity || "Join Community"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="text-center p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
                >
                  <div className="flex justify-center mb-3">
                    <Icon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {content.exploreEcosystem}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {content.exploreSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Link key={idx} href={feature.href} className="group">
                  <Card className={`h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 ${feature.borderColor} ${feature.bgColor}`}>
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div
                          className={`p-4 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-8 h-8" />
                        </div>
                        {feature.badge && (
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                            {feature.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {feature.title}
                      </h3>

                      <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                        {feature.description}
                      </p>

                      <div className="flex items-center text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-2 transition-transform">
                        {content.explore} <ChevronRight className="w-5 h-5 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <CommunityProfileSection />

      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-black border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-16 text-center">
            {content.difference}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <Icon className="w-10 h-10 text-teal-600 dark:text-teal-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {content.ready}
          </h2>
          <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">
            {content.start}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <button
                onClick={() => setOpenLoginModal(true)}
                className="px-8 py-4 bg-white text-teal-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:scale-105"
              >
                {content.createYourAccount}
              </button>
            ) : null}
            <Link
              href="/community"
              className="px-8 py-4 bg-teal-700 border-2 border-white text-white font-bold rounded-lg hover:bg-teal-800 transition-all hover:scale-105"
            >
              {content.exploreCommunity}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {content.collaborators}
            </h2>
            <div className="h-1 w-24 bg-teal-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {collaborators.map((collaborator, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>

                  <div className="relative w-48 h-48 rounded-full border-4 border-teal-200 dark:border-teal-800 shadow-xl overflow-hidden">
                    <Image
                      src={collaborator.image}
                      alt={collaborator.name}
                      width={192}
                      height={192}
                      quality={100}
                      className="rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {collaborator.name}
                </h3>
                <p className="text-teal-600 dark:text-teal-400 text-center font-semibold mb-2">
                  {collaborator.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-xs">
                  {collaborator.institution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};
