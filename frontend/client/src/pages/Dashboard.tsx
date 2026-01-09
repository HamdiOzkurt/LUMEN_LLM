import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Activity, AlertCircle } from "lucide-react";

// --- MOCK DATA GENERATOR ---
const generateMockData = () => {
    const dates = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    const requests = dates.map(date => ({
        date,
        success: Math.floor(Math.random() * 500) + 1200,
        error: Math.floor(Math.random() * 50) + 10
    }));

    const latencyTrend = dates.map(date => ({
        date,
        value: (Math.random() * 0.5 + 0.8).toFixed(3)
    }));

    const costs = dates.map(date => ({
        date,
        amount: Math.random() * 5 + 2
    }));

    return { requests, latencyTrend, costs };
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MODEL_COLORS: Record<string, string> = {
    'gemini-2.5-flash': '#3b82f6',
    'gemma3:4b': '#8b5cf6',
    'gpt-4': '#10b981',
    'default': '#64748b'
};

const ERROR_COLORS = {
    '400': '#06b6d4',
    '401': '#a855f7',
    '500': '#ef4444',
    '429': '#f59e0b'
};

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '1m' | '3m'>('3m');
    const [data, setData] = useState<any>({
        requests: [],
        errors: [],
        topModels: [],
        costs: [],
        modelCosts: [],
        latencyTrend: [],
        totalRequests: 0,
        totalErrors: 0,
        totalCost: 0,
        avgLatency: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [logsRes] = await Promise.all([
                    fetch(`${API_BASE}/api/logs?limit=5000`),
                ]);
                const logsData = await logsRes.json();
                const logs = logsData.logs || [];

                const mock = generateMockData();

                const errorsByCode: any = { '429': 177, '500': 23, '401': 12 };
                const modelStats: any = {
                    'gemini-2.5-flash': { requests: 8432, cost: 12.45 },
                    'gemma3:4b': { requests: 5120, cost: 0 },
                    'gpt-4': { requests: 2100, cost: 45.20 },
                    'claude-3-opus': { requests: 850, cost: 21.00 }
                };

                let totalCost = 0;
                let totalLatency = 0;

                logs.forEach((log: any) => {
                    totalCost += log.cost || 0;
                    totalLatency += log.duration || 0;
                });

                const mockTotalRequests = mock.requests.reduce((acc, curr) => acc + curr.success + curr.error, 0);
                const mockTotalCost = mock.costs.reduce((acc, curr) => acc + curr.amount, 0);

                const finalTotalRequests = mockTotalRequests + logs.length;
                const finalTotalCost = mockTotalCost + totalCost;

                const errors = Object.entries(errorsByCode).map(([name, value]) => ({
                    name, value: value as number, color: ERROR_COLORS[name as keyof typeof ERROR_COLORS] || '#94a3b8'
                }));
                const totalErrors = errors.reduce((acc, curr) => acc + curr.value, 0);

                const topModels = Object.entries(modelStats).map(([name, stats]: any) => ({
                    name, requests: stats.requests, color: MODEL_COLORS[name] || MODEL_COLORS.default,
                    percent: (stats.requests / finalTotalRequests) * 100
                })).sort((a: any, b: any) => b.requests - a.requests).slice(0, 5);

                const modelCosts = Object.entries(modelStats).map(([name, stats]: any) => ({
                    name, cost: stats.cost, color: MODEL_COLORS[name] || MODEL_COLORS.default,
                    percent: (stats.cost / (finalTotalCost || 1)) * 100
                })).sort((a: any, b: any) => b.cost - a.cost);

                setData({
                    requests: mock.requests,
                    errors,
                    topModels,
                    costs: mock.costs,
                    modelCosts,
                    latencyTrend: mock.latencyTrend,
                    totalRequests: finalTotalRequests,
                    totalErrors,
                    totalCost: finalTotalCost,
                    avgLatency: 1.245
                });

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#1e1e24] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 shadow-2xl z-50">
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] mb-1">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill || entry.stroke }} />
                            <span className="font-mono text-gray-700 dark:text-gray-200">
                                {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 4 }) : entry.value}
                                {entry.name === 'Latency' ? 's' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="h-[60vh] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Activity className="w-6 h-6 text-primary" />
                    Dashboard
                </h1>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 dark:bg-[#16161A] border border-gray-200 dark:border-white/5 rounded-lg p-1">
                        {(['24h', '7d', '1m', '3m'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${timeRange === range
                                        ? 'bg-white dark:bg-primary text-gray-900 dark:text-white shadow-sm dark:shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5'
                                    }`}
                            >
                                {range.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Requests - Stacked Bar Chart */}
                <div className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-gray-300 dark:hover:border-white/10 transition-colors shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Requests</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1 font-mono tracking-tight">{data.totalRequests.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 text-[10px]">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Success</span>
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400"><div className="w-2 h-2 rounded-full bg-red-500" /> Error</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.requests} barGap={0}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05, className: 'text-gray-900 dark:text-white' }} />
                            <Bar dataKey="success" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={20} />
                            <Bar dataKey="error" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Errors - Donut with Custom Legend */}
                <div className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Error Distribution</h3>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex items-center h-[200px]">
                        <div className="flex-1 h-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.errors.length ? data.errors : [{ name: 'None', value: 1, color: '#e5e7eb' }]}
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {(data.errors.length ? data.errors : [{ name: 'None', value: 1, color: '#e5e7eb' }]).map((e: any, i: number) => (
                                            <Cell key={i} fill={e.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalErrors}</span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Errors</span>
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="w-32 space-y-2">
                            {data.errors.map((e: any) => (
                                <div key={e.name} className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                                        <span className="text-gray-500 dark:text-gray-400">{e.name}</span>
                                    </div>
                                    <span className="font-mono text-gray-700 dark:text-white">{e.value}</span>
                                </div>
                            ))}
                            {data.errors.length === 0 && <span className="text-xs text-gray-500">No errors recorded</span>}
                        </div>
                    </div>
                </div>

                {/* 3. Top Models - Horizontal Progress Bars */}
                <div className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-6">Top Models by Volume</h3>
                    <div className="space-y-5">
                        {data.topModels.map((model: any, idx: number) => (
                            <div key={idx} className="group">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-gray-900 dark:text-white font-medium">{model.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400 font-mono">{model.requests.toLocaleString()} req</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                                        style={{ width: `${model.percent}%`, backgroundColor: model.color }}
                                    >
                                        <div className="absolute inset-0 bg-white/20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Costs - Gradient Area Chart */}
                <div className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Estimated Cost</h3>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1 font-mono tracking-tight">${data.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={data.costs}>
                            <defs>
                                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" vertical={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="url(#costGradient)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 5. Cost by Model - Horizontal Bars */}
                <div className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Cost by Model</h3>
                        <button className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors uppercase font-bold tracking-wider">Show All</button>
                    </div>
                    <div className="space-y-4">
                        {data.modelCosts.map((model: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold p-1.5 rounded-md min-w-[24px] text-center ${idx === 0
                                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500'
                                        : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500'
                                    }`}>
                                    {idx + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600 dark:text-gray-300">{model.name}</span>
                                        <span className="text-gray-900 dark:text-white font-mono font-medium">${model.cost.toFixed(2)}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${model.percent}%`, backgroundColor: model.color }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. Latency - Area Trend Chart */}
                <div className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none">
                    <div className="mb-4 flex justify-between items-end">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Average Latency (Trend)</h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-mono tracking-tight">{data.avgLatency.toFixed(3)}s <span className="text-sm text-gray-500 dark:text-gray-600 font-sans font-normal">avg</span></p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <AreaChart data={data.latencyTrend}>
                            <defs>
                                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" vertical={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#06b6d4"
                                fill="url(#latencyGradient)"
                                strokeWidth={2}
                                name="Latency"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </DashboardLayout>
    );
}
