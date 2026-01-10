import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatCost } from "@/lib/formatters";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";

// Renk paleti (Modeller için tutarlı renkler)
const MODEL_COLORS: Record<string, string> = {
    'gemini-2.5-flash': '#8b5cf6', // Violet
    'ollama-llama3': '#06b6d4',    // Cyan
    'gpt-4': '#10b981',            // Emerald
    'claude-3-opus': '#f43f5e',    // Rose
    'default': '#64748b'           // Slate
};

// --- MOCK DATA GENERATOR ---
const generateMockAnalyticsData = () => {
    // 1. Trends Data (Last 6 hours)
    const hours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
    const trends = hours.map(hour => ({
        name: hour,
        'gpt-4': Math.floor(Math.random() * 50) + 10,
        'gemini-2.5-flash': Math.floor(Math.random() * 80) + 20,
        'claude-3-opus': Math.floor(Math.random() * 30) + 5,
        'ollama-llama3': Math.floor(Math.random() * 20) + 0,
    }));

    // 2. Performance Data
    const perf = [
        { name: 'gemini-2.5-flash', totalCalls: 450, totalCost: 1.25, avgLatency: 800 },
        { name: 'gpt-4', totalCalls: 320, totalCost: 15.50, avgLatency: 1200 },
        { name: 'claude-3-opus', totalCalls: 180, totalCost: 8.75, avgLatency: 2500 },
        { name: 'ollama-llama3', totalCalls: 95, totalCost: 0.00, avgLatency: 150 },
    ];

    return { trends, perf };
};
// ----------------------------

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [modelTrends, setModelTrends] = useState<any[]>([]);
    const [modelPerformance, setModelPerformance] = useState<any[]>([]);
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    // URL'den projectId al
    const searchParams = new URLSearchParams(window.location.search);
    const projectId = searchParams.get("projectId");

    useEffect(() => {
        // --- MOCK DATA MODE ---
        // Backend yerine buradaki sahte veriyi kullanıyoruz
        setTimeout(() => {
            const mockData = generateMockAnalyticsData();

            setModelTrends(mockData.trends);
            setModelPerformance(mockData.perf);
            setAvailableModels(['gpt-4', 'gemini-2.5-flash', 'claude-3-opus', 'ollama-llama3']);
            setLoading(false);
        }, 800);

        // API Kullanmak istediğinde burayı aç, üstteki mock kısmını sil:
        /*
        const fetchData = async () => {
            try {
                const query = projectId ? `&projectId=${projectId}` : '';
                const [trendsRes, perfRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/metrics/timeseries-by-model?hours=6${query}`),
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/metrics/by-provider?${projectId ? `projectId=${projectId}` : ''}`)
                ]);
                // ... (data işleme kodları)
            } catch (error) console.error(error);
        };
        fetchData();
        */
    }, [projectId]);

    const getModelColor = (modelName: string) => MODEL_COLORS[modelName] || MODEL_COLORS['default'];

    return (
        <DashboardLayout>
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Activity className="w-8 h-8 text-indigo-500" />
                    Analytics {projectId && <span className="text-xl font-normal text-gray-500 dark:text-gray-400 ml-2">/ {projectId}</span>}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {projectId
                        ? `Detailed performance insights for project: ${projectId}`
                        : "Real-time performance metrics and usage trends across all models."
                    }
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="space-y-8 mt-8">

                    {/* 1. CHART: HOURLY MODEL USAGE TRENDS */}
                    <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-2 h-6 bg-violet-500 rounded-full"></span>
                                Last 6 Hours Usage Trends
                            </h3>
                        </div>

                        <div className="h-[400px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={modelTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94a3b8"
                                        style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#1e1e24",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            borderRadius: "12px",
                                            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
                                            color: "#fff"
                                        }}
                                        itemStyle={{ fontSize: "13px", padding: "2px 0", color: "#fff" }}
                                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />

                                    {availableModels.map((model) => (
                                        <Line
                                            key={model}
                                            type="monotone"
                                            dataKey={model}
                                            stroke={getModelColor(model)}
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 0, fill: getModelColor(model) }}
                                            activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                                            name={model}
                                            connectNulls
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. CHART: MODEL COMPARISON */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Volume Comparison */}
                        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                                Total Call Volume by Model
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={modelPerformance} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" horizontal={true} vertical={false} />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            stroke="#94a3b8"
                                            width={100}
                                            style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{
                                                background: "#1e1e24",
                                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                                borderRadius: "8px",
                                                color: "#fff"
                                            }}
                                        />
                                        <Bar dataKey="totalCalls" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20} name="Total Calls" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Cost Efficiency */}
                        <div className="bg-white dark:bg-[#16161A] p-6 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                Total Cost Impact
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={modelPerformance} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" horizontal={true} vertical={false} />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            stroke="#94a3b8"
                                            width={100}
                                            style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{
                                                background: "#1e1e24",
                                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                                borderRadius: "8px",
                                                color: "#fff"
                                            }}
                                            formatter={(val: number) => formatCost(val)}
                                        />
                                        <Bar dataKey="totalCost" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} name="Total Cost" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </DashboardLayout>
    );
}
