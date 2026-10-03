import { Users, Building2, Briefcase, AlertCircle } from "lucide-react";
import { CountryChart } from "@/components/CountryChart";
import { InstitutionChart } from "@/components/InstitutionChart";
import { SpecialistChart } from "@/components/SpecialistChart";
import { api } from "@/utils/api";
import { clientContent } from '@/language/client';
import { useRouter } from 'next/router';

export function CommunityProfileSection() {
    const router = useRouter();
    const { locale } = router;
    const { index: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];

    const { data, isLoading, error } = api.stats.getUserProfile.useQuery(undefined, {
        refetchOnWindowFocus: false
    });

    const stats = [
        {
            label: content.countries,
            value: data?.byCountry?.length ?? 0,
            icon: Building2,
            color: "from-blue-500 to-indigo-500",
            bgColor: "bg-blue-50 dark:bg-blue-950/20",
        },
        {
            label: content.scientificDomains,
            value: data?.bySpecialist?.length ?? 0,
            icon: Briefcase,
            color: "from-green-500 to-lime-500",
            bgColor: "bg-green-50 dark:bg-green-950/20",
        },
        {
            label: content.institutions,
            value: data?.byInstitution?.length ?? 0,
            icon: Building2,
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-50 dark:bg-purple-950/20",
        },
    ];

    if (error) {
        return (
            <section className="py-20 px-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center p-8 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            <div>
                                <p className="text-red-600 dark:text-red-400 font-semibold">{content.error}</p>
                                <p className="text-sm text-red-500 dark:text-red-300">{error.message}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        {content.communityProfile}
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {content.exploreStatisticsAndDistributionOfResearchersAroundTheWorld}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={idx}
                                className={`p-6 rounded-xl ${stat.bgColor} border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all`}
                            >
                                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-4`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                    {isLoading ? "..." : stat.value}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {stat.label}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {content.countriesRepresented}
                            </h3>
                        </div>
                        <CountryChart
                            data={data?.byCountry?.map((country) => ({
                                name: country.name ?? '',
                                value: country.value,
                            })) ?? []}
                            isLoading={isLoading}
                            error={error}
                        />
                    </div>

                    <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {content.usersProfile}
                            </h3>
                        </div>
                        <SpecialistChart
                            data={data?.bySpecialist?.map(specialist => ({
                                name: specialist.name ?? '',
                                value: specialist.value,
                            })) ?? []}
                            isLoading={isLoading}
                            error={error}
                        />
                    </div>

                    <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {content.top10Institutions}
                            </h3>
                        </div>
                        <InstitutionChart
                            data={data?.byInstitution?.map(institution => ({
                                name: institution.name ?? '',
                                value: institution.value,
                            })) ?? []}
                            isLoading={isLoading}
                            error={error}
                        />
                    </div>
                </div>

                <div className="mt-12 p-6 bg-teal-50 dark:bg-teal-950/20 rounded-lg border border-teal-200 dark:border-teal-800">
                    <p className="text-sm text-teal-900 dark:text-teal-100">
                        <span className="font-semibold">{content.note}</span> {content.noteDescription}
                    </p>
                </div>
            </div>
        </section>
    );
}
