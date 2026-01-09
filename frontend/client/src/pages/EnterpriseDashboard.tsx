import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatNumber } from "@/lib/formatters";
import {
  AreaChart, Area, XAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, BarChart, Bar
} from 'recharts';
import { Zap, Activity, Clock, CheckCircle } from "lucide-react";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialMetrics = {
  totalCost: 0,
  totalTokens: 0,
  avgLatency: 0,
  successRate: 100
};

export default function EnterpriseDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(initialMetrics);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [providerData, setProviderData] = useState<any[]>([]);
  const [modelCostData, setModelCostData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/metrics/dashboard`);
        const data = await res.json();

        if (data && data.metrics) {
          setMetrics({
            totalCost: data.metrics.totalCost || 0,
            totalTokens: data.metrics.totalRequests ? (data.metrics.avgTotal * data.metrics.totalRequests) : 0,
            avgLatency: data.metrics.avgLatency || 0,
            successRate: 100 // Backend currently doesn't return this in 'metrics', usually calculated from errors
          });

          // 1. Trend Data (Daily Requests & Latency)
          if (data.trendData) {
            // Backend returns date as DD/MM/YYYY, let's keep it or format nicely
            const mappedTrend = data.trendData.map((d: any) => ({
              time: d.date.split('/').slice(0, 2).join('/'), // Show DD/MM
              requests: d.requests,
              avgLatency: Math.round(d.avgLatency || 0),
              cost: d.cost
            }));
            setTrendData(mappedTrend);
          }

          // 2. Provider Data (For Pie Chart)
          if (data.stats && data.stats.providerStats) {
            const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
            const mappedProviders = data.stats.providerStats.map((p: any, index: number) => ({
              name: p.name,
              value: p.value,
              color: COLORS[index % COLORS.length]
            }));
            setProviderData(mappedProviders);
          }

          // 3. Model Cost Data (For Bar Chart - replacing errors for now as we have real data for this)
          if (data.stats && data.stats.costModelStats) {
            const mappedModelCosts = data.stats.costModelStats.map((m: any) => ({
              name: m.name,
              value: m.value
            }));
            setModelCostData(mappedModelCosts);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const tooltipStyle = {
    backgroundColor: '#11131f',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#f3f4f6',
    fontSize: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
  };

  if (loading) return <DashboardLayout><div className="flex h-[80vh] items-center justify-center text-gray-500">Loading metrics...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">LLM Observability Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time insights into your LLM infrastructure performance and costs.</p>
        </div>

        {/* 1. HERO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* COST */}
          <div className="bg-[#11131f] rounded-xl border border-white/5 p-6 h-[140px] relative overflow-hidden flex flex-col justify-between group hover:border-blue-500/20 transition-all">
            <div className="absolute top-3 right-3 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
              <Zap className="w-16 h-16" />
            </div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest z-10">TOTAL COST</div>
            <div className="z-10">
              <div className="text-4xl font-bold text-white tracking-tight">${metrics.totalCost?.toFixed(4)}</div>
            </div>
          </div>

          {/* TOKENS */}
          <div className="bg-[#11131f] rounded-xl border border-white/5 p-6 h-[140px] relative overflow-hidden flex flex-col justify-between group hover:border-cyan-500/20 transition-all">
            <div className="absolute top-3 right-3 text-cyan-500/10 group-hover:text-cyan-500/20 transition-colors">
              <Activity className="w-16 h-16" />
            </div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest z-10">TOTAL TOKENS</div>
            <div className="z-10">
              <div className="text-4xl font-bold text-white tracking-tight">{formatNumber(metrics.totalTokens)}</div>
            </div>
          </div>

          {/* LATENCY */}
          <div className="bg-[#11131f] rounded-xl border border-white/5 p-6 h-[140px] relative overflow-hidden flex flex-col justify-between group hover:border-green-500/20 transition-all">
            <div className="absolute top-3 right-3 text-green-500/10 group-hover:text-green-500/20 transition-colors">
              <Clock className="w-16 h-16" />
            </div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest z-10">AVG LATENCY</div>
            <div className="z-10">
              <div className="text-4xl font-bold text-white tracking-tight">{Math.round(metrics.avgLatency)}ms</div>
            </div>
          </div>

          {/* SUCCESS */}
          <div className="bg-[#11131f] rounded-xl border border-white/5 p-6 h-[140px] relative overflow-hidden flex flex-col justify-between group hover:border-yellow-500/20 transition-all">
            <div className="absolute top-3 right-3 text-yellow-500/10 group-hover:text-yellow-500/20 transition-colors">
              <CheckCircle className="w-16 h-16" />
            </div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest z-10">SUCCESS RATE</div>
            <div className="z-10">
              <div className="text-4xl font-bold text-white tracking-tight">{metrics.successRate}%</div>
            </div>
          </div>
        </div>

        {/* 2. CHARTS UPPER ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[380px]">
          {/* DAILY REQUEST VOLUME */}
          <div className="bg-[#11131f] rounded-xl border border-white/5 p-6 flex flex-col">
            <div className="flex items-center mb-6">
              <div className="w-1 h-4 bg-[#6366f1] rounded-full mr-3 shadow-[0_0_8px_#6366f1]"></div>
              <h3 className="text-sm font-semibold text-gray-200">Daily Request Volume (Last 14 Days)</h3>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={10} />
                  <RechartsTooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={3} fill="url(#gPurple)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PROVIDER DISTRIBUTION */}
          <div className="bg-[#11131f] rounded-xl border border-white/5 p-6 flex flex-col">
            <div className="flex items-center mb-6">
              <div className="w-1 h-4 bg-[#06b6d4] rounded-full mr-3 shadow-[0_0_8px_#06b6d4]"></div>
              <h3 className="text-sm font-semibold text-gray-200">Requests by Provider</h3>
            </div>
            <div className="flex-1 w-full min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={providerData} innerRadius={80} outerRadius={105} paddingAngle={4} dataKey="value" stroke="none">
                    {providerData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Legend
                    layout="vertical" verticalAlign="middle" align="right" iconType="circle" iconSize={8}
                    formatter={(val) => <span className="text-gray-400 text-xs ml-2">{val}</span>}
                  />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Activity className="w-8 h-8 text-white/5" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. CHARTS LOWER ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[320px]">
          {/* AVG LATENCY TREND */}
          <div className="bg-[#11131f] rounded-xl border border-white/5 p-6 flex flex-col">
            <div className="flex items-center mb-6">
              <div className="w-1 h-4 bg-[#10b981] rounded-full mr-3 shadow-[0_0_8px_#10b981]"></div>
              <h3 className="text-sm font-semibold text-gray-200">Average Latency Trend (ms)</h3>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={10} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="avgLatency" name="Avg Latency" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* COST BY MODEL */}
          <div className="bg-[#11131f] rounded-xl border border-white/5 p-6 flex flex-col">
            <div className="flex items-center mb-6">
              <div className="w-1 h-4 bg-[#ef4444] rounded-full mr-3 shadow-[0_0_8px_#ef4444]"></div>
              <h3 className="text-sm font-semibold text-gray-200">Total Cost by Model</h3>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelCostData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} dy={10} />
                  <RechartsTooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    formatter={(val: number) => [`$${val.toFixed(4)}`, 'Cost']}
                  />
                  <Bar dataKey="value" name="Cost ($)" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}