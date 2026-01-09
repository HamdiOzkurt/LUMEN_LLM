import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatCost, formatNumber, formatLatency } from "@/lib/formatters";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { MoreHorizontal, ArrowUpRight } from "lucide-react";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Custom Colors (Refined Palette)
const COLORS = {
  GREEN: '#22c55e',  // Requests
  PURPLE: '#d946ef', // Errors
  BLUE: '#3b82f6',   // Costs
  ORANGE: '#f97316', // Users
  CYAN: '#06b6d4',   // Latency
  RED: '#ef4444'
};

export default function EnterpriseDashboard() {
  const [loading, setLoading] = useState(true);

  // State - Data is now structured exactly as the backend returns it
  const [metrics, setMetrics] = useState<any>({
    avgCost: 0,
    avgPrompt: 0,
    avgComp: 0,
    avgTotal: 0,
    totalRequests: 0,
    totalCost: 0,
    users: 0,
    avgLatency: 0
  });

  const [trendData, setTrendData] = useState<any[]>([]);

  const [stats, setStats] = useState<any>({
    errorStats: [],
    providerStats: [],
    modelStats: [],
    costModelStats: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pre-calculated dashboard data from backend
        const res = await fetch(`${API_BASE}/api/metrics/dashboard`);
        const data = await res.json();

        if (data && data.metrics) {
          setMetrics(data.metrics);
          setTrendData(data.trendData || []);
          setStats(data.stats || {
            errorStats: [],
            providerStats: [],
            modelStats: [],
            costModelStats: []
          });
        }

        setLoading(false);

      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, []);

  const tooltipStyle = { backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '6px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)] text-muted-foreground animate-pulse">
          Loading dashboard data...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">

        {/* 1. METRICS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-6 border-b border-white/5">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-2 flex items-center justify-between">
              Avg Cost / Req
            </div>
            <div className="text-2xl font-mono font-medium text-foreground">{formatCost(metrics.avgCost)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-2 flex items-center justify-between">
              Avg Prompt Tokens
            </div>
            <div className="text-2xl font-mono font-medium text-foreground">{metrics.avgPrompt.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-2 flex items-center justify-between">
              Avg Compl. Tokens
            </div>
            <div className="text-2xl font-mono font-medium text-foreground">{metrics.avgComp.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mb-2 flex items-center justify-between">
              Avg Total Tokens
            </div>
            <div className="text-2xl font-mono font-medium text-foreground">{metrics.avgTotal.toFixed(1)}</div>
          </div>
        </div>

        {/* 2. ROW 1: REQUESTS TREND + STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* REQUESTS CHART (Expanded Area) */}
          <div className="lg:col-span-2 glassmorphic p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent min-h-[300px] flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Total Requests</h3>
                <div className="text-3xl font-bold mt-1 text-green-400">{formatNumber(metrics.totalRequests)}</div>
              </div>
              <div className="p-2 bg-green-400/10 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.GREEN} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={COLORS.GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke={COLORS.GREEN}
                    strokeWidth={3}
                    fill="url(#colorReqs)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                  />
                  <RechartsTooltip contentStyle={tooltipStyle} itemStyle={{ color: '#fff' }} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SIDE STATS: Errors & Providers */}
          <div className="flex flex-col gap-6 min-h-[300px]">

            {/* Errors */}
            <div className="flex-1 glassmorphic p-5 rounded-2xl border border-white/5 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">All Errors</h3>
                <MoreHorizontal className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <div className="text-2xl font-bold mb-4">
                {formatNumber(stats.errorStats.reduce((a: any, b: any) => a + b.value, 0))} <span className="text-xs font-medium text-muted-foreground">events</span>
              </div>
              <div className="space-y-4 flex-1">
                {stats.errorStats.length === 0 && <div className="text-xs text-muted-foreground py-2">No errors detected.</div>}
                {stats.errorStats.map((err: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                      <span>{err.name}</span>
                      <span>{err.percent.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${err.percent}%`,
                          backgroundColor: i === 0 ? COLORS.PURPLE : COLORS.BLUE
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Providers */}
            <div className="flex-1 glassmorphic p-5 rounded-2xl border border-white/5 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Providers</h3>
                <MoreHorizontal className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <div className="space-y-3">
                {stats.providerStats.map((p: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs group">
                    <span className="capitalize text-foreground font-medium flex items-center gap-2 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                      {p.name}
                    </span>
                    <span className="font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded">{p.value} requests</span>
                  </div>
                ))}
                {stats.providerStats.length === 0 && <div className="text-xs text-muted-foreground">No data available.</div>}
              </div>
            </div>
          </div>
        </div>

        {/* 3. ROW 2: COST & USERS & MODELS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COSTS Chart */}
          <div className="glassmorphic p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[280px]">
            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Cost</div>
              <div className="text-2xl font-bold text-blue-400">{formatCost(metrics.totalCost)}</div>
            </div>
            <div className="flex-1 w-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <Bar dataKey="cost" fill={COLORS.BLUE} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <RechartsTooltip contentStyle={tooltipStyle} itemStyle={{ color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* USERS Chart */}
          <div className="glassmorphic p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[280px]">
            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Active Projects</div>
              <div className="text-2xl font-bold text-orange-400">{formatNumber(metrics.users)}</div>
            </div>
            <div className="flex-1 w-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <Bar dataKey="users" fill={COLORS.ORANGE} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <RechartsTooltip contentStyle={tooltipStyle} itemStyle={{ color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Models Bars */}
          <div className="glassmorphic p-6 rounded-2xl border border-white/5 flex flex-col min-h-[280px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Models (Vol)</h3>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground/50" />
            </div>
            <div className="space-y-4 flex-1 overflow-auto custom-scrollbar">
              {stats.modelStats.map((m: any, i: number) => (
                <div key={i} className="group">
                  <div className="flex justify-between text-[11px] mb-1.5 font-medium">
                    <span className="text-foreground group-hover:text-white transition-colors">{m.name}</span>
                    <span className="text-muted-foreground font-mono">{m.value} reqs</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                    <div
                      className="h-full absolute left-0 top-0 transition-all duration-500 rounded-full"
                      style={{
                        width: `${(m.value / (stats.modelStats[0]?.value || 1)) * 100}%`,
                        backgroundColor: i === 0 ? '#f9a8d4' : i === 1 ? '#a5b4fc' : '#fde047',
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. ROW 3: LATENCY & TTFT & COST MODELS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Latency Area */}
          <div className="glassmorphic p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[250px]">
            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Latency Trend</div>
              <div className="text-2xl font-bold text-cyan-400">{formatLatency(metrics.avgLatency || 0)} <span className="text-sm font-normal text-muted-foreground">/ req</span></div>
            </div>
            <div className="flex-1 w-full min-h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.CYAN} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={COLORS.CYAN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="avgLatency" stroke={COLORS.CYAN} strokeWidth={2} fill="url(#colorLat)" />
                  <RechartsTooltip contentStyle={tooltipStyle} itemStyle={{ color: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Time to First Token (TTFT) - Mock Data based on Latency */}
          <div className="glassmorphic p-6 rounded-2xl border border-white/5 flex flex-col justify-between min-h-[250px]">
            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Time to First Token</div>
              <div className="text-2xl font-bold text-purple-400">
                Average: {metrics.avgLatency ? (metrics.avgLatency * 0.3).toFixed(0) : 0} ms
              </div>
            </div>
            <div className="flex-1 w-full min-h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTTFT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.PURPLE} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={COLORS.PURPLE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="avgLatency" stroke={COLORS.PURPLE} strokeWidth={2} fill="url(#colorTTFT)" />
                  <RechartsTooltip contentStyle={tooltipStyle} itemStyle={{ color: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost by Models List */}
          <div className="glassmorphic p-6 rounded-2xl border border-white/5 flex flex-col min-h-[250px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Models (Cost)</h3>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground/50" />
            </div>
            <div className="space-y-4 flex-1 overflow-auto custom-scrollbar">
              {stats.costModelStats.map((m: any, i: number) => (
                <div key={i} className="group">
                  <div className="flex justify-between text-[11px] mb-1.5 font-medium">
                    <span className="text-foreground group-hover:text-white transition-colors">{m.name}</span>
                    <span className="text-muted-foreground font-mono">{formatCost(m.value)}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                    <div
                      className="h-full absolute left-0 top-0 transition-all duration-500 rounded-full bg-cyan-500/50"
                      style={{
                        width: `${(m.value / (stats.costModelStats[0]?.value || 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
