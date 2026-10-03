import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { clientContent } from '@/language/client';
import { useRouter } from 'next/router';

interface SpecialistChartProps {
    data: Array<{ name: string; value: number }>;
    isLoading: boolean;
    error?: Error | null;
}

const COLORS = [
    "#0f766e",
    "#14b8a6",
    "#2dd4bf",
    "#5eead4",
    "#99f6e4",
    "#0d9488",
    "#0f766e",
    "#134e4a",
];

export function SpecialistChart({
    data,
    isLoading,
    error,
}: SpecialistChartProps) {
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

    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const total = sortedData.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="w-full flex flex-col items-center gap-6">

            {/* Donut */}
            <div className="relative w-full max-w-[240px] aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={sortedData}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius="65%"
                            outerRadius="85%"
                            paddingAngle={3}
                        >
                            {sortedData.map((_, index) => (
                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold">
                        {total}
                    </span>
                    <span className="text-sm text-slate-500">
                        {content.specialists}
                    </span>
                </div>
            </div>

            {/* Legenda abaixo */}
            <div className="w-full space-y-4">
                {sortedData.map((item, index) => {
                    const percentage = ((item.value / total) * 100).toFixed(1);

                    return (
                        <div key={item.name} className="space-y-1 border-b pb-2 last:border-none">

                            <div className="flex items-start gap-3">
                                <div
                                    className="w-3 h-3 rounded-full mt-1 shrink-0"
                                    style={{
                                        backgroundColor:
                                            COLORS[index % COLORS.length],
                                    }}
                                />

                                <p className="text-sm break-words">
                                    {item.name}
                                </p>
                            </div>

                            <div className="flex gap-4 text-xs text-slate-500 pl-6">
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                    {item.value}
                                </span>
                                <span>{percentage}%</span>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}