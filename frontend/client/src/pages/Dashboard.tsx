import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatCost, formatLatency } from "@/lib/formatters";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp, AlertCircle, Zap, Clock, DollarSign, CheckCircle2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Renk paleti
const MODEL_COLORS: Record<string, string> = {
    'gemini-2.5-flash': '#8b5cf6',
    'ollama-llama3': '#06b6d4',
    'gpt-4': '#10b981',
    'claude-3-opus': '#f43f5e',
    'default': '#64748b'
};

const CHART_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#ec4899'];

interface MetricCard {
    label: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
}

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<any>({});
    const [modelTrends, setModelTrends] = useState<any[]>([]);
    const [modelDistribution, setModelDistribution] = useState<any[]>([]);
    const [costTrends, setCostTrends] = useState<any[]>([]);
    const [latencyData, setLatencyData] = useState<any[]>([]);

    const searchParams = new URLSearchParams(window.location.search);
    const projectId = searchParams.get("projectId");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const query = projectId ? `&projectId=${projectId}` : '';

                // Fetch all data in parallel
                const [trendsRes, perfRes, logsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/metrics/timeseries-by-model?hours=24${query}`),
                    fetch(`${API_BASE}/api/metrics/by-provider?${projectId ? `projectId=${projectId}` : ''}`),
                    fetch(`${API_BASE}/api/logs?limit=1000${query}`)
                ]);

                const trendsData = await trendsRes.json();
                const perfData = await perfRes.json();
                const logsData = await logsRes.json();

                // Process trends
                setModelTrends(trendsData);

                // Process cost trends (same data, different format)
                const costData = trendsData.map((d: any) => ({
                    name: d.name,
                    cost: Object.keys(d).reduce((sum: number, k: string) => {
                        if (k !== 'name' && typeof d[k] === 'number') {
                            return sum + (d[k] * 0.001); // Mock cost calculation
                        }
                        return sum;
                    }, 0)
                }));
                setCostTrends(costData);

                // Process model distribution
                const logs = logsData.logs || [];
                const modelCounts: Record<string, number> = {};
                let totalLatency = 0;
                let successCount = 0;
                let errorCount = 0;

                logs.forEach((log: any) => {
                    modelCounts[log.model] = (modelCounts[log.model] || 0) + 1;
                    totalLatency += log.duration || 0;
                    if (log.status === 'success') successCount++;
                    else errorCount++;
                });

                const distribution = Object.entries(modelCounts).map(([model, count]) => ({
                    name: model,
                    value: count,
                    color: MODEL_COLORS[model] || MODEL_COLORS['default']
                }));
                setModelDistribution(distribution);

                // Process latency distribution
                const latencyBuckets: Record<string, number> = {
                    '0-100ms': 0,
                    '100-500ms': 0,
                    '500-1s': 0,
                    '1s+': 0
                };

                logs.forEach((log: any) => {
                    const latency = log.duration || 0;
                    if (latency < 100) latencyBuckets['0-100ms']++;
                    else if (latency < 500) latencyBuckets['100-500ms']++;
                    else if (latency < 1000) latencyBuckets['500-1s']++;
                    else latencyBuckets['1s+']++;
                });

                const latencyChartData = Object.entries(latencyBuckets).map(([range, count]) => ({
                    name: range,
                    count
                }));
                setLatencyData(latencyChartData);

                // Calculate metrics
                const totalRequests = logs.length;
                const totalCost = logs.reduce((sum: number, log: any) => sum + (log.cost || 0), 0);
                const avgLatency = totalRequests > 0 ? totalLatency / totalRequests : 0;
                const successRate = totalRequests > 0 ? ((successCount / totalRequests) * 100).toFixed(1) : 0;

                setMetrics({
                    totalRequests,
                    totalCost,
                    avgLatency,
                    successRate,
                    errorCount,
                    successCount
                });

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [projectId]);

    const metricCards: MetricCard[] = [
        {
            label: "Total Requests",
            value: metrics.totalRequests || 0,
            icon: <Activity className="w-5 h-5" />,
            color: "from-blue-500 to-blue-600"
        },
        {
            label: "Total Cost",
            value: `$${(metrics.totalCost || 0).toFixed(4)}`,
            icon: <DollarSign className="w-5 h-5" />,
            color: "from-emerald-500 to-emerald-600"
        },
        {
            label: "Avg Latency",
            value: `${formatLatency(metrics.avgLatency || 0)}`,
            icon: <Clock className="w-5 h-5" />,
            color: "from-purple-500 to-purple-600"
        },
        {
            label: "Success Rate",
            value: `${metrics.successRate || 0}%`,
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: "from-green-500 to-green-600"
        },
        {
            label: "Errors",
            value: metrics.errorCount || 0,
            icon: <AlertCircle className="w-5 h-5" />,
            color: "from-red-500 to-red-600"
        }
    ];

    return (
        <DashboardLayout>
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-indigo-500" />
                    Dashboard {projectId && <span className="text-xl font-normal text-muted-foreground ml-2">/ {projectId}</span>}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {projectId
                        ? `Real-time metrics and analytics for project: ${projectId}`
                        : "Real-time performance metrics and usage analytics across all models."
                    }
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {metricCards.map((card, idx) => (
                            <div key={idx} className="glassmorphic p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${card.color} text-white`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
                                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                                {card.change && (
                                    <p className={`text-xs mt-2 ${card.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {card.change > 0 ? '↑' : '↓'} {Math.abs(card.change)}% from last period
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Requests Trend */}
                        <div className="lg:col-span-2 glassmorphic p-6 rounded-xl border border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                                    Requests Over Time
                                </h3>
                                <Button variant="ghost" size="sm">Last 24h</Button>
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={modelTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: "12px" }} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                background: "rgba(10, 10, 12, 0.95)",
                                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                                borderRadius: "12px",
                                            }}
                                        />
                                        <Legend />
                                        {Object.keys(modelTrends[0] || {}).filter(k => k !== 'name').map((model, idx) => (
                                            <Line
                                                key={model}
                                                type="monotone"
                                                dataKey={model}
                                                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                                                strokeWidth={2}
                                                dot={false}
                                                connectNulls
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Model Distribution */}
                        <div className="glassmorphic p-6 rounded-xl border border-white/10">
                            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                                Model Distribution
                            </h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={modelDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {modelDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cost Trend */}
                        <div className="glassmorphic p-6 rounded-xl border border-white/10">
                            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                Cost Over Time
                            </h3>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={costTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: "12px" }} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                background: "rgba(10, 10, 12, 0.95)",
                                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                                borderRadius: "12px",
                                            }}
                                        />
                                        <Area type="monotone" dataKey="cost" stroke="#10b981" fillOpacity={1} fill="url(#colorCost)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Latency Distribution */}
                        <div className="glassmorphic p-6 rounded-xl border border-white/10">
                            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                                Latency Distribution
                            </h3>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={latencyData} layout="vertical" margin={{ left: 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={70} style={{ fontSize: "12px" }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{
                                                background: "#0f172a",
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                borderRadius: "8px"
                                            }}
                                        />
                                        <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
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
