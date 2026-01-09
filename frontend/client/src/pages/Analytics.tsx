import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatCost, formatLatency } from "@/lib/formatters";
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
    ReferenceLine
} from "recharts";
import { Activity } from "lucide-react";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    const [hasData, setHasData] = useState(false);

    // Modellerin listesini dinamik olarak belirle
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    // URL'den projectId al
    const searchParams = new URLSearchParams(window.location.search);
    const projectId = searchParams.get("projectId");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Query string oluştur
                const query = projectId ? `&projectId=${projectId}` : '';

                const [trendsRes, perfRes] = await Promise.all([
                    // Son 6 saati iste (Backend buna göre dönecek)
                    fetch(`${API_BASE}/api/metrics/timeseries-by-model?hours=6${query}`),
                    fetch(`${API_BASE}/api/metrics/by-provider?${projectId ? `projectId=${projectId}` : ''}`)
                ]);

                const trendsData = await trendsRes.json();
                const perfData = await perfRes.json();

                setModelTrends(trendsData);

                // Veri var mı kontrol et (Grafikler boş kalmasın diye)
                // Eğer tüm saatlerdeki tüm modellerin toplamı 0 ise veri yok demektir.
                let totalCalls = 0;
                trendsData.forEach((d: any) => {
                    Object.keys(d).forEach(k => {
                        if (k !== 'name' && typeof d[k] === 'number') totalCalls += d[k];
                    });
                });
                setHasData(totalCalls > 0);

                // Performance verisini işle (Flatten provider data)
                const perfFlat = perfData.map((p: any) => ({
                    name: p._id.model, // Model adını al
                    provider: p._id.provider,
                    avgLatency: p.calls > 0 ? Math.round((p.totalDuration || 0) / p.calls) : 0,
                    costPerToken: p.tokens > 0 ? (p.cost / p.tokens) : 0,
                    totalCost: p.cost,
                    totalCalls: p.calls
                }));
                setModelPerformance(perfFlat);

                // Trend verisindeki tüm unique modelleri bul
                const models = new Set<string>();
                trendsData.forEach((d: any) => {
                    Object.keys(d).forEach(k => {
                        if (k !== 'name') models.add(k);
                    });
                });
                setAvailableModels(Array.from(models));

                setLoading(false);
            } catch (error) {
                console.error("Error fetching analytics:", error);
                setLoading(false);
            }
        };

        fetchData();
        // 30 Saniyede bir yenile (Gerçek zamanlı hissiyat)
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Renk seçici fonksiyon
    const getModelColor = (modelName: string) => {
        if (MODEL_COLORS[modelName]) return MODEL_COLORS[modelName];
        return MODEL_COLORS['default'];
    };

    return (
        <DashboardLayout>
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Activity className="w-8 h-8 text-indigo-500" />
                    Analytics {projectId && <span className="text-xl font-normal text-muted-foreground ml-2">/ {projectId}</span>}
                </h1>
                <p className="text-muted-foreground mt-1">
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
                <div className="space-y-8">

                    {/* 1. CHART: HOURLY MODEL USAGE TRENDS (Multi-Line) */}
                    <div className="glassmorphic p-6 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <span className="w-2 h-6 bg-violet-500 rounded-full"></span>
                                Last 6 Hours Usage Trends
                            </h3>
                        </div>

                        <div className="h-[400px] w-full relative">
                            {!hasData ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg border border-white/5 z-10">
                                    <div className="text-4xl mb-4">📊</div>
                                    <h3 className="text-xl font-semibold text-white mb-2">No Data Available Yet</h3>
                                    <p className="text-muted-foreground max-w-md text-center">
                                        There's no usage data for the last 6 hours. Make some API calls to see the trends appear here!
                                    </p>
                                </div>
                            ) : null}

                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={modelTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
                                            background: "rgba(10, 10, 12, 0.95)",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            borderRadius: "12px",
                                            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
                                        }}
                                        itemStyle={{ fontSize: "13px", padding: "2px 0" }}
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
                        <p className="text-xs text-muted-foreground mt-4 text-center">
                            Shows the number of API calls made to each model per hour (Auto-refreshes every 30s).
                        </p>
                    </div>

                    {/* 2. CHART: MODEL COMPARISON (Performance & Cost) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Volume Comparison */}
                        <div className="glassmorphic p-6 rounded-xl border border-white/10">
                            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                                Total Call Volume by Model
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={modelPerformance} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
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
                                                background: "#0f172a",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                borderRadius: "8px"
                                            }}
                                        />
                                        <Bar dataKey="totalCalls" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20} name="Total Calls">
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Cost Efficiency */}
                        <div className="glassmorphic p-6 rounded-xl border border-white/10">
                            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                Total Cost Impact
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={modelPerformance} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
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
                                                background: "#0f172a",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                borderRadius: "8px"
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
