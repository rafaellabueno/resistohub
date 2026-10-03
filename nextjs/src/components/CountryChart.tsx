import { Loader2 } from "lucide-react";
import { clientContent } from '@/language/client';
import { useRouter } from 'next/router';

interface CountryChartProps {
    data: Array<{ name: string; value: number }>;
    isLoading: boolean;
    error?: Error | null;
}

export function CountryChart({
    data,
    isLoading,
    error,
}: CountryChartProps) {
    const router = useRouter();
    const { locale } = router;
    const { index: content } = clientContent[locale as keyof typeof clientContent] ?? clientContent['en-us'];

    if (error) {
        return (
            <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg">
                <p className="text-red-600 font-semibold">
                    {content.errorLoadingData}
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                    {content.noDataAvailable}
                </p>
            </div>
        );
    }

    const sortedData = [...data]
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    const maxValue = Math.max(...sortedData.map(d => d.value));
    const total = sortedData.reduce((acc, d) => acc + d.value, 0);

    return (
        <div className="space-y-5">
            {sortedData.map((item, index) => {
                const percentage = (item.value / maxValue) * 100;
                const share = ((item.value / total) * 100).toFixed(1);

                return (
                    <div key={item.name} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="font-semibold text-teal-600">
                                    {index + 1}
                                </span>
                                <span className="truncate">
                                    {item.name}
                                </span>
                            </div>

                            <div className="flex gap-3 shrink-0">
                                <span className="font-semibold">
                                    {item.value}
                                </span>
                                <span className="text-slate-500">
                                    {share}%
                                </span>
                            </div>
                        </div>

                        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 rounded-full transition-all duration-700"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}