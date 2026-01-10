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
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Activity, AlertCircle } from "lucide-react";

const MODEL_COLORS: Record<string, string> = {
    'gemini-2.5-flash': '#3b82f6',
    'gemma3:4b': '#8b5cf6',
    'gpt-4': '#10b981',
    'gpt-3.5-turbo': '#f59e0b',
    'claude-3-opus': '#ec4899',
    'default': '#64748b'
};

const ERROR_COLORS: Record<string, string> = {
    '400': '#06b6d4',
    '401': '#a855f7',
    '500': '#ef4444',
    '429': '#f59e0b',
    '404': '#f97316'
};

// Mock Data Generator
const generateMockDashboardData = (range: '24h' | '7d' | '1m' | '3m') => {
    let requests: any[] = [];
    let costs: any[] = [];
    let latencyTrend: any[] = [];
    let totalRequests = 1222;
    let totalCost = 31.00;

    if (range === '24h') {
        // Hourly data
        const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
        requests = hours.map(h => ({ date: h, success: Math.floor(Math.random() * 50) + 10, error: Math.floor(Math.random() * 5) }));
        costs = hours.map(h => ({ date: h, amount: Math.random() * 2 }));
        latencyTrend = hours.map(h => ({ date: h, value: 0.5 + Math.random() * 0.5 }));
        totalRequests = 340;
        totalCost = 8.50;
    } else if (range === '7d') {
        // Daily data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        requests = days.map(d => ({ date: d, success: Math.floor(Math.random() * 200) + 50, error: Math.floor(Math.random() * 10) }));
        costs = days.map(d => ({ date: d, amount: Math.random() * 10 + 2 }));
        latencyTrend = days.map(d => ({ date: d, value: 0.8 + Math.random() * 0.6 }));
        totalRequests = 1222;
        totalCost = 45.20;
    } else if (range === '1m') {
        // Weekly data (approx)
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        requests = weeks.map(w => ({ date: w, success: Math.floor(Math.random() * 1000) + 200, error: Math.floor(Math.random() * 50) }));
        costs = weeks.map(w => ({ date: w, amount: Math.random() * 50 + 10 }));
        latencyTrend = weeks.map(w => ({ date: w, value: 0.9 + Math.random() * 0.4 }));
        totalRequests = 4500;
        totalCost = 180.50;
    } else if (range === '3m') {
        // Monthly data
        const months = ['Oct', 'Nov', 'Dec', 'Jan'];
        requests = months.map(m => ({ date: m, success: Math.floor(Math.random() * 5000) + 1000, error: Math.floor(Math.random() * 200) }));
        costs = months.map(m => ({ date: m, amount: Math.random() * 200 + 50 }));
        latencyTrend = months.map(m => ({ date: m, value: 1.0 + Math.random() * 0.5 }));
        totalRequests = 15400;
        totalCost = 620.00;
    }

    return {
        requests,
        errors: [
            { name: '429 Rate Limit', value: Math.floor(totalRequests * 0.01), color: ERROR_COLORS['429'] },
            { name: '500 Server', value: Math.floor(totalRequests * 0.005), color: ERROR_COLORS['500'] },
            { name: '400 Bad Req', value: Math.floor(totalRequests * 0.002), color: ERROR_COLORS['400'] },
        ],
        topModels: [
            { name: 'gpt-4', requests: Math.floor(totalRequests * 0.4), color: MODEL_COLORS['gpt-4'], percent: 45 },
            { name: 'gemini-1.5-pro', requests: Math.floor(totalRequests * 0.3), color: MODEL_COLORS['gemini-2.5-flash'], percent: 32 },
            { name: 'claude-3-opus', requests: Math.floor(totalRequests * 0.2), color: MODEL_COLORS['claude-3-opus'], percent: 18 },
            { name: 'llama-3-70b', requests: Math.floor(totalRequests * 0.1), color: MODEL_COLORS['gemma3:4b'], percent: 5 },
        ],
        costs,
        modelCosts: [
            { name: 'gpt-4', cost: totalCost * 0.6, color: MODEL_COLORS['gpt-4'], percent: 60 },
            { name: 'claude-3-opus', cost: totalCost * 0.25, color: MODEL_COLORS['claude-3-opus'], percent: 25 },
            { name: 'gemini-1.5-pro', cost: totalCost * 0.12, color: MODEL_COLORS['gemini-2.5-flash'], percent: 12 },
            { name: 'gpt-3.5-turbo', cost: totalCost * 0.03, color: MODEL_COLORS['gpt-3.5-turbo'], percent: 3 },
        ],
        latencyTrend,
        totalRequests,
        totalErrors: Math.floor(totalRequests * 0.017),
        totalCost,
        avgLatency: 0.95
    };
};

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '1m' | '3m'>('7d');
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        setLoading(true); // Show loading spinner on change
        // Simulate API call
        setTimeout(() => {
            setData(generateMockDashboardData(timeRange));
            setLoading(false);
        }, 600);
    }, [timeRange]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-[#1e1e24] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 shadow-2xl z-50">
                    <p className="text-gray-700 dark:text-gray-400 text-[10px] mb-1 font-semibold">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill || entry.stroke }} />
                            <span className="font-mono text-gray-900 dark:text-gray-200 font-medium">
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

    if (loading || !data) {
        return (
            <DashboardLayout>
                <div className="h-[60vh] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    const axisColor = '#334155';

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
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5'
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
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-400">Total Requests</h3>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1 font-mono tracking-tight">{data.totalRequests.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2 text-[10px]">
                            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Success</span>
                            <span className="flex items-center gap-1 text-red-700 dark:text-red-400 font-medium"><div className="w-2 h-2 rounded-full bg-red-500" /> Error</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.requests} barGap={0}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: axisColor, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', opacity: 0.05, className: 'text-gray-900 dark:text-white' }} />
                            <Bar dataKey="success" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={20} />
                            <Bar dataKey="error" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Errors - Donut */}
                <div className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-400">Error Distribution</h3>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex items-center h-[200px]">
                        <div className="flex-1 h-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.errors}
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.errors.map((e: any, i: number) => (
                                            <Cell key={i} fill={e.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{data.totalErrors}</span>
                                <span className="text-[10px] text-gray-600 dark:text-gray-500 font-bold uppercase tracking-wider">Errors</span>
                            </div>
                        </div>
                        <div className="w-32 space-y-2">
                            {data.errors.map((e: any) => (
                                <div key={e.name} className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                                        <span className="text-gray-700 dark:text-gray-400 font-medium">{e.name}</span>
                                    </div>
                                    <span className="font-mono font-bold text-gray-900 dark:text-white">{e.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Top Models */}
                <div className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-400 mb-6">Top Models by Volume</h3>
                    <div className="space-y-5">
                        {data.topModels.map((model: any, idx: number) => (
                            <div key={idx} className="group">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-gray-900 dark:text-white font-bold">{model.name}</span>
                                    <span className="text-gray-600 dark:text-gray-400 font-mono font-medium">{model.requests.toLocaleString()} req</span>
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

                {/* 4. Costs */}
                <div className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-400">Estimated Cost</h3>
                        <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 font-mono tracking-tight">${data.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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

                {/* 5. Cost by Model */}
                <div className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-400">Cost by Model</h3>
                    </div>
                    <div className="space-y-4">
                        {data.modelCosts.map((model: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold p-1.5 rounded-md min-w-[24px] text-center ${idx === 0
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500'
                                    : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-500'
                                    }`}>
                                    {idx + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{model.name}</span>
                                        <span className="text-gray-900 dark:text-white font-mono font-bold">${model.cost.toFixed(2)}</span>
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

                {/* 6. Latency */}
                <div className="bg-white dark:bg-[#16161A] border border-gray-200 dark:border-white/5 rounded-xl p-6 shadow-sm dark:shadow-none">
                    <div className="mb-4 flex justify-between items-end">
                        <div>
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-400">Average Latency (Trend)</h3>
                            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 font-mono tracking-tight">{data.avgLatency.toFixed(3)}s <span className="text-sm text-gray-600 dark:text-gray-500 font-sans font-normal">avg</span></p>
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
