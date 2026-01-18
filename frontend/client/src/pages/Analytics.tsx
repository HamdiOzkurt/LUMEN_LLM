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

// --- CONFIGURATION ---
const USE_MOCK_DATA = false; // Sunum için TRUE yapın
// ---------------------

const generateMockAnalyticsData = () => {
    const models = ['gemini-2.5-flash', 'gpt-4', 'claude-3-opus', 'ollama-llama3'];
    const hours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

    // Mock Trends
    const trends = hours.map(h => {
        const point: any = { name: h };
        models.forEach(m => {
            point[m] = Math.floor(Math.random() * 50) + 10;
        });
        return point;
    });

    // Mock Performance
    const performance = models.map(m => ({
        name: m,
        totalCalls: Math.floor(Math.random() * 1000) + 100,
        totalCost: Math.random() * 10,
        avgLatency: Math.floor(Math.random() * 2000) + 500
    }));

    return { trends, performance, models };
};

// Renk paleti (Modeller için tutarlı renkler)
const MODEL_COLORS: Record<string, string> = {
    'gemini-2.5-flash': '#8b5cf6', // Violet
    'ollama-llama3': '#06b6d4',    // Cyan
    'gpt-4': '#10b981',            // Emerald
    'claude-3-opus': '#f43f5e',    // Rose
    'default': '#64748b'           // Slate
};

export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [modelTrends, setModelTrends] = useState<any[]>([]);
    const [modelPerformance, setModelPerformance] = useState<any[]>([]);
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    // URL'den projectId al
    const searchParams = new URLSearchParams(window.location.search);
    const projectId = searchParams.get("projectId");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // --- MOCK DATA MODE ---
            if (USE_MOCK_DATA) {
                setTimeout(() => {
                    const mock = generateMockAnalyticsData();
                    setModelTrends(mock.trends);
                    setModelPerformance(mock.performance);
                    setAvailableModels(mock.models);
                    setLoading(false);
                }, 600);
                return;
            }

            try {
                const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const query = projectId ? `&projectId=${projectId}` : '';
                const res = await fetch(`${API_BASE}/api/logs?limit=1000${query}`);
                const json = await res.json();
                const logs = json.logs || [];

                // Process trends (last 6 hours)
                const hours6ago = new Date(Date.now() - 6 * 60 * 60 * 1000);
                const recentLogs = logs.filter((l: any) => new Date(l.timestamp || l.createdAt) > hours6ago);

                // Group by hour
                const hourlyGroups: any = {};
                recentLogs.forEach((log: any) => {
                    const hour = new Date(log.timestamp || log.createdAt).getHours();
                    const key = `${hour}:00`;
                    if (!hourlyGroups[key]) hourlyGroups[key] = {};
                    const model = log.model || 'unknown';
                    hourlyGroups[key][model] = (hourlyGroups[key][model] || 0) + 1;
                });

                const trendsData = Object.entries(hourlyGroups).map(([name, models]: any) => ({
                    name,
                    ...models
                }));

                // Get unique models
                const models = new Set<string>();
                recentLogs.forEach((l: any) => models.add(l.model || 'unknown'));

                // Process performance by model
                const modelGroups: any = {};
                logs.forEach((log: any) => {
                    const model = log.model || 'unknown';
                    if (!modelGroups[model]) {
                        modelGroups[model] = { calls: 0, cost: 0, latency: 0 };
                    }
                    modelGroups[model].calls++;
                    modelGroups[model].cost += (log.cost || 0);
                    modelGroups[model].latency += (log.duration || 0);
                });

                const perfData = Object.entries(modelGroups).map(([name, stats]: any) => ({
                    name,
                    totalCalls: stats.calls,
                    totalCost: stats.cost,
                    avgLatency: stats.calls > 0 ? stats.latency / stats.calls : 0
                }));

                setModelTrends(trendsData);
                setModelPerformance(perfData);
                setAvailableModels(Array.from(models));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching analytics:", error);
                setLoading(false);
            }
        };

        fetchData();
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
