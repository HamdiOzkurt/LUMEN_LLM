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
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { TrendingUp, Clock, DollarSign, CheckCircle2, Activity, Filter, Calendar, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MODEL_COLORS: Record<string, string> = {
    'gemini-2.5-flash': '#8b5cf6',
    'ollama-llama3': '#06b6d4',
    'gpt-4': '#10b981',
    'claude-3-opus': '#f43f5e',
    'o1': '#f59e0b',
    'deepseek': '#ec4899',
    'default': '#64748b'
};

interface MetricCard {
    label: string;
    value: string | number;
    subtext?: string;
    icon: React.ReactNode;
    color: string;
}

interface DashboardMetrics {
    totalRequests: number;
    totalCost: number;
    avgLatency: number;
    p99Latency: number;
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
        p99Latency: 0,
        avgTTFT: 0,
        successRate: 0,
        totalTokens: 0,
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalReasoningTokens: 0,
    });

    const [requestTrends, setRequestTrends] = useState<any[]>([]);
    const [latencyVsTokens, setLatencyVsTokens] = useState<any[]>([]);
    const [costPerKTokens, setCostPerKTokens] = useState<any[]>([]);
    const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const hoursMap = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 };
                const hours = hoursMap[timeRange];

                const [trendsRes, logsRes, perfRes] = await Promise.all([
                    fetch(`${API_BASE}/api/metrics/timeseries-by-model?hours=${hours}`),
                    fetch(`${API_BASE}/api/logs?limit=2000`),
                    fetch(`${API_BASE}/api/metrics/by-provider`)
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
                const latencies: number[] = [];

                const providerCosts: Record<string, { cost: number; tokens: number }> = {};
                const latencyTokenData: any[] = [];

                logs.forEach((log: any) => {
                    totalCost += log.cost || 0;
                    const latency = log.duration || 0;
                    totalLatency += latency;
                    totalTTFT += log.ttft || latency;
                    totalPromptTokens += log.promptTokens || 0;
                    totalCompletionTokens += log.completionTokens || 0;
                    totalReasoningTokens += log.reasoningTokens || 0;
                    latencies.push(latency);

                    if (log.status === 'success') successCount++;

                    // Latency vs Tokens scatter
                    latencyTokenData.push({
                        x: log.totalTokens || 0,
                        y: latency,
                        fill: MODEL_COLORS[log.model] || MODEL_COLORS['default']
                    });

                    // Provider cost per 1k tokens
                    if (!providerCosts[log.provider]) {
                        providerCosts[log.provider] = { cost: 0, tokens: 0 };
                    }
                    providerCosts[log.provider].cost += log.cost || 0;
                    providerCosts[log.provider].tokens += log.totalTokens || 0;
                });

                // Calculate p99 latency
                const sortedLatencies = [...latencies].sort((a, b) => a - b);
                const p99Index = Math.ceil(sortedLatencies.length * 0.99) - 1;
                const p99Latency = sortedLatencies[p99Index] || 0;

                const totalRequests = logs.length;
                const totalTokens = totalPromptTokens + totalCompletionTokens + totalReasoningTokens;

                setMetrics({
                    totalRequests,
                    totalCost,
                    avgLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
                    p99Latency,
                    avgTTFT: totalRequests > 0 ? totalTTFT / totalRequests : 0,
                    successRate: totalRequests > 0 ? ((successCount / totalRequests) * 100) : 0,
                    totalTokens,
                    totalPromptTokens,
                    totalCompletionTokens,
                    totalReasoningTokens,
                });

                // Cost per 1k tokens
                const costData = Object.entries(providerCosts).map(([provider, data]) => ({
                    name: provider,
                    costPer1kTokens: data.tokens > 0 ? (data.cost / (data.tokens / 1000)) : 0,
                    fill: MODEL_COLORS[provider] || MODEL_COLORS['default']
                }));
                setCostPerKTokens(costData);

                setLatencyVsTokens(latencyTokenData);
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
    }, [timeRange]);

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
            subtext: `p99: ${formatLatency(metrics.p99Latency)}`,
            icon: <Clock className="w-5 h-5" />,
            color: "from-purple-500 to-purple-600"
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
                    <p className="text-sm text-muted-foreground mt-1">
                        Real-time LLM monitoring and performance analytics
                    </p>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center gap-2 bg-card border border-border rounded-[0.75rem] p-1">
                    {(['1h', '24h', '7d', '30d'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded-[0.5rem] text-sm font-medium transition-all ${
                                timeRange === range
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {metricCards.map((card, idx) => (
                            <div key={idx} className="instrument-card p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-[0.5rem] bg-gradient-to-br ${card.color} text-white`}>
                                        {card.icon}
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1 label-silence">{card.label}</p>
                                <p className="text-2xl font-bold text-foreground metrics-display">{card.value}</p>
                                {card.subtext && (
                                    <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Requests Over Time */}
                        <div className="lg:col-span-2 instrument-card p-6">
                            <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-2 h-5 bg-primary rounded-full"></span>
                                Requests Over Time
                            </h3>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={requestTrends} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                        <XAxis dataKey="name" stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                background: "var(--card)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "0.75rem",
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

                        {/* Cost per 1k Tokens */}
                        <div className="instrument-card p-6">
                            <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-2 h-5 bg-emerald-500 rounded-full"></span>
                                Cost per 1k Tokens
                            </h3>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={costPerKTokens} layout="vertical" margin={{ left: 80 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={true} vertical={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" width={70} style={{ fontSize: "11px" }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                            contentStyle={{
                                                background: "var(--card)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "0.75rem"
                                            }}
                                            formatter={(value) => `$${(value as number).toFixed(4)}`}
                                        />
                                        <Bar dataKey="costPer1kTokens" radius={[0, 4, 4, 0]}>
                                            {costPerKTokens.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Latency vs Token Count */}
                        <div className="instrument-card p-6">
                            <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-2 h-5 bg-cyan-500 rounded-full"></span>
                                Latency vs Token Count
                            </h3>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="x" name="Tokens" stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                                        <YAxis dataKey="y" name="Latency (ms)" stroke="var(--muted-foreground)" style={{ fontSize: "11px" }} />
                                        <Tooltip
                                            cursor={{ strokeDasharray: '3 3' }}
                                            contentStyle={{
                                                background: "var(--card)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "0.75rem"
                                            }}
                                            formatter={(value) => (value as number).toFixed(0)}
                                        />
                                        <Scatter name="Requests" data={latencyVsTokens}>
                                            {latencyVsTokens.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Token Breakdown */}
                        <div className="instrument-card p-6">
                            <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
                                <span className="w-2 h-5 bg-purple-500 rounded-full"></span>
                                Token Usage
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Prompt Tokens</span>
                                        <span className="font-mono text-sm font-bold text-foreground">{metrics.totalPromptTokens.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                                            style={{
                                                width: `${(metrics.totalPromptTokens / Math.max(metrics.totalPromptTokens, metrics.totalCompletionTokens, metrics.totalReasoningTokens, 1)) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Completion Tokens</span>
                                        <span className="font-mono text-sm font-bold text-foreground">{metrics.totalCompletionTokens.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                                            style={{
                                                width: `${(metrics.totalCompletionTokens / Math.max(metrics.totalPromptTokens, metrics.totalCompletionTokens, metrics.totalReasoningTokens, 1)) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {metrics.totalReasoningTokens > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Reasoning Tokens</span>
                                            <span className="font-mono text-sm font-bold text-amber-400">{metrics.totalReasoningTokens.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                                                style={{
                                                    width: `${(metrics.totalReasoningTokens / Math.max(metrics.totalPromptTokens, metrics.totalCompletionTokens, metrics.totalReasoningTokens, 1)) * 100}%`
                                            }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground">Total</span>
                                        <span className="font-mono text-sm font-bold text-primary">{metrics.totalTokens.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
