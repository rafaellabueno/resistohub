import { Loader2 } from "lucide-react";
import { clientContent } from '@/language/client';
import { useRouter } from 'next/router';

interface InstitutionChartProps {
    data: Array<{ name: string; value: number }>;
    isLoading: boolean;
    error?: Error | null;
}

export function InstitutionChart({
    data,
    isLoading,
    error,
}: InstitutionChartProps) {
    const router = useRouter();
    const { locale } = router;
    const { index: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8 bg-red-50 rounded-lg">
                <p className="text-red-600 font-semibold">
                    {content.errorLoadingData}
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                    {content.noDataAvailable}
                </p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map((d) => d.value));

    return (
        <div className="space-y-5">
            {data.map((item, index) => {
                const percentage = (item.value / maxValue) * 100;

                return (
                    <div key={item.name} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-teal-600">
                                    {index + 1}
                                </span>
                                <span className="text-slate-700 dark:text-slate-300">
                                    {item.name}
                                </span>
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {item.value}
                            </span>
                        </div>

                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-700"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}