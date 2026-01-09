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
    HistogramChart,
    Histogram,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { TrendingUp, AlertCircle, Zap, Clock, DollarSign, CheckCircle2, Activity, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Renk paleti
const MODEL_COLORS: Record<string, string> = {
    'gemini-2.5-flash': '#8b5cf6',
    'ollama-llama3': '#06b6d4',
    'gpt-4': '#10b981',
    'claude-3-opus': '#f43f5e',
    'o1': '#f59e0b',
    'deepseek': '#ec4899',
    'default': '#64748b'
};

const PROVIDER_COLORS: Record<string, string> = {
    'openai': '#10b981',
    'anthropic': '#f59e0b',
    'google': '#3b82f6',
    'ollama': '#06b6d4',
    'default': '#64748b'
};

interface MetricCard {
    label: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
}

interface DashboardMetrics {
    totalRequests: number;
    totalCost: number;
    avgLatency: number;
    avgTTFT: number;
    successRate: number;
    totalTokens: number;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalReasoningTokens: number;
}

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalRequests: 0,
        totalCost: 0,
        avgLatency: 0,
        avgTTFT: 0,
        successRate: 0,
        totalTokens: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalReasoningTokens: 0,
    });

    const [requestTrends, setRequestTrends] = useState<any[]>([]);
    const [ttftDistribution, setTTFTDistribution] = useState<any[]>([]);
    const [tokenBreakdown, setTokenBreakdown] = useState<any[]>([]);
    const [providerMetrics, setProviderMetrics] = useState<any[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d'>('24h');
    const [selectedProvider, setSelectedProvider] = useState<string>('all');

    const searchParams = new URLSearchParams(window.location.search);
    const projectId = searchParams.get("projectId");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const query = projectId ? `&projectId=${projectId}` : '';
                const hoursMap = { '24h': 24, '7d': 168, '30d': 720 };
                const hours = hoursMap[dateRange];

                const [trendsRes, logsRes, perfRes] = await Promise.all([
                    fetch(`${API_BASE}/api/metrics/timeseries-by-model?hours=${hours}${query}`),
                    fetch(`${API_BASE}/api/logs?limit=2000${query}`),
                    fetch(`${API_BASE}/api/metrics/by-provider?${projectId ? `projectId=${projectId}` : ''}`)
                ]);

                const trendsData = await trendsRes.json();
                const logsData = await logsRes.json();
                const perfData = await perfRes.json();

                const logs = logsData.logs || [];

                // Calculate metrics
                let totalCost = 0;
                let totalLatency = 0;
                let totalTTFT = 0;
                let successCount = 0;
                let totalPromptTokens = 0;
                let totalCompletionTokens = 0;
                let totalReasoningTokens = 0;

                const ttftBuckets: Record<string, number> = {
                    '0-50ms': 0,
                    '50-100ms': 0,
                    '100-500ms': 0,
                    '500-1s': 0,
                    '1s+': 0
                };

                const providerMap: Record<string, any> = {};

                logs.forEach((log: any) => {
                    totalCost += log.cost || 0;
                    totalLatency += log.duration || 0;
                    totalTTFT += log.ttft || log.duration || 0;
                    totalPromptTokens += log.promptTokens || 0;
                    totalCompletionTokens += log.completionTokens || 0;
                    totalReasoningTokens += log.reasoningTokens || 0;

                    if (log.status === 'success') successCount++;

                    // TTFT Distribution
                    const ttft = log.ttft || log.duration || 0;
                    if (ttft < 50) ttftBuckets['0-50ms']++;
                    else if (ttft < 100) ttftBuckets['50-100ms']++;
                    else if (ttft < 500) ttftBuckets['100-500ms']++;
                    else if (ttft < 1000) ttftBuckets['500-1s']++;
                    else ttftBuckets['1s+']++;

                    // Provider metrics
                    if (!providerMap[log.provider]) {
                        providerMap[log.provider] = { calls: 0, cost: 0, latency: 0 };
                    }
                    providerMap[log.provider].calls++;
                    providerMap[log.provider].cost += log.cost || 0;
                    providerMap[log.provider].latency += log.duration || 0;
                });

                const totalRequests = logs.length;
                const totalTokens = totalPromptTokens + totalCompletionTokens + totalReasoningTokens;

                setMetrics({
                    totalRequests,
                    totalCost,
                    avgLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
                    avgTTFT: totalRequests > 0 ? totalTTFT / totalRequests : 0,
                    successRate: totalRequests > 0 ? ((successCount / totalRequests) * 100) : 0,
                    totalTokens,
                    totalPromptTokens,
                    totalCompletionTokens,
                    totalReasoningTokens,
                });

                // TTFT Distribution Chart
                const ttftChartData = Object.entries(ttftBuckets).map(([range, count]) => ({
                    name: range,
                    count,
                    fill: '#06b6d4'
                }));
                setTTFTDistribution(ttftChartData);

                // Token Breakdown
                const tokenData = [
                    { name: 'Prompt', value: totalPromptTokens, fill: '#8b5cf6' },
                    { name: 'Completion', value: totalCompletionTokens, fill: '#10b981' },
                    { name: 'Reasoning', value: totalReasoningTokens, fill: '#f59e0b' }
                ];
                setTokenBreakdown(tokenData);

                // Provider Metrics
                const providerData = Object.entries(providerMap).map(([provider, data]: [string, any]) => ({
                    name: provider,
                    calls: data.calls,
                    cost: data.cost,
                    avgLatency: data.latency / data.calls,
                    fill: PROVIDER_COLORS[provider] || PROVIDER_COLORS['default']
                }));
                setProviderMetrics(providerData);

                // Request trends
                setRequestTrends(trendsData);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [projectId, dateRange]);

    const metricCards: MetricCard[] = [
        {
            label: "Total Requests",
            value: metrics.totalRequests,
            icon: <Activity className="w-5 h-5" />,
            color: "from-blue-500 to-blue-600"
        },
        {
            label: "Total Cost",
            value: `$${metrics.totalCost.toFixed(4)}`,
            icon: <DollarSign className="w-5 h-5" />,
            color: "from-emerald-500 to-emerald-600"
        },
        {
            label: "Avg Latency",
            value: `${formatLatency(metrics.avgLatency)}`,
            icon: <Clock className="w-5 h-5" />,
            color: "from-purple-500 to-purple-600"
        },
        {
            label: "Avg TTFT",
            value: `${formatLatency(metrics.avgTTFT)}`,
            icon: <Zap className="w-5 h-5" />,
            color: "from-orange-500 to-orange-600"
        },
        {
            label: "Success Rate",
            value: `${metrics.successRate.toFixed(1)}%`,
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: "from-green-500 to-green-600"
        }
    ];

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-primary" />
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time metrics and performance analytics
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
                        {(['24h', '7d', '30d'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                                    dateRange === range
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    <select
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value)}
                        className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    >
                        <option value="all">All Providers</option>
                        {providerMetrics.map(p => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                </div>
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
                            <div key={idx} className="instrument-card p-6 hover:border-primary/30">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${card.color} text-white`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1 label-silence">{card.label}</p>
                                <p className="text-2xl font-bold text-foreground metrics-display">{card.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Requests Over Time */}
                        <div className="lg:col-span-2 instrument-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                                    Requests Over Time
                                </h3>
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={requestTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                        <XAxis dataKey="name" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                background: "var(--card)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Legend />
                                        {Object.keys(requestTrends[0] || {}).filter(k => k !== 'name').map((model, idx) => (
                                            <Line
                                                key={model}
                                                type="monotone"
                                                dataKey={model}
                                                stroke={Object.values(MODEL_COLORS)[idx % Object.values(MODEL_COLORS).length]}
                                                strokeWidth={2}
                                                dot={false}
                                                connectNulls
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Token Breakdown */}
                        <div className="instrument-card p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                                Token Breakdown
                            </h3>
                            <div className="space-y-4">
                                {tokenBreakdown.map((token, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">{token.name}</span>
                                            <span className="font-mono text-sm font-bold text-foreground">{token.value.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${(token.value / Math.max(...tokenBreakdown.map(t => t.value))) * 100}%`,
                                                    backgroundColor: token.fill
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground">Total</span>
                                        <span className="font-mono text-sm font-bold text-primary">{metrics.totalTokens.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* TTFT Distribution */}
                        <div className="instrument-card p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                                TTFT Distribution
                            </h3>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ttftDistribution} layout="vertical" margin={{ left: 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" width={70} style={{ fontSize: "12px" }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                            contentStyle={{
                                                background: "var(--card)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "8px"
                                            }}
                                        />
                                        <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Provider Performance */}
                        <div className="instrument-card p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                Provider Performance
                            </h3>
                            <div className="space-y-4">
                                {providerMetrics.map((provider, idx) => (
                                    <div key={idx} className="p-4 bg-secondary/50 rounded-lg border border-border">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: provider.fill }} />
                                                <span className="font-semibold text-foreground capitalize">{provider.name}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{provider.calls} calls</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-muted-foreground">Cost:</span>
                                                <span className="ml-2 font-mono font-bold text-foreground">${provider.cost.toFixed(4)}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Avg Latency:</span>
                                                <span className="ml-2 font-mono font-bold text-foreground">{formatLatency(provider.avgLatency)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
